from __future__ import annotations

from pathlib import Path

import orjson
import xarray as xr
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from .models import (
    ClimateDataRequest,
    CompareYearsRequest,
    MapDataRequest,
    TimeSeriesRequest,
    UploadResponse,
)
from .netcdf_service import DATA_DIR, STORE, compare_years, dataset_metadata, get_map_slice, get_time_series, open_dataset


app = FastAPI(
    title="Climate Analytics API",
    default_response_class=ORJSONResponse,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/upload_dataset", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename.lower().endswith(".nc"):
        raise HTTPException(status_code=400, detail="Please upload a NetCDF .nc file.")

    target = DATA_DIR / file.filename
    data = await file.read()
    target.write_bytes(data)

    info = STORE.register(target)
    try:
        ds = xr.open_dataset(info.path, decode_times=True, mask_and_scale=True)
        md = dataset_metadata(ds)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read NetCDF: {e}") from e
    finally:
        try:
            ds.close()
        except Exception:
            pass

    return UploadResponse(
        dataset_id=info.dataset_id,
        variables=md["variables"],
        time_dim=md["time_dim"],
        lat_dim=md["lat_dim"],
        lon_dim=md["lon_dim"],
        time_values=md["time_values"],
    )


@app.post("/get_climate_data")
def get_climate_data(req: ClimateDataRequest) -> dict:
    try:
        ds = open_dataset(req.dataset_id)
        md = dataset_metadata(ds)
        return {
            "dataset_id": req.dataset_id,
            "variable": req.variable,
            "metadata": md,
        }
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    finally:
        try:
            ds.close()
        except Exception:
            pass


@app.post("/get_map_data")
def get_map_data(req: MapDataRequest) -> dict:
    try:
        ds = open_dataset(req.dataset_id)
        payload = get_map_slice(ds, req.variable, req.time_index, req.downsample)
        return {"dataset_id": req.dataset_id, "variable": req.variable, **payload}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    finally:
        try:
            ds.close()
        except Exception:
            pass


@app.post("/get_time_series")
def get_time_series_api(req: TimeSeriesRequest) -> dict:
    try:
        ds = open_dataset(req.dataset_id)
        payload = get_time_series(ds, req.variable, req.lat, req.lon, req.agg)
        return {"dataset_id": req.dataset_id, "variable": req.variable, **payload}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    finally:
        try:
            ds.close()
        except Exception:
            pass


@app.post("/compare_years")
def compare_years_api(req: CompareYearsRequest) -> dict:
    try:
        ds = open_dataset(req.dataset_id)
        payload = compare_years(ds, req.variable, req.year_a, req.year_b, req.agg)
        return {"dataset_id": req.dataset_id, "variable": req.variable, **payload}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    finally:
        try:
            ds.close()
        except Exception:
            pass


@app.get("/debug/datasets")
def debug_datasets() -> dict:
    return {"datasets": [d.dataset_id for d in STORE._by_id.values()]}

