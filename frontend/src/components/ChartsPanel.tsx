import Plot from "react-plotly.js";
import { fmtNumber } from "../lib/format";

const INNER_BOX = "rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 flex flex-col min-h-0";

export function ChartsPanel(props: {
  mode: "spatial" | "temporal";
  series: any;
  compare: any;
  variable: string;
  cardClass?: string;
}) {
  const hasSeries = Array.isArray(props.series?.time) && Array.isArray(props.series?.value);
  const units = props.series?.units || props.compare?.units || "";
  const cardClass = props.cardClass ?? "rounded-2xl border border-slate-700/40 bg-slate-900/50 overflow-hidden";

  const stats = (() => {
    const vals: number[] = (props.series?.value ?? []).filter((x: any) => typeof x === "number" && Number.isFinite(x));
    if (!vals.length) return null;
    return {
      min: Math.min(...vals),
      max: Math.max(...vals),
      mean: vals.reduce((a, b) => a + b, 0) / vals.length,
    };
  })();

  return (
    <div className={`${cardClass}`}>
      <div className="flex shrink-0 items-center justify-between border-b border-slate-700/50 px-4 py-3">
        <span className="text-sm font-semibold text-slate-200">Charts & Statistics</span>
        <span className="text-xs text-slate-500 truncate max-w-[200px]">
          {props.variable || "—"}
          {units ? ` (${units})` : ""}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
        {/* Box 1: Time-series */}
        <div className={`${INNER_BOX}`}>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base">📈</span>
            <span className="text-sm font-semibold text-slate-200">Time-series</span>
          </div>
          <div className="min-h-0 flex-1 h-[200px]">
            <Plot
              data={
                hasSeries
                  ? [
                      {
                        type: "scatter",
                        mode: "lines",
                        x: props.series.time,
                        y: props.series.value,
                        line: { color: "rgb(34, 211, 238)", width: 2 },
                        fill: "tozeroy",
                        fillcolor: "rgba(34, 211, 238, 0.12)",
                      } as any
                    ]
                  : []
              }
              layout={{
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                margin: { l: 40, r: 8, t: 4, b: 32 },
                xaxis: { gridcolor: "rgba(148,163,184,0.1)", zeroline: false },
                yaxis: { gridcolor: "rgba(148,163,184,0.1)", zeroline: false },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          {!hasSeries && <p className="mt-2 text-xs text-slate-500">Select a location</p>}
        </div>

        {/* Box 2: Statistics */}
        <div className={`${INNER_BOX}`}>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-base">📊</span>
            <span className="text-sm font-semibold text-slate-200">Statistics</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between rounded-lg bg-slate-900/50 px-3 py-2">
              <span className="text-slate-400">Mean</span>
              <span className="font-medium text-cyan-200">{stats ? fmtNumber(stats.mean) : "—"} {units}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-slate-900/50 px-3 py-2">
              <span className="text-slate-400">Min</span>
              <span className="font-medium text-slate-200">{stats ? fmtNumber(stats.min) : "—"} {units}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-slate-900/50 px-3 py-2">
              <span className="text-slate-400">Max</span>
              <span className="font-medium text-slate-200">{stats ? fmtNumber(stats.max) : "—"} {units}</span>
            </div>
          </div>
        </div>

        {/* Box 3: Year comparison */}
        <div className={`${INNER_BOX}`}>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-base">🔄</span>
            <span className="text-sm font-semibold text-slate-200">Year comparison</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between rounded-lg bg-slate-900/50 px-3 py-2">
              <span className="text-slate-400">{props.compare?.year_a ?? "—"}</span>
              <span className="font-medium text-slate-200">{typeof props.compare?.mean_a === "number" ? fmtNumber(props.compare.mean_a) : "—"} {units}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-slate-900/50 px-3 py-2">
              <span className="text-slate-400">{props.compare?.year_b ?? "—"}</span>
              <span className="font-medium text-slate-200">{typeof props.compare?.mean_b === "number" ? fmtNumber(props.compare.mean_b) : "—"} {units}</span>
            </div>
            <div className="mt-2 flex justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2">
              <span className="text-slate-400">Δ</span>
              <span className="font-semibold text-cyan-200">{typeof props.compare?.delta === "number" ? fmtNumber(props.compare.delta) : "—"} {units}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
