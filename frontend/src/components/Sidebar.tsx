import { useMemo, useRef, useState } from "react";
import type { UploadResponse } from "../lib/api";
import { CESM_CVDP_DATA_REPOSITORY_URL, CESM_EXAMPLE_DATASETS } from "../lib/dataSource";
import { PRESET_LOCATIONS } from "../lib/presetLocations";
import { MiniMap } from "./MiniMap";

type Mode = "spatial" | "temporal";

export function Sidebar(props: {
  mode: Mode;
  setMode: (m: Mode) => void;
  upload: UploadResponse | null;
  variable: string;
  setVariable: (v: string) => void;
  timeIndex: number;
  setTimeIndex: (n: number) => void;
  maxTime: number;
  timeValues: string[];
  onUpload: (file: File) => void;
  downsample: number;
  setDownsample: (n: number) => void;
  location: { lat: number; lon: number };
  setLocation: (p: { lat: number; lon: number }) => void;
  agg: "day" | "month" | "year";
  setAgg: (a: "day" | "month" | "year") => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const vars = props.upload?.variables ?? [];

  const hasTime = props.timeValues.length > 0;
  const timeLabel = useMemo(() => {
    if (!hasTime) return "No time axis detected";
    return props.timeValues[props.timeIndex] ?? "—";
  }, [hasTime, props.timeValues, props.timeIndex]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f?.name?.toLowerCase().endsWith(".nc")) props.onUpload(f);
  };

  return (
    <div className="flex w-[340px] shrink-0 flex-col gap-4 border-r border-slate-700/50 bg-slate-950/30 p-4 overflow-y-auto">
      {/* Data source: CESM CVDP Data Repository – single source for all data */}
      <div className="glass rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-3">
        <div className="section-label mb-2 flex items-center gap-1.5 text-cyan-400/90">
          📍 Data source
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          All data for this dashboard is accessed from the CESM CVDP Data Repository (NCAR/UCAR).
        </p>
        <a
          href={CESM_CVDP_DATA_REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-500/15 px-3 py-2.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25 hover:border-cyan-400/60 transition-colors w-full justify-center"
        >
          Open CESM CVDP Data Repository
          <span className="opacity-80">↗</span>
        </a>
        <p className="mt-3 text-[10px] font-medium text-slate-400">Example datasets (download .tar, extract .nc):</p>
        <ul className="mt-1.5 space-y-1">
          {CESM_EXAMPLE_DATASETS.map((d, i) => (
            <li key={i}>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-cyan-400/90 hover:text-cyan-300 hover:underline block truncate"
                title={d.label}
              >
                {d.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-slate-500">
          Right-click link → Save as (.tar), then extract and upload .nc files above.
        </p>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="section-label mb-3">Dataset</div>
        <div
          className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 transition-all ${
            dragOver
              ? "drop-zone-active border-cyan-500/60 bg-cyan-500/10"
              : "border-slate-600/60 bg-slate-900/40 hover:border-slate-500/70 hover:bg-slate-800/40"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <span className="mb-2 text-3xl opacity-80">📂</span>
          <span className="text-center text-sm font-medium text-slate-200">
            Drop .nc file here or click to browse
          </span>
          <span className="mt-1 text-xs text-slate-500">NetCDF climate data</span>
        </div>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".nc"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) props.onUpload(f);
          }}
        />
        <div className="mt-3 space-y-1.5 rounded-lg bg-slate-900/50 px-3 py-2 text-xs text-slate-400">
          {props.upload ? (
            <>
              <div className="flex justify-between"><span className="text-slate-500">ID</span><span className="font-mono text-slate-300 truncate max-w-[160px]">{props.upload.dataset_id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Variables</span><span className="text-slate-300">{vars.length}</span></div>
              <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">Time</span><span className="text-slate-300 truncate">{timeLabel}</span></div>
            </>
          ) : (
            <span className="text-slate-500">No dataset loaded</span>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="section-label mb-3">Analysis Mode</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              props.mode === "spatial"
                ? "border border-cyan-500/50 bg-cyan-500/15 text-cyan-100 shadow-sm shadow-cyan-500/10"
                : "border border-slate-600/60 bg-slate-800/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/30"
            }`}
            onClick={() => props.setMode("spatial")}
          >
            Spatial View
          </button>
          <button
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              props.mode === "temporal"
                ? "border border-cyan-500/50 bg-cyan-500/15 text-cyan-100 shadow-sm shadow-cyan-500/10"
                : "border border-slate-600/60 bg-slate-800/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/30"
            }`}
            onClick={() => props.setMode("temporal")}
          >
            Temporal View
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="section-label mb-3">Selectors</div>
        <div className="space-y-4">
          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-slate-400">Climate variable</div>
            <select
              className="w-full rounded-xl border border-slate-600/70 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              value={props.variable}
              onChange={(e) => props.setVariable(e.target.value)}
              disabled={!vars.length}
            >
              {vars.length ? null : <option>Upload a dataset first</option>}
              {vars.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Time index</span>
              <span className="text-[11px] text-slate-500">{props.timeIndex + 1} / {props.maxTime + 1}</span>
            </div>
            <input
              type="range"
              min={0}
              max={props.maxTime}
              value={props.timeIndex}
              onChange={(e) => props.setTimeIndex(Number(e.target.value))}
              className="mt-1 w-full"
              disabled={!hasTime}
            />
          </label>

          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-slate-400">Time aggregation</div>
            <select
              className="w-full rounded-xl border border-slate-600/70 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              value={props.agg}
              onChange={(e) => props.setAgg(e.target.value as "day" | "month" | "year")}
            >
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Map resolution</span>
              <span className="text-xs text-cyan-400/90">{props.downsample}×</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={props.downsample}
              onChange={(e) => props.setDownsample(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>

          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-slate-400">Preset location (world)</div>
            <select
              className="w-full rounded-xl border border-slate-600/70 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500/50"
              value={
                (() => {
                  const i = PRESET_LOCATIONS.findIndex((p) => Math.abs(p.lat - props.location.lat) < 0.01 && Math.abs(p.lon - props.location.lon) < 0.01);
                  return i >= 0 ? String(i) : "";
                })()
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") return;
                const p = PRESET_LOCATIONS[Number(v)];
                if (p) props.setLocation({ lat: p.lat, lon: p.lon });
              }}
            >
              <option value="">Custom</option>
              {PRESET_LOCATIONS.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <div className="mb-1.5 text-xs font-medium text-slate-400">Latitude</div>
              <input
                className="w-full rounded-xl border border-slate-600/70 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/50"
                value={props.location.lat}
                onChange={(e) => props.setLocation({ ...props.location, lat: Number(e.target.value) })}
                type="number"
                step="0.5"
              />
            </label>
            <label className="block">
              <div className="mb-1.5 text-xs font-medium text-slate-400">Longitude</div>
              <input
                className="w-full rounded-xl border border-slate-600/70 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/50"
                value={props.location.lon}
                onChange={(e) => props.setLocation({ ...props.location, lon: Number(e.target.value) })}
                type="number"
                step="0.5"
              />
            </label>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-slate-400">Location (Leaflet)</div>
            <MiniMap lat={props.location.lat} lon={props.location.lon} onPick={props.setLocation} />
          </div>
          <p className="text-[11px] text-slate-500">Click heatmap or map to set location.</p>
        </div>
      </div>
    </div>
  );
}
