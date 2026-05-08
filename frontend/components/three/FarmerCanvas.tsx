'use client';

import { Canvas } from '@react-three/fiber';
import { KazakhFarmer } from './KazakhFarmer';

interface Props {
  gender?: 'female' | 'male';
  waving?: boolean;
  scale?: number;
  /** Camera Y position — raise to show less of the base */
  cameraY?: number;
  /** Camera Z — closer = bigger character fills frame */
  cameraZ?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function FarmerCanvas({
  gender = 'female',
  waving = false,
  scale = 1,
  cameraY = 1.05,
  cameraZ = 3.8,
  className = '',
  style,
}: Props) {
  return (
    <Canvas
      camera={{ position: [0, cameraY, cameraZ], fov: 46 }}
      style={{ background: 'transparent', ...style }}
      className={className}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Key light — warm soft front-top, like studio softbox */}
      <directionalLight position={[1.5, 4, 5]} intensity={2.2} color="#FFF6EC" castShadow />
      {/* Right fill — prevents harsh shadows, matches reference even lighting */}
      <directionalLight position={[3, 2, 2]} intensity={0.9} color="#FFEEDD" />
      {/* Left fill */}
      <directionalLight position={[-3, 2, 2]} intensity={0.9} color="#E8F4FF" />
      {/* Top light — brightens hat crown */}
      <directionalLight position={[0, 6, 1]} intensity={0.7} color="#FFFAF0" />
      {/* Ambient — high so colors read cleanly like the reference */}
      <ambientLight intensity={1.1} />
      {/* Warm gold point for trim/belt sheen */}
      <pointLight position={[0, 3, 3.5]} intensity={0.8} color="#FFD060" distance={7} />

      <KazakhFarmer gender={gender} waving={waving} scale={scale} />
    </Canvas>
  );
}
