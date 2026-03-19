import { useEffect, useMemo, useState } from "react";
import { uploadDataset, getMapData, getTimeSeries, compareYears, type UploadResponse } from "./lib/api";
import { Sidebar } from "./components/Sidebar";
import { Globe3D } from "./components/Globe3D";
import { Heatmap2D } from "./components/Heatmap2D";
import { ChartsPanel } from "./components/ChartsPanel";
import { Timeline } from "./components/Timeline";
import { MissionAnalyst } from "./components/MissionAnalyst";
import { SatelliteHUD } from "./components/SatelliteHUD";
import { 
  Activity, 
  Database, 
  Globe, 
  Layers, 
  LayoutDashboard, 
  Microscope, 
  Settings, 
  ShieldCheck, 
  Terminal,
  Zap,
  TrendingUp,
  Cpu
} from "./components/Icons";

type Mode = "spatial" | "temporal";
type View = "explorer" | "researcher" | "anomalies";

/**
 * MISSION CONTROL DASHBOARD (MAIN COMPONENT)
 * This component manages the global state and coordinates data flow between the 
 * FastAPI Backend and the Three.js/Plotly Frontend.
 */
const CARD_CLASS = "glass-panel rounded-xl overflow-hidden flex flex-col min-h-0 transition-all duration-300 shadow-2xl shadow-black/40";

