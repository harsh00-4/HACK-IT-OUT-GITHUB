from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import xarray as xr


DATA_DIR = Path(__file__).resolve().parents[2] / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _stable_dataset_id(path: Path) -> str:
    h = hashlib.sha256()
    h.update(str(path.resolve()).encode("utf-8"))
    h.update(str(path.stat().st_size).encode("utf-8"))
    h.update(str(int(path.stat().st_mtime)).encode("utf-8"))
    return h.hexdigest()[:12]


def _detect_dim_name(ds: xr.Dataset, candidates: list[str]) -> str | None:
    for name in candidates:
        if name in ds.dims or name in ds.coords:
            return name
    return None


def _to_jsonable_array(a: np.ndarray) -> list[Any]:
    if np.issubdtype(a.dtype, np.datetime64):
        return pd.to_datetime(a).astype("datetime64[ns]").astype(str).tolist()
    if a.dtype.kind in {"f", "i", "u"}:
        return a.astype(float).tolist()
    return a.astype(str).tolist()


@dataclass(frozen=True)
class DatasetInfo:
    dataset_id: str
    path: Path


class NetCDFStore:
    def __init__(self) -> None:
        self._by_id: dict[str, DatasetInfo] = {}

    def register(self, path: Path) -> DatasetInfo:
        dataset_id = _stable_dataset_id(path)
        info = DatasetInfo(dataset_id=dataset_id, path=path)
        self._by_id[dataset_id] = info
        return info

    def get(self, dataset_id: str) -> DatasetInfo:
        if dataset_id not in self._by_id:
            raise KeyError(f"Unknown dataset_id: {dataset_id}")
        return self._by_id[dataset_id]


STORE = NetCDFStore()


def open_dataset(dataset_id: str) -> xr.Dataset:
    info = STORE.get(dataset_id)
    # Keep this simple: open lazily; compute only requested slices.
    return xr.open_dataset(info.path, decode_times=True, mask_and_scale=True)


def dataset_metadata(ds: xr.Dataset) -> dict[str, Any]:
    time_dim = _detect_dim_name(ds, ["time", "Time", "valid_time", "t"])
    lat_dim = _detect_dim_name(ds, ["lat", "latitude", "y"])
    lon_dim = _detect_dim_name(ds, ["lon", "longitude", "x"])

    time_values: list[str] = []
    if time_dim and time_dim in ds.coords:
        try:
            time_values = _to_jsonable_array(ds[time_dim].values)
        except Exception:
            time_values = []

    variables = sorted([v for v in ds.data_vars.keys()])
    return {
        "variables": variables,
        "time_dim": time_dim,
        "lat_dim": lat_dim,
        "lon_dim": lon_dim,
        "time_values": time_values[:5000],
    }


def _select_var(ds: xr.Dataset, variable: str) -> xr.DataArray:
    if variable not in ds.data_vars:
        raise KeyError(f"Variable not found: {variable}")
    da = ds[variable]
    # Promote to float for consistent frontend rendering.
    if da.dtype.kind not in {"f", "i", "u"}:
        da = da.astype("float32", casting="unsafe")
    return da


def get_map_slice(
    ds: xr.Dataset,
    variable: str,
    time_index: int | None,
    downsample: int,
) -> dict[str, Any]:
    md = dataset_metadata(ds)
    time_dim, lat_dim, lon_dim = md["time_dim"], md["lat_dim"], md["lon_dim"]
    if not lat_dim or not lon_dim:
        raise ValueError("Dataset must contain lat/lon coordinates or dimensions.")

    da = _select_var(ds, variable)
    if time_dim and time_dim in da.dims and time_index is not None:
        da = da.isel({time_dim: int(time_index)})

    # Ensure 2D lat/lon output for heatmap-style rendering.
    if lat_dim in da.dims and lon_dim in da.dims:
        da2 = da
    else:
        # Try to align coords to dims.
        da2 = da.squeeze(drop=True)

    # Downsample for speed (simple stride).
    dsf = max(1, int(downsample))
    da2 = da2.isel({lat_dim: slice(None, None, dsf), lon_dim: slice(None, None, dsf)})

    lat = ds[lat_dim].values if lat_dim in ds.coords else np.arange(da2.sizes[lat_dim])
    lon = ds[lon_dim].values if lon_dim in ds.coords else np.arange(da2.sizes[lon_dim])
    lat = np.asarray(lat)[::dsf]
    lon = np.asarray(lon)[::dsf]

    z = np.asarray(da2.values)
    z = np.where(np.isfinite(z), z, np.nan)

    return {
        "lat": _to_jsonable_array(lat),
        "lon": _to_jsonable_array(lon),
        "z": z.astype(float).tolist(),
        "units": da.attrs.get("units"),
        "long_name": da.attrs.get("long_name") or da.attrs.get("standard_name"),
    }


def get_time_series(
    ds: xr.Dataset,
    variable: str,
    lat: float,
    lon: float,
    agg: str | None,
) -> dict[str, Any]:
    md = dataset_metadata(ds)
    time_dim, lat_dim, lon_dim = md["time_dim"], md["lat_dim"], md["lon_dim"]
    if not time_dim or not lat_dim or not lon_dim:
        raise ValueError("Dataset must contain time, lat, lon.")

    da = _select_var(ds, variable)

    if lat_dim in da.coords and lon_dim in da.coords:
        da = da.sel({lat_dim: float(lat), lon_dim: float(lon)}, method="nearest")
    else:
        # If lat/lon are dims but not coords, approximate by index.
        da = da.isel({lat_dim: int(lat), lon_dim: int(lon)})

    # Aggregate if requested.
    if agg in {"month", "year"}:
        da = da.resample({time_dim: agg}).mean()
    elif agg == "day":
        da = da.resample({time_dim: "1D"}).mean()

    t = ds[time_dim].values
    if time_dim in da.coords:
        t = da[time_dim].values

    y = np.asarray(da.values).astype(float)
    y = np.where(np.isfinite(y), y, np.nan)

    return {
        "time": _to_jsonable_array(np.asarray(t)),
        "value": y.tolist(),
        "units": da.attrs.get("units"),
        "long_name": da.attrs.get("long_name") or da.attrs.get("standard_name"),
    }


def compare_years(
    ds: xr.Dataset,
    variable: str,
    year_a: int,
    year_b: int,
    agg: str,
) -> dict[str, Any]:
    md = dataset_metadata(ds)
    time_dim = md["time_dim"]
    if not time_dim:
        raise ValueError("Dataset must contain time.")

    da = _select_var(ds, variable)
    time = pd.to_datetime(ds[time_dim].values)

    def _year_mean(y: int) -> float:
        mask = time.year == y
        if not mask.any():
            return float("nan")
        da_y = da.isel({time_dim: np.where(mask)[0]})
        return float(da_y.mean(skipna=True).compute().values)

    a = _year_mean(int(year_a))
    b = _year_mean(int(year_b))
    return {
        "year_a": int(year_a),
        "year_b": int(year_b),
        "mean_a": a,
        "mean_b": b,
        "delta": (b - a) if np.isfinite(a) and np.isfinite(b) else float("nan"),
        "units": da.attrs.get("units"),
    }

