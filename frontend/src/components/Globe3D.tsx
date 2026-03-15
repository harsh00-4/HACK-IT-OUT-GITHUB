import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import React, { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const NASA_BLUE_MARBLE_URL = "https://svs.gsfc.nasa.gov/vis/a000000/a002900/a002915/bluemarble-2048.png";
const FALLBACK_EARTH_URL = "https://unpkg.com/three-globe@2.24.2/example/img/earth-day.jpg";

function EarthReal({ textureUrl }: { textureUrl: string }) {
  const [colorMap] = useTexture([textureUrl]);
  const mat = useMemo(() => {
    colorMap.wrapS = colorMap.wrapT = THREE.ClampToEdgeWrapping;
    colorMap.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({
      map: colorMap,
      metalness: 0.05,
      roughness: 0.75,
      envMapIntensity: 0.2,
    });
  }, [colorMap]);
  return (
    <mesh>
      <sphereGeometry args={[1.2, 72, 72]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[1.26, 64, 64]} />
      <meshBasicMaterial color="#a5d8ff" transparent opacity={0.14} depthWrite={false} />
    </mesh>
  );
}

function Pin({ lat, lon }: { lat: number; lon: number }) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const r = 1.22;
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[0.028, 16, 16]} />
      <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.7} />
    </mesh>
  );
}

function EarthFallback() {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1e3a5f"),
        metalness: 0.1,
        roughness: 0.9,
      }),
    []
  );
  return (
    <mesh>
      <sphereGeometry args={[1.2, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

const ROTATION_SPEED = 0.12;
function RotatingGlobe({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += ROTATION_SPEED * delta;
  });
  return <group ref={groupRef}>{children}</group>;
}

class TextureErrorBoundary extends React.Component<
  { fallbackUrl: string; children: React.ReactNode },
  { useFallback: boolean }
> {
  state = { useFallback: false };
  static getDerivedStateFromError = () => ({ useFallback: true });
  render() {
    if (this.state.useFallback)
      return (
        <Suspense fallback={<EarthFallback />}>
          <EarthReal textureUrl={this.props.fallbackUrl} />
        </Suspense>
      );
    return this.props.children;
  }
}

export function Globe3D(props: {
  mode: "spatial" | "temporal";
  mapData: any;
  location: { lat: number; lon: number };
  onPickLocation: (p: { lat: number; lon: number }) => void;
}) {
  return (
    <div className="relative h-full w-full min-h-[240px] overflow-hidden rounded-b-xl">
      {/* Minimal corner hint – does not cover globe */}
      <div className="absolute bottom-2 right-2 z-10 rounded-lg bg-black/40 px-2 py-1 text-[10px] text-slate-400 backdrop-blur-sm">
        Drag to orbit • Scroll to zoom
      </div>
      <Canvas camera={{ position: [0, 0, 3.6], fov: 45 }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 3, 2]} intensity={1.4} castShadow />
        <pointLight position={[-3, -1, 1]} intensity={0.25} color="#a5d8ff" />
        <Stars radius={50} depth={40} count={1200} factor={2.5} saturation={0} fade speed={1} />
        <RotatingGlobe>
          <TextureErrorBoundary fallbackUrl={FALLBACK_EARTH_URL}>
            <Suspense fallback={<EarthFallback />}>
              <EarthReal textureUrl={NASA_BLUE_MARBLE_URL} />
            </Suspense>
          </TextureErrorBoundary>
          <Atmosphere />
          <Pin lat={props.location.lat} lon={props.location.lon} />
        </RotatingGlobe>
        <OrbitControls enablePan={false} minDistance={2.3} maxDistance={5.5} />
      </Canvas>
    </div>
  );
}
