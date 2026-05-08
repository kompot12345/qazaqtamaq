'use client';

import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const GLOBE_R = 2;

function latLonToVec3(lat: number, lon: number, r = GLOBE_R): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const FARMER_NODES = [
  { name: 'Алматы',  lat: 43.22, lon: 76.85 },
  { name: 'Астана',  lat: 51.18, lon: 71.45 },
  { name: 'Шымкент', lat: 42.30, lon: 69.60 },
  { name: 'Атырау',  lat: 47.10, lon: 51.90 },
  { name: 'Өскемен', lat: 49.97, lon: 82.60 },
];

const BUYER_NODES = [
  { name: 'Москва',   lat: 55.75, lon:  37.62 },
  { name: 'Пекин',    lat: 39.90, lon: 116.40 },
  { name: 'Дубай',    lat: 25.20, lon:  55.27 },
  { name: 'Стамбул',  lat: 41.01, lon:  28.97 },
  { name: 'Лондон',   lat: 51.51, lon:  -0.12 },
  { name: 'Токио',    lat: 35.68, lon: 139.69 },
  { name: 'Нью-Йорк', lat: 40.71, lon: -74.01 },
  { name: 'Сеул',     lat: 37.57, lon: 126.98 },
];

const ARCS = [
  { from: FARMER_NODES[0], to: BUYER_NODES[1] },
  { from: FARMER_NODES[1], to: BUYER_NODES[0] },
  { from: FARMER_NODES[0], to: BUYER_NODES[3] },
  { from: FARMER_NODES[3], to: BUYER_NODES[4] },
  { from: FARMER_NODES[0], to: BUYER_NODES[2] },
  { from: FARMER_NODES[4], to: BUYER_NODES[5] },
  { from: FARMER_NODES[2], to: BUYER_NODES[7] },
  { from: FARMER_NODES[1], to: BUYER_NODES[6] },
];

function buildArcPoints(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  segments = 56,
): THREE.Vector3[] {
  const a = latLonToVec3(from.lat, from.lon);
  const b = latLonToVec3(to.lat, to.lon);
  const mid = a.clone().lerp(b, 0.5).normalize().multiplyScalar(GLOBE_R * 1.6);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pts.push(
      a.clone().multiplyScalar((1 - t) ** 2)
        .add(mid.clone().multiplyScalar(2 * t * (1 - t)))
        .add(b.clone().multiplyScalar(t ** 2)),
    );
  }
  return pts;
}

function AnimatedArc({
  fromNode,
  toNode,
  offset,
}: {
  fromNode: { lat: number; lon: number };
  toNode: { lat: number; lon: number };
  offset: number;
}) {
  const progressRef = useRef(offset);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null);
  const fullPoints = useMemo(() => buildArcPoints(fromNode, toNode), [fromNode, toNode]);
  const flatFull = useMemo(
    () => fullPoints.flatMap((p) => [p.x, p.y, p.z]),
    [fullPoints],
  );

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.22) % 1.5;

    const line = lineRef.current;
    if (!line?.geometry?.setPositions) return;

    const count = Math.max(2, Math.floor(progressRef.current * fullPoints.length));
    const slice = flatFull.slice(0, count * 3);
    // LineGeometry needs at least 2 points (6 floats)
    if (slice.length >= 6) line.geometry.setPositions(slice);
  });

  // Seed with first two points so Line initialises at a valid size
  const seedPoints = useMemo(() => fullPoints.slice(0, 2), [fullPoints]);

  return (
    <Line
      ref={lineRef}
      points={seedPoints}
      color="#FFD700"
      lineWidth={1.4}
      transparent
      opacity={0.85}
    />
  );
}

function PulsingDot({
  position,
  color,
  speed,
}: {
  position: THREE.Vector3;
  color: string;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (meshRef.current) meshRef.current.scale.setScalar(1 + Math.sin(t) * 0.3);
    if (ringRef.current) {
      const s = 1 + ((Math.sin(t * 0.7) + 1) / 2) * 2.2;
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - (s - 1) / 2.2);
    }
  });

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    position.clone().normalize(),
  );

  return (
    <group position={position} quaternion={quaternion}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.048, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.058, 0.082, 28]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function EarthSphere() {
  const dayMap = useTexture('/textures/earth-blue-marble.jpg');

  return (
    <Sphere args={[GLOBE_R, 72, 72]}>
      {/* meshBasicMaterial ignores all lighting → full-brightness texture like Google Earth */}
      <meshBasicMaterial map={dayMap} />
    </Sphere>
  );
}

function PlaceholderSphere() {
  return (
    <Sphere args={[GLOBE_R, 32, 32]}>
      <meshStandardMaterial color="#0A2A4A" metalness={0.2} roughness={0.8} />
    </Sphere>
  );
}

function AtmosphereGlow() {
  return (
    <>
      <Sphere args={[GLOBE_R * 1.08, 64, 64]}>
        <meshStandardMaterial
          color="#4FC3F7"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>
      <Sphere args={[GLOBE_R * 1.04, 64, 64]}>
        <meshStandardMaterial
          color="#0089A7"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>
    </>
  );
}

export function SilkRoadGlobe() {
  const farmerPositions = useMemo(() => FARMER_NODES.map((n) => latLonToVec3(n.lat, n.lon)), []);
  const buyerPositions  = useMemo(() => BUYER_NODES.map((n) => latLonToVec3(n.lat, n.lon)), []);

  return (
    <group>
      <Suspense fallback={<PlaceholderSphere />}>
        <EarthSphere />
      </Suspense>

      <AtmosphereGlow />

      {farmerPositions.map((pos, i) => (
        <PulsingDot key={`f${i}`} position={pos} color="#FFD700" speed={1.8 + i * 0.2} />
      ))}

      {buyerPositions.map((pos, i) => (
        <PulsingDot key={`b${i}`} position={pos} color="#00AFCA" speed={1.4 + i * 0.15} />
      ))}

      {ARCS.map((arc, i) => (
        <AnimatedArc
          key={i}
          fromNode={arc.from}
          toNode={arc.to}
          offset={(i / ARCS.length) * 1.4}
        />
      ))}
    </group>
  );
}
