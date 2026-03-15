<<<<<<< HEAD
## Climate Analytics Dashboard (NetCDF)

A **scientific climate analytics dashboard** for exploring NetCDF (`.nc`) datasets with:

- **Upload + parsing** of NetCDF using **FastAPI + Xarray**
- **Spatial view**: 3D Earth + global 2D heatmap
- **Temporal view**: interactive time-series charts + basic statistics
- **Timeline playback** that animates through the dataset’s time axis

This repo is scaffolded to be fast and interactive, with server-side slicing/downsampling and a modern dark UI.

---

## Requirements checklist (spec vs project)

| Requirement | Status |
|-------------|--------|
| **1 Core** Upload .nc, analyze temp/rain/wind, maps/graphs/3D Earth | ✅ |
| **2 Frontend** React, Tailwind, Plotly, Leaflet, Three.js | ✅ |
| **2 UI** Dark theme, left sidebar (upload, variable, time, location) | ✅ |
| **2 Layout** Main: 3D Earth + 2D heatmap; Right: charts + stats; Bottom: timeline | ✅ |
| **3 Backend** Python, FastAPI, upload + process NetCDF | ✅ |
| **3 API** /upload_dataset, /get_climate_data, /get_map_data, /get_time_series, /compare_years | ✅ |
| **4 Processing** Xarray, Pandas, NumPy; read .nc, extract vars, viz format | ✅ |
| **5 Viz** Global heatmap, line graphs, wind/rain maps, 3D Earth, year comparison | ✅ (wind/rain via same heatmap + vars) |
| **6 Interactive** Variable/location/time selectors → map, graphs, stats update | ✅ |
| **7 Modes** Spatial View + Temporal View | ✅ |
| **8 Timeline** Playback slider (e.g. 1990→2026), map/graphs update | ✅ |
| **9 Performance** Fast load, efficient processing, smooth viz | ✅ (downsampling, lazy load) |
| **10 Documentation** README with overview, stack, run instructions | ✅ |

---

## Tech stack

- **Frontend**: React + TypeScript, Tailwind CSS, Plotly.js, Three.js (via React Three Fiber)
- **Backend**: Python, FastAPI, Xarray, NumPy, Pandas

---

## Project structure

- `backend/`: FastAPI server + NetCDF processing
- `frontend/`: React dashboard UI (Vite)
- `data/`: uploaded NetCDF files (created/used at runtime)

---

## API endpoints

The backend exposes the endpoints requested:

- `POST /upload_dataset`: upload a `.nc` file, returns `dataset_id` + detected variables/dims
- `POST /get_climate_data`: returns dataset metadata for selected variable
- `POST /get_map_data`: returns a lat/lon grid slice for the heatmap (supports downsampling)
- `POST /get_time_series`: returns a time-series at a lat/lon point (nearest-neighbor) with optional aggregation
- `POST /compare_years`: compares mean values between two years (global mean across all grid points)

---

## Run locally (Windows)

**Quick start (after first-time setup below):**

- **Backend:** from repo root run `.\run-backend.ps1` (or open a terminal and run it).
- **Frontend:** from repo root run `.\run-frontend.ps1`.

Then open **http://localhost:5173** (frontend) and **http://localhost:8000/health** (API).

---

### First-time setup

1. **Node.js LTS**  
   Install from [nodejs.org](https://nodejs.org) (LTS) or run:
   ```powershell
   winget install OpenJS.NodeJS.LTS --accept-package-agreements
   ```
   If `npm` fails in terminal, use: `& "C:\Program Files\nodejs\npm.cmd" install` and `& "C:\Program Files\nodejs\npm.cmd" run dev` in the `frontend` folder. The scripts `run-frontend.ps1` and `run-backend.ps1` do this for you.

2. **Backend (Python)**  
   From repo root:
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
   Then start with `.\run-backend.ps1` or:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
   Backend: **http://localhost:8000/health**

3. **Frontend**  
   Dependencies are already installed. Start with `.\run-frontend.ps1` or:
   ```powershell
   cd frontend
   npm run dev
   ```
   Frontend: **http://localhost:5173**

---

## How the dashboard works

- **Upload**: The UI uploads a `.nc` file to `/upload_dataset` (stored under `data/`).
- **Variable/time selection**: The UI requests:
  - `/get_map_data` for global slices (lat/lon grid) used by the 2D heatmap
  - `/get_time_series` for trends at the selected location (lat/lon)
  - `/compare_years` for a quick “1990 vs 2026”-style comparison (auto-detected from dataset years)
- **Timeline playback**: Advances `time_index` automatically; map + charts update during playback.

---

## Data source – CESM CVDP Data Repository

**All climate data for this dashboard is accessed from:**

**[https://www.cesm.ucar.edu/projects/cvdp/data-repository](https://www.cesm.ucar.edu/projects/cvdp/data-repository)** (Community Earth System Model – Climate Variability and Diagnostics Package, NCAR/UCAR)

- The repository provides CVDP output (netCDF data) from CESM and CMIP integrations in **tar files**. Each tar contains multiple `.nc` files.
- **How to use:** Open the link → choose a comparison (e.g. CESM2 Large Ensemble 1850-2100, CMIP6 historical+ssp126) → click **Data** (or right‑click → Save link as) to download the `.tar` file → extract locally to get `.nc` files → upload those `.nc` files in this dashboard.
- The dashboard UI includes a **Data source** section in the sidebar with this link and example dataset links for quick access.
- **3D globe imagery:** [NASA Blue Marble](https://svs.gsfc.nasa.gov/2915) (MODIS Terra). Public domain.

---

## Notes on NetCDF compatibility

NetCDF datasets vary a lot (dimension/coordinate names, units, variable names).
This backend tries to auto-detect common coordinate names:

- time: `time`, `Time`, `valid_time`, `t`
- latitude: `lat`, `latitude`, `y`
- longitude: `lon`, `longitude`, `x`

If your dataset uses different names, you can extend the detection list in `backend/app/netcdf_service.py`.

=======
# HACK-IT-OUT-GITHUB
PyClimaExplorer is an interactive web-based dashboard designed to explore and visualize climate data in a simple and intuitive way. The platform processes scientific climate datasets in NetCDF (.nc) format and transforms them into meaningful visual insights using interactive charts and maps.
>>>>>>> b4dbf1b867eaf2a83727f1678e0ba4d4ef66477a
