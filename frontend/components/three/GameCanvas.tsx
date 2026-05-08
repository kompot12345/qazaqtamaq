'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AsyqGame } from './AsyqGame';

interface GameCanvasProps {
  onScore: (delta: number) => void;
  active: boolean;
}

export default function GameCanvas({ onScore, active }: GameCanvasProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 7.5], fov: 48 }}
      style={{ background: '#060D1A', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 10, 4]} intensity={1.8} castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[0, 3, 3]} intensity={0.8} color="#FFD700" />
      <hemisphereLight args={['#B8D4F8', '#8B6914', 0.35]} />
      <AsyqGame onScore={onScore} active={active} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.4}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
      />
    </Canvas>
  );
}
