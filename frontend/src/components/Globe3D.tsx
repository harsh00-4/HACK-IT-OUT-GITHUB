import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import React, { Suspense, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

/**
 * 🛰️ MISSION CONTROL: ROBUST PHOTOREALISTIC GLOBE
 * 
 * Stability First:
 * 1. Immediate Render: No Suspense-throwing hooks (like useTexture).
 * 2. Async Loading: Textures load in background and apply only when ready.
 * 3. Digital Fallback: Beautiful cyan/navy procedural sphere during loading/error.
 */

const SATELLITE_CONFIG = [
  { id: 'ISS', color: '#22d3ee', r: 1.55, speed: 0.1, inc: 0.7 },
  { id: 'LANDSAT', color: '#38bdf8', r: 1.75, speed: 0.08, inc: 1.1 },
  { id: 'CARTOSAT', color: '#fbbf24', r: 1.65, speed: 0.12, inc: 0.3 },
  { id: 'EOS-04', color: '#f59e0b', r: 1.85, speed: 0.06, inc: 1.4 }
];

function EarthCore() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [clouds, setClouds] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    
    // Load Day Map
    loader.load(
      "https://unpkg.com/three-globe/example/img/earth-day.jpg",
      (tex) => setTexture(tex),
      undefined,
      (err) => console.error("Global Texture Load Error:", err)
    );

    // Load Cloud Map
    loader.load(
      "https://unpkg.com/three-globe/example/img/earth-clouds.png",
      (tex) => setClouds(tex),
      undefined,
      (err) => console.error("Cloud Texture Load Error:", err)
    );
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = t * 0.03;
    if (cloudRef.current) cloudRef.current.rotation.y = t * 0.04;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        {texture ? (
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.2} />
        ) : (
          <meshStandardMaterial color="#083344" emissive="#0e7490" emissiveIntensity={0.2} metalness={0.9} roughness={0.1} />
        )}
      </mesh>
      
      {clouds && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[1.21, 64, 64]} />
          <meshStandardMaterial map={clouds} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {/* Mission Grid - Constant Visual */}
      <mesh>
        <sphereGeometry args={[1.205, 32, 32]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

function Atmosphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1.08 + Math.sin(clock.getElapsedTime()) * 0.002;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshPhongMaterial color="#22d3ee" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function Satellite({ config }: { config: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * config.speed;
    const x = Math.cos(t) * config.r;
    const y = Math.sin(t * config.inc) * 0.4;
    const z = Math.sin(t) * config.r;
    if (meshRef.current) meshRef.current.position.set(x, y, z);
  });
  return (
    <group>
      <mesh rotation={[Math.PI / 2, config.inc * 0.2, 0]}>
        <ringGeometry args={[config.r - 0.002, config.r + 0.002, 128]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={5} />
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
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={10} />
      </mesh>
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
    <div className="relative h-full w-full min-h-[400px] overflow-hidden rounded-xl bg-slate-950 border border-white/5 shadow-2xl">
       <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hud-label text-[10px] text-emerald-400 font-black tracking-widest uppercase">SAT_LINK: NASA_BLUE_MARBLE_SYNC</span>
          </div>
       </div>
       
       <Canvas camera={{ position: [0, 0, 3.6], fov: 40 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          
          <Suspense fallback={null}>
            <EarthCore />
            <Atmosphere />
            <Pin lat={props.location.lat} lon={props.location.lon} />
            {SATELLITE_CONFIG.map(s => <Satellite key={s.id} config={s} />)}
          </Suspense>
          
          <Stars radius={200} depth={100} count={4000} factor={6} saturation={0} fade speed={1.2} />
          
          <OrbitControls enablePan={false} minDistance={1.7} maxDistance={5.5} rotateSpeed={0.5} enableDamping />
       </Canvas>

       <div className="absolute bottom-4 right-4 z-10 glass-panel p-2 px-4 bg-black/60 backdrop-blur-md rounded border border-white/5">
          <span className="hud-label text-[8px] opacity-60 font-black uppercase tracking-widest">POSITION_TELEMETRY</span>
          <div className="hud-value text-[10px] text-cyan-400 flex gap-4">
             <span>L: {props.location.lat.toFixed(2)}</span>
             <span>G: {props.location.lon.toFixed(2)}</span>
          </div>
       </div>
    </div>
  );
}
