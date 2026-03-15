export type UploadResponse = {
  dataset_id: string;
  variables: string[];
  time_dim: string | null;
  lat_dim: string | null;
  lon_dim: string | null;
  time_values: string[];
};

export type MapDataResponse = {
  dataset_id: string;
  variable: string;
  lat: (number | string)[];
  lon: (number | string)[];
  z: number[][];
  units?: string;
  long_name?: string;
};

export type TimeSeriesResponse = {
  dataset_id: string;
  variable: string;
  time: string[];
  value: (number | null)[];
  units?: string;
  long_name?: string;
};

export type CompareYearsResponse = {
  dataset_id: string;
  variable: string;
  year_a: number;
  year_b: number;
  mean_a: number;
  mean_b: number;
  delta: number;
  units?: string;
};

const API_BASE = "http://localhost:8000";

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function uploadDataset(file: File): Promise<UploadResponse> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/upload_dataset`, { method: "POST", body: fd });
  return j<UploadResponse>(res);
}

export async function getMapData(args: {
  dataset_id: string;
  variable: string;
  time_index?: number | null;
  downsample?: number;
}): Promise<MapDataResponse> {
  const res = await fetch(`${API_BASE}/get_map_data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args)
  });
  return j<MapDataResponse>(res);
}

export async function getTimeSeries(args: {
  dataset_id: string;
  variable: string;
  lat: number;
  lon: number;
  agg?: "day" | "month" | "year" | null;
}): Promise<TimeSeriesResponse> {
  const res = await fetch(`${API_BASE}/get_time_series`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args)
  });
  return j<TimeSeriesResponse>(res);
}

export async function compareYears(args: {
  dataset_id: string;
  variable: string;
  year_a: number;
  year_b: number;
  agg?: "day" | "month" | "year";
}): Promise<CompareYearsResponse> {
  const res = await fetch(`${API_BASE}/compare_years`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args)
  });
  return j<CompareYearsResponse>(res);
}

