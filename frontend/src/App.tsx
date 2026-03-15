import { useEffect, useMemo, useState } from "react";
import { uploadDataset, getMapData, getTimeSeries, compareYears, type UploadResponse } from "./lib/api";
import { CESM_CVDP_DATA_REPOSITORY_URL } from "./lib/dataSource";
import { Sidebar } from "./components/Sidebar";
import { Globe3D } from "./components/Globe3D";
import { Heatmap2D } from "./components/Heatmap2D";
import { ChartsPanel } from "./components/ChartsPanel";
import { Timeline } from "./components/Timeline";

type Mode = "spatial" | "temporal";

const CARD_CLASS = "rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur overflow-hidden flex flex-col min-h-0";

export function App() {
  const [mode, setMode] = useState<Mode>("spatial");
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [variable, setVariable] = useState<string>("");
  const [timeIndex, setTimeIndex] = useState<number>(0);
  const [downsample, setDownsample] = useState<number>(3);
  const [location, setLocation] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
  const [agg, setAgg] = useState<"day" | "month" | "year">("month");

  const [mapData, setMapData] = useState<any>(null);
  const [series, setSeries] = useState<any>(null);
  const [compare, setCompare] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timeValues = upload?.time_values ?? [];
  const maxTime = Math.max(0, timeValues.length - 1);

  useEffect(() => {
    if (upload && !variable) setVariable(upload.variables[0] ?? "");
  }, [upload, variable]);

  async function onUpload(file: File) {
    setError(null);
    setLoading("Uploading + indexing NetCDF…");
    try {
      const u = await uploadDataset(file);
      setUpload(u);
      setVariable(u.variables[0] ?? "");
      setTimeIndex(0);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed.");
    } finally {
      setLoading(null);
    }
  }

  useEffect(() => {
    if (!upload || !variable) return;
    let cancel = false;
    (async () => {
      setError(null);
      setLoading("Loading map…");
      try {
        const r = await getMapData({
          dataset_id: upload.dataset_id,
          variable,
          time_index: timeValues.length ? timeIndex : null,
          downsample
        });
        if (!cancel) setMapData(r);
      } catch (e: any) {
        if (!cancel) setError(e?.message ?? "Failed to load map data.");
      } finally {
        if (!cancel) setLoading(null);
      }
    })();
    return () => { cancel = true; };
  }, [upload, variable, timeIndex, downsample, timeValues.length]);

  useEffect(() => {
    if (!upload || !variable) return;
    let cancel = false;
    (async () => {
      setError(null);
      setLoading("Loading series…");
      try {
        const r = await getTimeSeries({
          dataset_id: upload.dataset_id,
          variable,
          lat: location.lat,
          lon: location.lon,
          agg
        });
        if (!cancel) setSeries(r);
      } catch (e: any) {
        if (!cancel) setError(e?.message ?? "Failed to load time-series.");
      } finally {
        if (!cancel) setLoading(null);
      }
    })();
    return () => { cancel = true; };
  }, [upload, variable, location.lat, location.lon, agg]);

  useEffect(() => {
    if (!upload || !variable || !timeValues.length) return;
    const years = timeValues.map((t) => new Date(t).getFullYear()).filter((y) => Number.isFinite(y));
    if (!years.length) return;
    const yearA = Math.min(...years);
    const yearB = Math.max(...years);
    let cancel = false;
    (async () => {
      try {
        const r = await compareYears({
          dataset_id: upload.dataset_id,
          variable,
          year_a: yearA,
          year_b: yearB,
          agg: "year"
        });
        if (!cancel) setCompare(r);
      } catch { /* non-fatal */ }
    })();
    return () => { cancel = true; };
  }, [upload, variable, timeValues]);

  const subtitle = useMemo(() => {
    if (!upload) return "Upload a NetCDF file to begin.";
    const t = timeValues.length ? timeValues[timeIndex] : "no time dimension";
    return `${variable || "—"} • ${t}`;
  }, [upload, variable, timeValues, timeIndex]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar
          mode={mode}
          setMode={setMode}
          upload={upload}
          variable={variable}
          setVariable={setVariable}
          timeIndex={timeIndex}
          setTimeIndex={setTimeIndex}
          maxTime={maxTime}
          timeValues={timeValues}
          onUpload={onUpload}
          downsample={downsample}
          setDownsample={setDownsample}
          location={location}
          setLocation={setLocation}
          agg={agg}
          setAgg={setAgg}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 overflow-auto">
          {/* Header – single row */}
          <header className={`${CARD_CLASS} shrink-0 flex-row px-5 py-4`}>
            <div className="flex flex-1 items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-xl">
                🌍
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90">Climate Analytics</div>
                <h1 className="text-xl font-bold tracking-tight text-slate-100">Climate Data Explorer</h1>
                <div className="text-sm text-slate-400 truncate">{subtitle}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {loading && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-600/80 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  {loading}
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-1.5 text-xs text-rose-200">
                  {error}
                </div>
              )}
            </div>
          </header>

          {!upload && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-3 text-sm text-slate-300">
              <span className="font-semibold text-cyan-200">Get started:</span> Upload a NetCDF (.nc) from the sidebar. All data is from the{" "}
              <a href={CESM_CVDP_DATA_REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:no-underline">CESM CVDP Data Repository</a> (download .tar, extract .nc, then upload).
            </div>
          )}

          {/* Symmetric grid: 3D and 2D side by side (equal boxes) */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2" style={{ minHeight: "340px" }}>
            <div className={`${CARD_CLASS} min-h-[280px]`}>
              <div className="flex shrink-0 items-center justify-between border-b border-slate-700/50 px-4 py-2">
                <span className="text-sm font-semibold text-slate-200">3D Earth</span>
                <a href="https://svs.gsfc.nasa.gov/2915" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:text-cyan-400">NASA</a>
              </div>
              <div className="min-h-0 flex-1">
                <Globe3D mode={mode} mapData={mapData} location={location} onPickLocation={(p) => setLocation(p)} />
              </div>
            </div>

            <div className={`${CARD_CLASS} min-h-[280px]`}>
              <Heatmap2D mapData={mapData} onPickLocation={(p) => setLocation(p)} />
            </div>
          </div>

          {/* Charts & Statistics – symmetric row of boxes */}
          <div className="shrink-0">
            <ChartsPanel mode={mode} series={series} compare={compare} variable={variable} cardClass={CARD_CLASS} />
          </div>

          {/* Timeline – full width box */}
          <div className={`${CARD_CLASS} shrink-0 px-4 py-3`}>
            <Timeline
              enabled={!!upload && timeValues.length > 0}
              timeIndex={timeIndex}
              maxTime={maxTime}
              timeValues={timeValues}
              onChange={setTimeIndex}
            />
          </div>

          {/* Data source attribution */}
          <footer className="shrink-0 py-2 text-center">
            <a
              href={CESM_CVDP_DATA_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-slate-500 hover:text-cyan-400 transition-colors"
            >
              Data from CESM CVDP Data Repository (NCAR/UCAR)
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
