import Plot from "react-plotly.js";
import { fmtNumber } from "../lib/format";
import { Activity, BarChart3, TrendingUp } from "./Icons";

export function ChartsPanel(props: {
  mode: "spatial" | "temporal";
  series: any;
  compare: any;
  variable: string;
  cardClass?: string;
}) {
  const hasSeries = Array.isArray(props.series?.time) && Array.isArray(props.series?.value);
  const units = props.series?.units || props.compare?.units || "UNITS";
  const cardClass = props.cardClass ?? "glass-panel rounded-xl overflow-hidden";

  const stats = (() => {
    const vals: number[] = (props.series?.value ?? []).filter((x: any) => typeof x === "number" && Number.isFinite(x));
    if (!vals.length) return null;
    
    const count = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / count;
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    
    return {
      min: Math.min(...vals),
      max: Math.max(...vals),
      mean,
      variance,
      stdDev,
    };
  })();

  return (
    <div className={`${cardClass} border-slate-700/30`}>
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-6 py-3">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-cyan-400" />
          <span className="hud-label">TELEMETRY ANALYTICS</span>
        </div>
        <span className="hud-value text-[10px] opacity-70">
          CHANNEL: {props.variable || "NULL"} [{units}]
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {/* Time-series HUD */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="hud-label text-[10px] flex items-center gap-1.5 underline-offset-4 decoration-cyan-500/30 underline">
               <TrendingUp size={12} /> SPATIAL SEQUENCE
            </span>
            {hasSeries && <span className="text-[10px] text-emerald-400 font-mono pulse">REAL-TIME</span>}
          </div>
          <div className="h-[220px] bg-slate-950/40 rounded-lg border border-white/5 p-2">
            <Plot
              data={
                hasSeries
                  ? [
                      {
                        type: "scatter",
                        mode: "lines",
                        x: props.series.time,
                        y: props.series.value,
                        line: { color: "rgb(34, 211, 238)", width: 1.5, shape: 'spline' },
                        fill: "tozeroy",
                        fillcolor: "rgba(34, 211, 238, 0.05)",
                      } as any
                    ]
                  : []
              }
              layout={{
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                margin: { l: 30, r: 5, t: 5, b: 25 },
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
            />
          </div>
          {!hasSeries && <p className="hud-label text-[9px] text-center italic text-slate-600">AWAITING NODE LOCK...</p>}
        </div>

        {/* Statistical Variance Module */}
        <div className="flex flex-col gap-4">
          <span className="hud-label text-[10px] flex items-center gap-1.5">
            <BarChart3 size={12} /> VARIANCE MODULE
          </span>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "MEAN_VAL", val: stats?.mean, color: "text-cyan-400" },
              { label: "MIN_VAL", val: stats?.min, color: "text-slate-300" },
              { label: "MAX_VAL", val: stats?.max, color: "text-slate-300" },
              { label: "STD_DEV", val: stats?.stdDev, color: "text-emerald-400" },
              { label: "VARIANCE", val: stats?.variance, color: "text-slate-400" },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center px-4 py-2 bg-white/[0.02] border border-white/5 rounded">
                <span className="hud-label text-[9px]">{s.label}</span>
                <span className={`hud-value text-xs font-bold ${s.color}`}>
                  {s.val !== undefined ? fmtNumber(s.val) : "NaN"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Comparison Module */}
        <div className="flex flex-col gap-4">
          <span className="hud-label text-[10px] flex items-center gap-1.5">
            <Activity size={12} /> CLIMATE DELTA HUB
          </span>
          <div className="flex flex-col gap-3">
             <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-500/5 -rotate-12 translate-x-3 -translate-y-3" />
                <div className="hud-label text-[8px] mb-2">SEQUENCE_A: {props.compare?.year_a || "N/A"}</div>
                <div className="hud-value text-lg tracking-tight">
                  {typeof props.compare?.mean_a === "number" ? fmtNumber(props.compare.mean_a) : "0.00"} <span className="text-[10px] opacity-40">{units}</span>
                </div>
             </div>

             <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 relative overflow-hidden">
                <div className="hud-label text-[8px] mb-2">SEQUENCE_B: {props.compare?.year_b || "N/A"}</div>
                <div className="hud-value text-lg tracking-tight">
                  {typeof props.compare?.mean_b === "number" ? fmtNumber(props.compare.mean_b) : "0.00"} <span className="text-[10px] opacity-40">{units}</span>
                </div>
             </div>

             <div className="mt-2 p-3 bg-cyan-950/20 rounded-lg border border-cyan-500/20 flex justify-between items-center shadow-[inset_0_0_10px_rgba(34,211,238,0.05)]">
                <span className="hud-label text-[10px] text-cyan-400 font-bold">DELTA_RESULT</span>
                <span className="hud-value text-sm text-cyan-100 font-black glow-text-cyan">
                  {typeof props.compare?.delta === "number" ? (props.compare.delta > 0 ? "+" : "") + fmtNumber(props.compare.delta) : "0.00"} %
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

