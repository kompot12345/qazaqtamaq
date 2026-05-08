'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Sphere, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ROLE_COLORS: Record<string, string> = {
  FARMER: '#2D8A4E',
  B2B_BUYER: '#1A5F9A',
  B2C_BUYER: '#D4AF37',
};

interface IdentityDiskProps {
  role: string;
}

export function IdentityDisk({ role }: IdentityDiskProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const outerRingRef = useRef<THREE.Mesh>(null!);
  const innerRingRef = useRef<THREE.Mesh>(null!);

  const color = ROLE_COLORS[role] ?? '#2D8A4E';

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.4;
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.z = t * 0.8;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -t * 0.5;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 1.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer decorative ring */}
      <Torus ref={outerRingRef} args={[2.2, 0.06, 8, 64]}>
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.4} />
      </Torus>

      {/* Middle ring */}
      <Torus ref={innerRingRef} args={[1.7, 0.04, 8, 64]}>
        <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.05} emissive="#D4AF37" emissiveIntensity={0.6} />
      </Torus>

      {/* Main disk body */}
      <mesh ref={innerRef}>
        <cylinderGeometry args={[1.55, 1.55, 0.12, 64]} />
        <MeshDistortMaterial
          color={color}
          metalness={0.7}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
          distort={0.08}
          speed={2}
        />
      </mesh>

      {/* Central ornament (Shanyrak symbol — simplified) */}
      <Sphere args={[0.35, 32, 32]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0} emissive="#D4AF37" emissiveIntensity={0.8} />
      </Sphere>

      {/* Orbiting particle */}
      <group rotation={[0, 0, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 3) * Math.PI * 2) * 1.2,
              0,
              Math.sin((i / 3) * Math.PI * 2) * 1.2,
            ]}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
