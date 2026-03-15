import { useEffect, useRef, useState } from "react";

export function Timeline(props: {
  enabled: boolean;
  timeIndex: number;
  maxTime: number;
  timeValues: string[];
  onChange: (n: number) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const label = props.enabled
    ? (props.timeValues[props.timeIndex] ?? `Index ${props.timeIndex}`)
    : "Upload a dataset with time axis to enable playback";

  useEffect(() => {
    if (!playing) return;
    const stepMs = 220;
    const tick = (ts: number) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = ts - lastRef.current;
      if (dt >= stepMs) {
        lastRef.current = ts;
        props.onChange((props.timeIndex + 1) % (props.maxTime + 1));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = 0;
    };
  }, [playing, props.timeIndex, props.maxTime, props.onChange]);

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        disabled={!props.enabled}
        onClick={() => setPlaying((p) => !p)}
        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
          !props.enabled
            ? "cursor-not-allowed border border-slate-700 bg-slate-900/30 text-slate-600"
            : playing
              ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-100 shadow-sm shadow-emerald-500/20"
              : "border border-slate-600 bg-slate-800/50 text-slate-200 hover:border-cyan-500/40 hover:bg-slate-700/50"
        }`}
      >
        <span className="text-lg">{playing ? "⏸" : "▶"}</span>
        {playing ? "Pause" : "Play"}
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="truncate text-slate-400">{label}</span>
          <span className="ml-2 shrink-0 text-slate-500">
            {props.enabled ? `${props.timeIndex + 1} / ${props.maxTime + 1}` : ""}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={props.maxTime}
          value={props.timeIndex}
          onChange={(e) => props.onChange(Number(e.target.value))}
          className="w-full"
          disabled={!props.enabled}
        />
      </div>
    </div>
  );
}