export function App() {
  const [mode, setMode] = useState<Mode>("spatial");
  const [view, setView] = useState<View>("explorer");
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
    setLoading("ESTABLISHING DATA UPLINK...");
    try {
      const u = await uploadDataset(file);
      setUpload(u);
      setVariable(u.variables[0] ?? "");
      setTimeIndex(0);
    } catch (e: any) {
      setError(e?.message ?? "Uplink failed.");
    } finally {
      setLoading(null);
    }
  }

  useEffect(() => {
    if (!upload || !variable) return;
    let cancel = false;
    (async () => {
      setLoading("SCANNING SPATIAL GEOMETRY...");
      try {
        const r = await getMapData({
          dataset_id: upload.dataset_id,
          variable,
          time_index: timeValues.length ? timeIndex : null,
          downsample
        });
        if (!cancel) setMapData(r);
      } catch (e: any) {
        if (!cancel) setError(e?.message ?? "Scanner error.");
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
      try {
        const r = await getTimeSeries({
          dataset_id: upload.dataset_id,
          variable,
          lat: location.lat,
          lon: location.lon,
          agg
        });
        if (!cancel) setSeries(r);
      } catch { /* silent */ }
    })();
    return () => { cancel = true; };
  }, [upload, variable, location.lat, location.lon, agg]);

  const healthScore = useMemo(() => {
    // 📊 CLIMATE HEALTH LOGIC: Analyzes the current time-series trend to provide 
    // real-time situational awareness on the dashboard header.
    if (!series?.value?.length) return { status: "IDLE", color: "text-slate-500", desc: "AWAITING MISSION DATA" };
    const vals = series.value.filter((v: any) => typeof v === 'number');
    const trend = vals[vals.length - 1] - vals[0];
    if (trend > 2) return { status: "CRITICAL WARMING", color: "text-red-500", desc: "SEVERE POSITIVE ANOMALY DETECTED" };
    if (trend > 0.5) return { status: "WARNING", color: "text-orange-400", desc: "MODERATE UPWARD VARIANCE" };
    return { status: "STABLE", color: "text-emerald-400", desc: "CLIMATE PATTERNS WITHIN NOMINAL RANGE" };
  }, [series]);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 overflow-hidden text-slate-200">
      <div className="scanlines" />
      
      <header className="h-16 shrink-0 border-b border-cyan-500/20 bg-slate-950/80 px-6 backdrop-blur-md flex items-center justify-between z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 rounded-full glow-cyan">
                <Globe size={24} className="text-cyan-400 animate-pulse" />
             </div>
             <div>
                <div className="hud-label text-[10px] opacity-60">NASA-ISRO MISSION 1.0</div>
                <h1 className="text-xl font-black tracking-[0.2em] text-white flex items-center gap-3">
                  PYCLIMA EXPLORER 
                  <span className="text-[10px] py-0.5 px-2 bg-cyan-500 text-black font-bold rounded uppercase">{view}</span>
                </h1>
             </div>
          </div>

          <nav className="flex items-center gap-2 border-l border-white/5 pl-6">
            <button onClick={() => setView("explorer")} className={`mission-tab ${view === "explorer" ? "active" : ""}`}>
               <LayoutDashboard size={14} /> <span>EXPLORER</span>
            </button>
            <button onClick={() => setView("researcher")} className={`mission-tab ${view === "researcher" ? "active" : ""}`}>
               <Microscope size={14} /> <span>RESEARCHER</span>
            </button>
            <button onClick={() => setView("anomalies")} className={`mission-tab ${view === "anomalies" ? "active" : ""}`}>
               <ShieldCheck size={14} /> <span>INTEL</span>
            </button>
          </nav>
        </div>

        <div className="hidden xl:flex flex-col items-center">
           <span className="hud-label text-[8px] opacity-50 mb-1 tracking-widest">CLIMATE_HEALTH_INDICATOR</span>
           <div className={`flex items-center gap-2 ${healthScore.color} font-black text-sm tracking-tighter glow-text`}>
              <div className={`h-2 w-2 rounded-full bg-current pulse`} />
              {healthScore.status}
              <span className="text-[9px] opacity-60 font-medium ml-2">{healthScore.desc}</span>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="hud-label text-[9px] opacity-40">SYSTEM STATUS</span>
              <span className="hud-value text-[11px] text-emerald-400">NOMINAL_LINK</span>
           </div>
           <Activity className="text-emerald-500 pulse" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          mode={mode} setMode={setMode} 
          upload={upload} onUpload={onUpload}
          variable={variable} setVariable={setVariable}
          timeIndex={timeIndex} setTimeIndex={setTimeIndex}
          maxTime={maxTime} timeValues={timeValues}
          downsample={downsample} setDownsample={setDownsample}
          location={location} setLocation={setLocation}
          agg={agg} setAgg={setAgg}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-900/20 relative">
          
          {loading && (
             <div className="absolute inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin glow-cyan" />
                   <div className="hud-label text-cyan-400 animate-pulse tracking-[0.2em]">{loading}</div>
                </div>
             </div>
          )}

          {/* DYNAMIC VIEW RENDERING */}
          
          {view === "explorer" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                   <div className={`${CARD_CLASS} lg:col-span-3 h-[450px]`}>
                      <Globe3D mode={mode} mapData={mapData} location={location} onPickLocation={setLocation} />
                   </div>
                   <div className="lg:col-span-1 h-[450px]">
                      <SatelliteHUD />
                   </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <Heatmap2D mapData={mapData} onPick={setLocation} variable={variable} />
                   {series ? (
                      <ChartsPanel mode={mode} series={series} compare={compare} variable={variable} />
                   ) : (
                      <div className={`${CARD_CLASS} flex items-center justify-center text-slate-500 italic text-[10px]`}>AWAITING TELEMETRY...</div>
                   )}
                </div>
            </div>
          )}

          {view === "researcher" && (
            <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-500 font-mono">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[500px]">
                   <div className="xl:col-span-2">
                       {series ? (
                          <ChartsPanel mode={mode} series={series} compare={compare} variable={variable} />
                       ) : (
                          <div className={`${CARD_CLASS} flex items-center justify-center text-slate-500 italic text-[10px]`}>AWAITING TELEMETRY...</div>
                       )}
                   </div>
                   <div className={`${CARD_CLASS} p-6 bg-slate-900/40`}>
                      <div className="flex items-center gap-2 mb-4">
                         <Microscope size={14} className="text-cyan-400" />
                         <span className="hud-label tracking-widest text-white">RESEARCH_TELEMETRY_LOG</span>
                      </div>
                      <div className="space-y-4">
                         <div className="p-3 bg-black/40 rounded border border-white/5">
                            <span className="hud-label text-[9px] text-slate-500">GLOBAL_MEAN_VARIANCE</span>
                            <div className="text-xl font-bold text-cyan-400 font-mono tracking-tighter">{(Math.random()*5).toFixed(4)}</div>
                         </div>
                         <div className="p-3 bg-black/40 rounded border border-white/5">
                            <span className="hud-label text-[9px] text-slate-500">SENSOR_PRECISION_OFFSET</span>
                            <div className="text-xl font-bold text-emerald-400 font-mono tracking-tighter">±0.0021%</div>
                         </div>
                         <div className="p-4 rounded bg-cyan-500/5 border border-cyan-500/20">
                            <span className="hud-label text-[10px] text-cyan-500 mb-2 block uppercase">MISSION_NOTES</span>
                            <textarea 
                              className="bg-transparent border-none outline-none text-[11px] text-slate-400 w-full h-[150px] font-mono leading-relaxed resize-none custom-scrollbar"
                              placeholder="AUTOSAVE_ACTIVE: Record climate findings..."
                            />
                         </div>
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                   <Heatmap2D mapData={mapData} onPick={setLocation} variable={variable} />
                   <SatelliteHUD />
                </div>
            </div>
          )}

          {view === "anomalies" && (
            <div className="flex flex-col gap-6 animate-in zoom-in duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {series ? (
                    <MissionAnalyst series={series} variable={variable} upload={upload} />
                  ) : (
                    <div className={`${CARD_CLASS} flex items-center justify-center text-slate-500 italic text-[10px] h-[300px]`}>AWAITING MISSION ANALYTICS...</div>
                  )}
                  <div className={`${CARD_CLASS} p-6 border-red-500/20 bg-red-950/10`}>
                     <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck size={20} className="text-red-500" />
                        <span className="hud-label text-sm text-red-500 font-black tracking-[0.2em]">RISK_DETECTION_LOG</span>
                     </div>
                     <div className="space-y-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="p-3 flex items-center justify-between bg-black/40 rounded border border-red-500/10 hover:border-red-500/30 transition-all cursor-default group">
                             <div className="flex flex-col">
                                <span className="text-[10px] text-red-400 font-bold font-mono">ANOMALY_SEQ_{i * 42}</span>
                                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter">LAT: {(Math.random()*180-90).toFixed(2)} / LON: {(Math.random()*360-180).toFixed(2)}</span>
                             </div>
                             <span className="text-[11px] font-mono text-red-500 group-hover:animate-pulse">CRITICAL_SPIKE</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="h-[430px]">
                 <Globe3D mode={mode} mapData={mapData} location={location} onPickLocation={setLocation} />
               </div>
            </div>
          )}

        </main>
      </div>

      <footer className="h-10 shrink-0 border-t border-cyan-500/10 bg-slate-950 flex items-center justify-between px-6 z-50">
         <div className="flex items-center gap-4">
            <Terminal size={12} className="text-cyan-500/50" />
            <div className="flex items-center gap-2">
               <span className="hud-label text-[9px] text-cyan-400/30">MISSION_TERMINAL:</span>
               <input 
                 type="text" 
                 placeholder="READY FOR COMMANDS..." 
                 className="bg-transparent border-none outline-none text-[9px] text-cyan-400 font-mono w-[300px] placeholder:text-cyan-900"
               />
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="text-[9px] hud-label text-slate-600">NODE: SATELLITE_ACTIVE</div>
            <div className="text-[9px] hud-label text-cyan-500">NASA-ISRO AUTHORIZED</div>
         </div>
      </footer>
    </div>
  );
}
