'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { IdentityDisk } from './IdentityDisk';

interface DiskCanvasProps {
  role: string;
}

export default function DiskCanvas({ role }: DiskCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-3, 3, 3]} intensity={1} color="#D4AF37" />
      <Stars radius={80} depth={50} count={2000} factor={3} fade speed={1} />
      <IdentityDisk role={role} />
    </Canvas>
  );
}
