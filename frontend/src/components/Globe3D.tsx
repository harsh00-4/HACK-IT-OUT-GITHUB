import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import React, { Suspense, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

/**
 * MISSION CONTROL: BULLETPROOF PHOTOREALISTIC GLOBE
 * 
 * Features:
 * 1. Safe Texture Loading: Uses manual THREE.TextureLoader with cross-origin support.
 * 2. Visual Fallback: If NASA textures fail to load (CORS), it defaults to a 
 *    high-fidelity "Deep Sea" blue sphere with a digital grid.
 * 3. Multi-Layering: Supports Earth surface, cloud layer, and atmospheric glow.
 */

const TEXTURE_SOURCES = {
  day: "https://unpkg.com/three-globe/example/img/earth-day.jpg",
  night: "https://unpkg.com/three-globe/example/img/earth-night.jpg",
  clouds: "https://unpkg.com/three-globe/example/img/earth-clouds.png"
};

function BulletproofEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  
  const [textures, setTextures] = useState<{ day: THREE.Texture | null, night: THREE.Texture | null, clouds: THREE.Texture | null }>({
    day: null,
    night: null,
    clouds: null
  });

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const load = async () => {
      try {
        const [day, night, clouds] = await Promise.all([
          new Promise<THREE.Texture>((res) => loader.load(TEXTURE_SOURCES.day, res, undefined, () => {})),
          new Promise<THREE.Texture>((res) => loader.load(TEXTURE_SOURCES.night, res, undefined, () => {})),
          new Promise<THREE.Texture>((res) => loader.load(TEXTURE_SOURCES.clouds, res, undefined, () => {}))
        ]);
        setTextures({ day, night, clouds });
      } catch (e) {
        console.warn("NASA Satellite Link (Textures) blocked or slow. Falling back to digital projection.");
      }
    };
    load();
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = elapsed * 0.04;
    if (cloudRef.current) cloudRef.current.rotation.y = elapsed * 0.05;
  });

  return (
    <group>
      {/* 🌏 PRIMARY EARTH SPHERE */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        {textures.day ? (
          <meshStandardMaterial 
            map={textures.day} 
            emissiveMap={textures.night}
            emissive={new THREE.Color("#ffffff")}
            emissiveIntensity={textures.night ? 0.6 : 0}
            metalness={0.2}
            roughness={0.8}
          />
        ) : (
          <meshStandardMaterial 
            color="#083344" 
            emissive="#0e7490" 
            emissiveIntensity={0.2} 
            metalness={0.9} 
            roughness={0.1} 
          />
        )}
      </mesh>
      
      {/* ☁️ DYNAMIC CLOUD LAYER */}
      {textures.clouds && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[1.215, 64, 64]} />
          <meshStandardMaterial 
            map={textures.clouds} 
            transparent 
            opacity={0.3} 
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 🌐 MISSION GRID (Always visible for NASA feel) */}
      <mesh>
        <sphereGeometry args={[1.21, 32, 32]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.06} />
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

const SATELLITE_CONFIG = [
  { id: 'ISS', color: '#22d3ee', r: 1.5, speed: 0.12, inc: 0.6 },
  { id: 'LANDSAT', color: '#38bdf8', r: 1.7, speed: 0.09, inc: 1.1 },
  { id: 'CARTOSAT', color: '#fbbf24', r: 1.6, speed: 0.1, inc: 0.4 },
  { id: 'EOS-04', color: '#f59e0b', r: 1.8, speed: 0.07, inc: 1.3 }
];

function SatellitePoint({ config }: { config: any }) {
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
        <ringGeometry args={[config.r - 0.002, config.r + 0.002, 64]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={5} />
        <pointLight color={config.color} intensity={0.5} distance={1} />
      </mesh>
    </group>
  );
}

function LocationPin({ lat, lon }: { lat: number; lon: number }) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const r = 1.22;
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  return (
    <group position={[x, y, z]}>
      <mesh>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={5} />
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
            <span className="hud-label text-[10px] text-emerald-400 font-extrabold uppercase">SAT_LINK: NASA_BLUE_MARBLE</span>
          </div>
       </div>
       
       <Canvas camera={{ position: [0, 0, 3.5], fov: 40 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
          
          <Suspense fallback={null}>
            <BulletproofEarth />
            <Atmosphere />
            <LocationPin lat={props.location.lat} lon={props.location.lon} />
            {SATELLITE_CONFIG.map(config => (
              <SatellitePoint key={config.id} config={config} />
            ))}
          </Suspense>
          
          <Stars radius={200} depth={100} count={3000} factor={6} saturation={0} fade speed={1} />
          
          <OrbitControls 
            enablePan={false} 
            minDistance={1.7} 
            maxDistance={5.5}
            rotateSpeed={0.5}
            enableDamping
          />
       </Canvas>

       <div className="absolute bottom-4 right-4 z-10 glass-panel p-2 px-4 bg-black/60 flex flex-col gap-1">
          <span className="hud-label text-[8px] opacity-60 font-black tracking-widest uppercase">LATITUDE / LONGITUDE</span>
          <div className="hud-value text-[10px] text-cyan-400 flex gap-3">
             <span>L: {props.location.lat.toFixed(2)}</span>
             <span>G: {props.location.lon.toFixed(2)}</span>
          </div>
       </div>
    </div>
  );
}
