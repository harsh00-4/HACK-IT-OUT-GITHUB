import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import React, { Suspense, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

// Use standard three-globe example assets as they are reliable for demo contexts
const TEXTURE_DIR = "https://unpkg.com/three-globe/example/img/";
const DAY_MAP = `${TEXTURE_DIR}earth-day.jpg`;
const NIGHT_MAP = `${TEXTURE_DIR}earth-night.jpg`;
const CLOUD_MAP = `${TEXTURE_DIR}earth-clouds.png`;

function PhotorealisticEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  
  // Load textures with cross-origin support
  const [dayTexture, nightTexture, cloudTexture] = useTexture([
    DAY_MAP,
    NIGHT_MAP,
    CLOUD_MAP
  ]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = elapsed * 0.04;
    if (cloudRef.current) cloudRef.current.rotation.y = elapsed * 0.05;
  });

  return (
    <group>
      {/* 🌏 The Earth Sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.2, 128, 128]} />
        <meshStandardMaterial 
          map={dayTexture} 
          emissiveMap={nightTexture}
          emissiveIntensity={0.6}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* ☁️ Rotating Cloud Layer */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.215, 128, 128]} />
        <meshStandardMaterial 
          map={cloudTexture} 
          transparent 
          opacity={0.3} 
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 🌐 Subtle Digital Grid (Layered for Depth) */}
      <mesh>
        <sphereGeometry args={[1.22, 64, 64]} />
        <meshBasicMaterial 
          color="#06b6d4" 
          wireframe 
          transparent 
          opacity={0.03} 
        />
      </mesh>
    </group>
  );
}

function AtmosphericGlow() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1.08 + Math.sin(clock.getElapsedTime()) * 0.003;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshPhongMaterial
        color="#22d3ee"
        transparent
        opacity={0.15}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Satellite Constellation markers (NASA/ISRO Sync)
const SATS = [
  { id: 'ISS', color: '#22d3ee', r: 1.6, s: 0.12, i: 0.8 },
  { id: 'CARTOSAT', color: '#fbbf24', r: 1.8, s: 0.08, i: 0.2 },
  { id: 'EOS-04', color: '#f59e0b', r: 1.7, s: 0.1, i: 1.3 },
  { id: 'LANDSAT', color: '#38bdf8', r: 1.5, s: 0.15, i: 0.5 }
];

function Satellite({ config }: { config: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * config.s;
    const x = Math.cos(t) * config.r;
    const y = Math.sin(t * config.i) * 0.6;
    const z = Math.sin(t) * config.r;
    if (meshRef.current) meshRef.current.position.set(x, y, z);
  });

  return (
    <group>
      {/* Orbital Ring */}
      <mesh rotation={[Math.PI / 2, config.i * 0.2, 0]}>
        <ringGeometry args={[config.r - 0.003, config.r + 0.003, 128]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Signal Beacon */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={5} />
        <pointLight color={config.color} intensity={0.5} distance={1} />
        <mesh>
          <ringGeometry args={[0.04, 0.06, 16]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </mesh>
    </group>
  );
}

function Pin({ lat, lon }: { lat: number; lon: number }) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const r = 1.23;
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  
  return (
    <group position={[x, y, z]}>
      <mesh>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={10} />
      </mesh>
      <pointLight color="#f43f5e" intensity={1} distance={2} />
    </group>
  );
}

export function Globe3D(props: {
  mode: "spatial" | "temporal";
  mapData: any;
  location: { lat: number; lon: number };
  onPickLocation: (p: { lat: number; lon: number }) => void;
}) {
  return (
    <div className="relative h-full w-full min-h-[400px] overflow-hidden rounded-xl bg-slate-950 border border-white/5 shadow-inner">
       <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="hud-label text-[10px] text-emerald-400 font-black tracking-widest">SAT_LINK: NASA_BLUE_MARBLE_LIVE</span>
          </div>
          <span className="hud-label text-[9px] opacity-40 italic">CONSTELLATION: 04 ACTIVE SENSORS</span>
       </div>
       
       <Canvas camera={{ position: [0, 0, 3.8], fov: 40 }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
          <pointLight position={[-10, -5, -5]} intensity={0.5} color="#22d3ee" />
          
          <Suspense fallback={null}>
            <PhotorealisticEarth />
            <AtmosphericGlow />
            <Pin lat={props.location.lat} lon={props.location.lon} />
            {SATS.map(s => <Satellite key={s.id} config={s} />)}
          </Suspense>
          
          <Stars radius={200} depth={100} count={6000} factor={6} saturation={0} fade speed={1.2} />
          
          <OrbitControls 
            enablePan={false} 
            minDistance={1.7} 
            maxDistance={5.5}
            rotateSpeed={0.5}
            enableDamping
          />
       </Canvas>

       <div className="absolute bottom-4 right-4 z-10 glass-panel p-2 px-4 bg-black/60 backdrop-blur-md rounded-lg flex flex-col gap-1 border border-white/5">
          <span className="hud-label text-[8px] opacity-50 font-black tracking-widest">GEOSPATIAL POSITION</span>
          <div className="hud-value text-[11px] text-cyan-400 font-mono flex gap-4">
             <span>LAT: {props.location.lat.toFixed(2)}°</span>
             <span>LON: {props.location.lon.toFixed(2)}°</span>
          </div>
       </div>
    </div>
  );
}
