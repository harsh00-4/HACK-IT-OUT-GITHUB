import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, Activity, Globe, Disc } from './Icons';

// Simple Orbital Logic for Hackathon Live Demo
// (We simulate orbits based on real UTC to move precisely)
const SATELLITES = [
  { id: 'ISS', agency: 'NASA', color: '#22d3ee', period: 92, inc: 51.6, alt: 420 },
  { id: 'LANDSAT-9', agency: 'NASA', color: '#38bdf8', period: 98, inc: 98.2, alt: 705 },
  { id: 'EOS-04', agency: 'ISRO', color: '#fbbf24', period: 95, inc: 97.5, alt: 529 },
  { id: 'CARTOSAT-3', agency: 'ISRO', color: '#f59e0b', period: 94, inc: 97.5, alt: 505 }
];

export function SatelliteHUD() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTicks(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const telemetries = useMemo(() => {
    const now = Date.now() / 1000;
    return SATELLITES.map(s => {
      // Very simple circular orbit simulation for HUD display
      const angle = (now / (s.period * 60)) * Math.PI * 2;
      const lat = Math.sin(angle) * s.inc;
      const lon = (angle * (180/Math.PI)) % 360;
      return { ...s, lat, lon };
    });
  }, [ticks]);

  return (
    <div className="flex flex-col gap-3">
       <div className="flex items-center gap-2 mb-2">
          <Globe size={16} className="text-cyan-400" />
          <span className="hud-label text-xs tracking-widest text-white">ORBITAL_TELEMETRY</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-auto" />
       </div>

       {telemetries.map(sat => (
         <div key={sat.id} className="glass-panel p-3 border-white/5 bg-black/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Disc size={10} color={sat.color} className="animate-spin-slow" />
                  <span className="hud-label text-[10px] text-white font-black">{sat.id}</span>
               </div>
               <span className="text-[9px] hud-label py-0.5 px-1 bg-white/5 rounded border border-white/10 opacity-60">
                  {sat.agency}
               </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[9px] hud-value">
               <div className="flex flex-col">
                  <span className="hud-label text-[8px] opacity-40">LATITUDE</span>
                  <span className="text-cyan-100">{sat.lat.toFixed(4)}°</span>
               </div>
               <div className="flex flex-col">
                  <span className="hud-label text-[8px] opacity-40">LONGITUDE</span>
                  <span className="text-cyan-100">{sat.lon.toFixed(4)}°</span>
               </div>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
               <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500/50 animate-pulse" 
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                  />
               </div>
               <span className="text-[8px] hud-label text-emerald-400 italic">NOMINAL</span>
            </div>
         </div>
       ))}

       <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 opacity-40">
             <ShieldCheck size={12} />
             <span className="hud-label text-[8px]">ENCRYPTED_DOWNLINK: SAT_COM_7</span>
          </div>
       </div>
    </div>
  );
}
