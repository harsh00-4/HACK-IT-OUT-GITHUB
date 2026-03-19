import React, { useMemo, useState } from 'react';
import { Activity, ShieldCheck, Zap, Terminal } from './Icons';

export function MissionAnalyst(props: {
  series: any;
  variable: string;
  upload: any;
}) {
  const [speaking, setSpeaking] = useState(false);

  const insights = useMemo(() => {
    if (!props.series?.value?.length) return null;
    
    const vals: number[] = props.series.value.filter((v: any) => typeof v === 'number');
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const trend = vals[vals.length - 1] - vals[0];
    const trendPercent = (trend / (vals[0] || 1)) * 100;

    let briefing = `Initial scan for ${props.variable || 'climate data'} complete. `;
    briefing += `Observed mean value is ${mean.toFixed(2)}. `;
    
    if (trend > 0) {
      briefing += `Warning: Positive forcing detected. An upward trend of ${trendPercent.toFixed(1)} percent observed over this sequence. `;
    } else {
      briefing += `Status nominal. Minor downward variance detected. `;
    }

    if (max > mean * 1.5) {
      briefing += `Critical anomaly detected at peak sequence. Value exceeds mean threshold by significant margin. `;
    }

    return {
      text: briefing,
      mean,
      max,
      trend: trendPercent > 0 ? 'INCREASING' : 'STABLE',
      risk: trendPercent > 5 ? 'HIGH' : 'LOW'
    };
  }, [props.series, props.variable]);

  const speakBriefing = () => {
    if (!insights || speaking) return;
    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(insights.text);
    utterance.rate = 0.9;
    utterance.pitch = 0.8; // Deep, robotic voice
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  if (!insights) return (
    <div className="glass-panel p-6 flex flex-col items-center justify-center gap-4 text-slate-500 italic">
       <Terminal size={32} className="opacity-20 animate-pulse" />
       <span className="hud-label text-[10px]">AWAITING DATA STREAM...</span>
    </div>
  );

  return (
    <div className="glass-panel relative overflow-hidden bg-slate-900/60 p-6">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-2 opacity-5">
         <ShieldCheck size={120} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
           <Zap size={18} className="text-yellow-400" />
           <span className="hud-label text-sm tracking-widest text-white">MISSION_INTELLIGENCE</span>
        </div>
        <button 
          onClick={speakBriefing}
          disabled={speaking}
          className={`px-4 py-1.5 rounded border text-[10px] font-bold transition-all ${
            speaking 
            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 animate-pulse' 
            : 'border-white/10 hover:border-white/30 text-slate-400'
          }`}
        >
          {speaking ? 'AUDIO_BRIEFING_ACTIVE' : 'START_VOICE_BRIEFING'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
         <div className="flex flex-col gap-1 p-3 bg-black/30 rounded border border-white/5">
            <span className="hud-label text-[9px] text-slate-500">TREND_VECTOR</span>
            <span className={`hud-value text-xs font-black ${insights.trend === 'INCREASING' ? 'text-red-400' : 'text-emerald-400'}`}>
               {insights.trend}
            </span>
         </div>
         <div className="flex flex-col gap-1 p-3 bg-black/30 rounded border border-white/5">
            <span className="hud-label text-[9px] text-slate-500">RISK_ASSESSMENT</span>
            <span className={`hud-value text-xs font-black ${insights.risk === 'HIGH' ? 'text-red-500' : 'text-cyan-400'}`}>
               {insights.risk}
            </span>
         </div>
      </div>

      <div className="space-y-3">
         <div className="flex items-center gap-2">
            <Activity size={12} className="text-cyan-400" />
            <span className="hud-label text-[10px]">ANALYST_BRIEFING</span>
         </div>
         <p className="font-mono text-[11px] leading-relaxed text-slate-300 border-l border-cyan-500/30 pl-4 py-1">
            {insights.text}
         </p>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
         <div className="flex flex-col">
            <span className="hud-label text-[8px] opacity-40">ENCRYPTION_LAYER</span>
            <span className="hud-value text-[9px]">AES-256 QUANTUM SAFE</span>
         </div>
         <div className="text-[9px] hud-label text-cyan-500/50">NODE_VERIFIED: NASA_AMES</div>
      </div>
    </div>
  );
}
