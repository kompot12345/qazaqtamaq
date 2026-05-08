'use client';

import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { SilkRoadGlobe } from './SilkRoadGlobe';

export default function GlobeCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 5.8], fov: 42 }}
      style={{ background: 'transparent', width: '100%', height: '100%', cursor: 'grab' }}
      gl={{ antialias: true, alpha: true }}
    >
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.45}
        rotateSpeed={0.55}
        enableDamping
        dampingFactor={0.07}
      />
      {/* Low ambient so the dark side of Earth stays dark */}
      <ambientLight intensity={0.15} />
      {/* Sun — strong white light from upper-right */}
      <directionalLight position={[5, 3, 5]} intensity={2.2} color="#FFF8F0" />
      {/* Soft blue fill from opposite hemisphere */}
      <directionalLight position={[-4, -2, -4]} intensity={0.12} color="#A8D8EA" />
      {/* Gold accent near Kazakhstan for markers */}
      <pointLight position={[1, 2, 4.5]} intensity={0.6} color="#C9A227" distance={14} />
      <Stars radius={140} depth={80} count={5000} factor={3.5} fade speed={0.25} />
      <SilkRoadGlobe />
    </Canvas>
  );
}
