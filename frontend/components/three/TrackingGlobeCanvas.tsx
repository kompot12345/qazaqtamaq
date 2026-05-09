'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import { TrackingGlobe, latLonToVec3 } from './TrackingGlobe';

interface Props {
  originLat: number;
  originLon: number;
  destLat: number;
  destLon: number;
  progress: number;
}

function getCameraPosition(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
): THREE.Vector3 {
  const midLat = (originLat + destLat) / 2;
  const midLon = (originLon + destLon) / 2;
  const dir = latLonToVec3(midLat, midLon, 1).normalize();
  return dir.multiplyScalar(6.5);
}

export default function TrackingGlobeCanvas({
  originLat,
  originLon,
  destLat,
  destLon,
  progress,
}: Props) {
  const cameraPos = useMemo(
    () => getCameraPosition(originLat, originLon, destLat, destLon),
    [originLat, originLon, destLat, destLon],
  );

  return (
    <Canvas
      camera={{ position: [cameraPos.x, cameraPos.y, cameraPos.z], fov: 42, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 6, 4]} intensity={1.2} color="#fff8e7" />
      <directionalLight position={[-5, -3, -4]} intensity={0.18} color="#4FC3F7" />

      <Stars radius={80} depth={60} count={4000} factor={3} saturation={0} fade speed={0.4} />

      <TrackingGlobe
        originLat={originLat}
        originLon={originLon}
        destLat={destLat}
        destLon={destLon}
        progress={progress}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.35}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
      />
    </Canvas>
  );
}
