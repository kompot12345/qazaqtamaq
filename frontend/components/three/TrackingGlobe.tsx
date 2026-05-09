'use client';

import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const GLOBE_R = 2;

export function latLonToVec3(lat: number, lon: number, r = GLOBE_R): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function buildArcPoints(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  segments = 100,
): THREE.Vector3[] {
  const a = latLonToVec3(from.lat, from.lon);
  const b = latLonToVec3(to.lat, to.lon);
  // Raise midpoint so arc lifts off the globe surface
  const mid = a.clone().lerp(b, 0.5).normalize().multiplyScalar(GLOBE_R * 1.7);
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

function PulsingDot({
  position,
  color,
  size = 0.055,
}: {
  position: THREE.Vector3;
  color: string;
  size?: number;
}) {
  const coreRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 2.2;
    if (coreRef.current) coreRef.current.scale.setScalar(1 + Math.sin(t) * 0.22);
    if (ringRef.current) {
      const s = 1 + ((Math.sin(t * 0.75) + 1) / 2) * 2.5;
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.65 * (1 - (s - 1) / 2.5);
    }
  });

  const quat = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        position.clone().normalize(),
      ),
    [position],
  );

  return (
    <group position={position} quaternion={quat}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[size, 14, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.3, size * 1.8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function DeliveryMarker({
  points,
  targetProgress,
}: {
  points: THREE.Vector3[];
  targetProgress: number;
}) {
  const progressRef = useRef(targetProgress);
  const markerRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<any>(null!);

  const flatFull = useMemo(
    () => points.flatMap((p) => [p.x, p.y, p.z]),
    [points],
  );

  useFrame((state, delta) => {
    // Smoothly interpolate toward target progress
    progressRef.current += (targetProgress - progressRef.current) * Math.min(delta * 1.5, 1);
    const p = Math.max(0, Math.min(1, progressRef.current));
    const idx = Math.min(Math.floor(p * (points.length - 1)), points.length - 1);
    const pos = points[idx];

    if (markerRef.current) markerRef.current.position.copy(pos);
    if (haloRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.35;
      haloRef.current.position.copy(pos);
      haloRef.current.scale.setScalar(pulse);
    }

    // Update traveled trail
    if (trailRef.current?.geometry?.setPositions) {
      const count = Math.max(2, idx + 1);
      const slice = flatFull.slice(0, count * 3);
      if (slice.length >= 6) trailRef.current.geometry.setPositions(slice);
    }
  });

  const seedPoints = useMemo(() => points.slice(0, 2), [points]);

  return (
    <>
      {/* Traveled gold trail */}
      <Line
        ref={trailRef as any}
        points={seedPoints}
        color="#FFD700"
        lineWidth={3}
        transparent
        opacity={0.95}
      />

      {/* Marker core — bright white */}
      <mesh ref={markerRef} position={points[0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={6}
          toneMapped={false}
        />
      </mesh>

      {/* Marker halo */}
      <mesh ref={haloRef} position={points[0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.22} />
      </mesh>
    </>
  );
}

function EarthSphere() {
  const dayMap = useTexture('/textures/earth-blue-marble.jpg');
  return (
    <Sphere args={[GLOBE_R, 72, 72]}>
      <meshBasicMaterial map={dayMap} />
    </Sphere>
  );
}

function FallbackSphere() {
  return (
    <Sphere args={[GLOBE_R, 48, 48]}>
      <meshStandardMaterial color="#0A2A4A" metalness={0.15} roughness={0.75} />
    </Sphere>
  );
}

function Atmosphere() {
  return (
    <>
      <Sphere args={[GLOBE_R * 1.09, 64, 64]}>
        <meshStandardMaterial
          color="#4FC3F7"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>
      <Sphere args={[GLOBE_R * 1.04, 64, 64]}>
        <meshStandardMaterial
          color="#00AFCA"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>
    </>
  );
}

// ── Spinning globe wrapper ──────────────────────────────────────────────────

interface TrackingGlobeProps {
  originLat: number;
  originLon: number;
  destLat: number;
  destLon: number;
  progress: number; // 0 – 1
}

export function TrackingGlobe({
  originLat,
  originLon,
  destLat,
  destLon,
  progress,
}: TrackingGlobeProps) {
  const origin = useMemo(() => ({ lat: originLat, lon: originLon }), [originLat, originLon]);
  const dest   = useMemo(() => ({ lat: destLat,   lon: destLon   }), [destLat,   destLon  ]);

  const arcPoints    = useMemo(() => buildArcPoints(origin, dest, 120), [origin, dest]);
  const originPos    = useMemo(() => latLonToVec3(originLat, originLon), [originLat, originLon]);
  const destPos      = useMemo(() => latLonToVec3(destLat, destLon), [destLat, destLon]);

  // Ghost trail (full arc, dimmed)
  const remainStart = Math.max(0, Math.floor(progress * (arcPoints.length - 1)) - 1);
  const remainingPts = arcPoints.slice(remainStart);

  return (
    <group>
      <Suspense fallback={<FallbackSphere />}>
        <EarthSphere />
      </Suspense>

      <Atmosphere />

      {/* Remaining arc (dim teal dashes) */}
      {remainingPts.length >= 2 && (
        <Line
          points={remainingPts}
          color="#00AFCA"
          lineWidth={1}
          transparent
          opacity={0.25}
          dashed
          dashSize={0.12}
          gapSize={0.06}
        />
      )}

      {/* Moving marker + gold trail (updated via useFrame) */}
      <DeliveryMarker points={arcPoints} targetProgress={progress} />

      {/* Origin — gold pulsing dot (farm) */}
      <PulsingDot position={originPos} color="#FFD700" size={0.06} />

      {/* Destination — teal pulsing dot */}
      <PulsingDot position={destPos} color="#00AFCA" size={0.06} />
    </group>
  );
}
