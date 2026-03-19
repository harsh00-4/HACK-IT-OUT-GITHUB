import { useMemo, useRef, useState } from "react";
import type { UploadResponse } from "../lib/api";
import { CESM_CVDP_DATA_REPOSITORY_URL, CESM_EXAMPLE_DATASETS } from "../lib/dataSource";
import { PRESET_LOCATIONS } from "../lib/presetLocations";
import { MiniMap } from "./MiniMap";
import { Upload, Sliders, Map as MapIcon, Globe, Info } from "./Icons";

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
    if (!hasTime) return "NO AXIS";
    return props.timeValues[props.timeIndex] ?? "—";
  }, [hasTime, props.timeValues, props.timeIndex]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f?.name?.toLowerCase().endsWith(".nc")) props.onUpload(f);
  };

  return (
    <div className="flex w-[320px] shrink-0 flex-col gap-4 border-r border-slate-700/50 bg-slate-950/40 p-4 overflow-y-auto custom-scrollbar z-40">
      
      {/* Telemetry Panel */}
      <div className="glass-panel rounded-xl p-4 border-cyan-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Upload size={14} className="text-cyan-400" />
          <span className="hud-label">DATA UPLINK</span>
        </div>
        
        <div
          className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition-all ${
            dragOver
              ? "border-cyan-400 bg-cyan-400/10"
              : "border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-800/40"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="mb-2 text-slate-500">
            <Upload size={24} className={dragOver ? "animate-bounce text-cyan-400" : ""} />
          </div>
          <span className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-300">
            DROP NETCDF (.NC) FILES
          </span>
          <span className="mt-1 text-[9px] text-slate-500 font-mono">SECURE TRANSFERRED PREFERRED</span>
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

        {props.upload && (
           <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
              <div className="flex flex-col">
                <span className="hud-label text-[8px]">ID_STREAM</span>
                <span className="hud-value text-[10px] truncate">{props.upload.dataset_id.substring(0, 12)}</span>
              </div>
              <div className="flex flex-col">
                <span className="hud-label text-[8px]">VARS_COUNT</span>
                <span className="hud-value text-[10px]">{vars.length}</span>
              </div>
           </div>
        )}
      </div>

      {/* Control Module */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sliders size={14} className="text-cyan-400" />
          <span className="hud-label">SENSORS CONTROL</span>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="hud-label text-[9px]">PRIMARY VARIABLE</span>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              value={props.variable}
              onChange={(e) => props.setVariable(e.target.value)}
              disabled={!vars.length}
            >
              {vars.length ? null : <option>AWAITING DATA...</option>}
              {vars.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="hud-label text-[9px]">TIME_INDEX_SEQ</span>
              <span className="hud-value text-[10px]">{props.timeIndex + 1} / {props.maxTime + 1}</span>
            </div>
            <input
              type="range"
              min={0}
              max={props.maxTime}
              value={props.timeIndex}
              onChange={(e) => props.setTimeIndex(Number(e.target.value))}
              disabled={!hasTime}
            />
          </div>

          <div className="space-y-1.5">
            <span className="hud-label text-[9px]">GRID_DOWNSAMPLE</span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={props.downsample}
                onChange={(e) => props.setDownsample(Number(e.target.value))}
                className="flex-1"
              />
              <span className="hud-value text-xs w-6">{props.downsample}X</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geospatial Module */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <MapIcon size={14} className="text-cyan-400" />
          <span className="hud-label">GEOSPATIAL HUD</span>
        </div>
        
        <div className="space-y-4">
           <div className="space-y-1.5">
            <span className="hud-label text-[9px]">REGIONAL PRESETS</span>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
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
              <option value="">MANUAL OVERRIDE</option>
              {PRESET_LOCATIONS.map((p, i) => (
                <option key={i} value={i}>{p.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="h-[120px] rounded-lg overflow-hidden border border-slate-800">
             <MiniMap lat={props.location.lat} lon={props.location.lon} onPick={props.setLocation} />
          </div>
        </div>
      </div>

      {/* Resources Link */}
      <div className="glass-panel rounded-xl p-3 border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-2">
          <Info size={12} className="text-slate-500" />
          <span className="hud-label text-[9px]">SATELLITE ARCHIVES</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
          Access high-fidelity NetCDF archives from NCAR's CESM CVDP repository.
        </p>
        <a
          href={CESM_CVDP_DATA_REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] hud-label text-cyan-400 hover:bg-cyan-500/20 transition-all font-bold"
        >
          CONNECT TO REPOSITORY
        </a>
      </div>
    </div>
  );
}

