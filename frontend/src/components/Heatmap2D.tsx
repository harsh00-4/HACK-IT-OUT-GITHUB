import Plot from "react-plotly.js";
import { useMemo } from "react";
import { Map } from "./Icons";

export function Heatmap2D(props: {
  mapData: any;
  onPick: (p: { lat: number; lon: number }) => void;
  variable: string;
}) {
  const { lat, lon, z } = props.mapData ?? {};
  const ready = Array.isArray(lat) && Array.isArray(lon) && Array.isArray(z);

  return (
    <div className="flex h-full w-full flex-col bg-slate-900/40">
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
           <Map size={14} className="text-cyan-400" />
           <span className="hud-label">GEOSPATIAL_PROJECTION</span>
        </div>
        <span className="hud-value text-[10px] opacity-40 uppercase">{props.variable || 'NULL_STREAM'}</span>
      </div>
      <div className="min-h-0 flex-1 relative">
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600 italic">
            <Map size={32} className="opacity-20 animate-pulse" />
            <span className="hud-label text-[10px]">AWAITING COORDINATE LOCK...</span>
          </div>
        )}
        <div className="h-full w-full opacity-80 hover:opacity-100 transition-opacity">
        {ready && (
           <Plot
              data={[
                {
                  type: "heatmap",
                  z,
                  x: lon,
                  y: lat,
                  colorscale: "Turbo",
                  hoverongaps: false,
                  zsmooth: "best",
                  showscale: false
                } as any
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                margin: { l: 30, r: 10, t: 10, b: 30 },
                xaxis: { 
                  gridcolor: "rgba(148,163,184,0.05)", 
                  zeroline: false, 
                  tickfont: { size: 9, color: '#64748b' } 
                },
                yaxis: { 
                  gridcolor: "rgba(148,163,184,0.05)", 
                  zeroline: false, 
                  tickfont: { size: 9, color: '#64748b' }
                },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%", height: "100%" }}
              onClick={(ev: any) => {
                const p = ev?.points?.[0];
                const lonV = p?.x;
                const latV = p?.y;
                if (typeof latV === "number" && typeof lonV === "number") {
                  props.onPick({ lat: latV, lon: lonV });
                }
              }}
            />
        )}
        </div>
      </div>
    </div>
  );
}

