from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


TimeAgg = Literal["day", "month", "year"]


class UploadResponse(BaseModel):
    dataset_id: str
    variables: list[str]
    time_dim: str | None = None
    lat_dim: str | None = None
    lon_dim: str | None = None
    time_values: list[str] = Field(default_factory=list)


class ClimateDataRequest(BaseModel):
    dataset_id: str
    variable: str
    time_index: int | None = None
    agg: TimeAgg | None = None


class MapDataRequest(BaseModel):
    dataset_id: str
    variable: str
    time_index: int | None = None
    downsample: int = 2


class TimeSeriesRequest(BaseModel):
    dataset_id: str
    variable: str
    lat: float
    lon: float
    agg: TimeAgg | None = None


class CompareYearsRequest(BaseModel):
    dataset_id: str
    variable: str
    year_a: int
    year_b: int
    agg: TimeAgg = "year"

