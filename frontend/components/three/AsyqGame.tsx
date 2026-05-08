'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface AsyqGameProps {
  onScore: (delta: number) => void;
  active: boolean;
}

const CIRCLE_R = 2.5;
const NUM_ASYQS = 10;
const SAKA_START: [number, number, number] = [0, 0.18, 4.5];

// Deterministic ground pebbles so no random on each render
const PEBBLES = Array.from({ length: 28 }, (_, i) => ({
  x: ((i * 7.31 + 2.1) % 11) - 5.5,
  z: ((i * 4.73 + 1.3) % 11) - 5.5,
  r: (i * 1.73) % Math.PI,
  s: 0.04 + (i % 5) * 0.014,
}));

// Deterministic asyq initial rotations
const ASYQ_ROTS = Array.from({ length: NUM_ASYQS }, (_, i) => (i * 2.17) % Math.PI);

function makeAsyqPositions(): [number, number, number][] {
  const positions: [number, number, number][] = [];
  let tries = 0;
  while (positions.length < NUM_ASYQS && tries < 400) {
    tries++;
    const r = Math.random() * (CIRCLE_R - 0.5);
    const a = Math.random() * Math.PI * 2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!positions.some(([px, , pz]) => Math.hypot(px - x, pz - z) < 0.5)) {
      positions.push([x, 0.18, z]);
    }
  }
  return positions;
}

export function AsyqGame({ onScore, active }: AsyqGameProps) {
  // Saka
  const sakaRef = useRef<THREE.Mesh>(null!);
  const sakaPos = useRef(new THREE.Vector3(...SAKA_START));
  const sakaVel = useRef(new THREE.Vector3());
  const sakaFlying = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aim indicator
  const aimRef = useRef<THREE.Mesh>(null!);
  const aimTarget = useRef(new THREE.Vector3(0, 0.01, 2));
  const showAim = useRef(false);

  // Asyq data
  const [asyqPos, setAsyqPos] = useState<[number, number, number][]>(() => makeAsyqPositions());
  const asyqRefs = useRef<(THREE.Mesh | null)[]>(new Array(NUM_ASYQS).fill(null));
  const asyqVels = useRef<THREE.Vector3[]>(
    Array.from({ length: NUM_ASYQS }, () => new THREE.Vector3()),
  );
  const asyqScored = useRef<boolean[]>(new Array(NUM_ASYQS).fill(false));

  const resetGame = useCallback(() => {
    const newPos = makeAsyqPositions();
    setAsyqPos(newPos);
    asyqVels.current.forEach((v) => v.set(0, 0, 0));
    asyqScored.current = new Array(NUM_ASYQS).fill(false);
    asyqRefs.current.forEach((mesh) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.set('#F5E6C8');
      mat.emissive.set('#000000');
      mat.emissiveIntensity = 0;
    });
    sakaPos.current.set(...SAKA_START);
    sakaVel.current.set(0, 0, 0);
    sakaFlying.current = false;
    showAim.current = false;
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  useEffect(() => {
    if (active) resetGame();
    return () => { if (resetTimer.current) clearTimeout(resetTimer.current); };
  }, [active, resetGame]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!active || sakaFlying.current) return;
    aimTarget.current.set(e.point.x, 0.01, e.point.z);
    showAim.current = true;
  }, [active]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!active || sakaFlying.current) return;
    const dx = e.point.x - sakaPos.current.x;
    const dz = e.point.z - sakaPos.current.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.2) return;
    const speed = Math.min(dist * 0.85 + 2.5, 7.5);
    sakaVel.current.set((dx / dist) * speed, 0, (dz / dist) * speed);
    sakaFlying.current = true;
    showAim.current = false;
  }, [active]);

  useFrame((_, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.05);

    // ─── Saka physics ────────────────────────────────────────
    if (sakaFlying.current) {
      const spd = sakaVel.current.length();
      if (spd > 0.1) {
        sakaPos.current.addScaledVector(sakaVel.current, dt);
        sakaVel.current.multiplyScalar(0.965);

        if (Math.abs(sakaPos.current.x) > 5.6) {
          sakaVel.current.x *= -0.65;
          sakaPos.current.x = Math.sign(sakaPos.current.x) * 5.6;
        }
        if (Math.abs(sakaPos.current.z) > 5.6) {
          sakaVel.current.z *= -0.65;
          sakaPos.current.z = Math.sign(sakaPos.current.z) * 5.6;
        }

        // Saka ↔ asyq collisions
        asyqRefs.current.forEach((mesh, i) => {
          if (!mesh) return;
          const dx = sakaPos.current.x - mesh.position.x;
          const dz = sakaPos.current.z - mesh.position.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 0.40 && dist > 0.001) {
            const nx = dx / dist;
            const nz = dz / dist;
            const relVx = sakaVel.current.x - asyqVels.current[i].x;
            const relVz = sakaVel.current.z - asyqVels.current[i].z;
            const imp = relVx * nx + relVz * nz;
            if (imp < 0) {
              const j = imp * 1.55;
              asyqVels.current[i].x -= nx * j * 0.9;
              asyqVels.current[i].z -= nz * j * 0.9;
              sakaVel.current.x += nx * j * 0.18;
              sakaVel.current.z += nz * j * 0.18;
              const overlap = 0.40 - dist;
              sakaPos.current.x += nx * overlap * 0.6;
              sakaPos.current.z += nz * overlap * 0.6;
              mesh.position.x -= nx * overlap * 0.4;
              mesh.position.z -= nz * overlap * 0.4;
            }
          }
        });
      } else {
        sakaFlying.current = false;
        resetTimer.current = setTimeout(() => {
          sakaPos.current.set(...SAKA_START);
          sakaVel.current.set(0, 0, 0);
        }, 700);
      }
    }

    // ─── Asyq physics ────────────────────────────────────────
    for (let i = 0; i < NUM_ASYQS; i++) {
      const mesh = asyqRefs.current[i];
      if (!mesh) continue;
      const vel = asyqVels.current[i];
      const spd = vel.length();

      if (spd > 0.04) {
        mesh.position.x += vel.x * dt;
        mesh.position.z += vel.z * dt;
        vel.multiplyScalar(0.935);
        mesh.rotation.y += spd * dt * 4;

        if (Math.abs(mesh.position.x) > 5.6) { vel.x *= -0.5; mesh.position.x = Math.sign(mesh.position.x) * 5.6; }
        if (Math.abs(mesh.position.z) > 5.6) { vel.z *= -0.5; mesh.position.z = Math.sign(mesh.position.z) * 5.6; }

        // Asyq ↔ asyq
        for (let j = i + 1; j < NUM_ASYQS; j++) {
          const other = asyqRefs.current[j];
          if (!other) continue;
          const dx2 = mesh.position.x - other.position.x;
          const dz2 = mesh.position.z - other.position.z;
          const d = Math.hypot(dx2, dz2);
          if (d < 0.36 && d > 0.001) {
            const nx2 = dx2 / d;
            const nz2 = dz2 / d;
            const imp2 =
              (vel.x - asyqVels.current[j].x) * nx2 +
              (vel.z - asyqVels.current[j].z) * nz2;
            if (imp2 < 0) {
              vel.x -= nx2 * imp2 * 0.55;
              vel.z -= nz2 * imp2 * 0.55;
              asyqVels.current[j].x += nx2 * imp2 * 0.55;
              asyqVels.current[j].z += nz2 * imp2 * 0.55;
            }
          }
        }

        // Score: asyq exits the circle
        const distFromCenter = Math.hypot(mesh.position.x, mesh.position.z);
        if (distFromCenter > CIRCLE_R + 0.1 && !asyqScored.current[i]) {
          asyqScored.current[i] = true;
          onScore(10);
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.set('#4ADE80');
          mat.emissive.set('#166534');
          mat.emissiveIntensity = 0.5;
        }
      }
    }

    // ─── Sync saka mesh ───────────────────────────────────────
    if (sakaRef.current) {
      sakaRef.current.position.copy(sakaPos.current);
      if (sakaFlying.current) {
        sakaRef.current.rotation.x += sakaVel.current.z * dt * 8;
        sakaRef.current.rotation.z -= sakaVel.current.x * dt * 8;
      }
    }

    // ─── Aim indicator ───────────────────────────────────────
    if (aimRef.current) {
      aimRef.current.position.set(aimTarget.current.x, 0.01, aimTarget.current.z);
      aimRef.current.rotation.y += dt * 3;
      aimRef.current.visible = showAim.current && !sakaFlying.current && active;
    }
  });

  return (
    <group>
      {/* Sandy steppe ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#C4A265" roughness={0.95} />
      </mesh>

      {/* Ground pebbles / texture */}
      {PEBBLES.map((p, i) => (
        <mesh key={i} position={[p.x, 0.01, p.z]} rotation={[-Math.PI / 2, 0, p.r]}>
          <circleGeometry args={[p.s, 5]} />
          <meshStandardMaterial color="#9A7040" />
        </mesh>
      ))}

      {/* Circle interior tint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[CIRCLE_R, 72]} />
        <meshStandardMaterial color="#D4B890" opacity={0.35} transparent />
      </mesh>

      {/* White chalk circle outline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[CIRCLE_R - 0.055, CIRCLE_R + 0.055, 72]} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.92} transparent />
      </mesh>

      {/* Throw line (foul line) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, CIRCLE_R + 0.6]}>
        <planeGeometry args={[6, 0.04]} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.45} transparent />
      </mesh>

      {/* Saka starting zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 4.5]}>
        <circleGeometry args={[0.42, 36]} />
        <meshStandardMaterial color="#FFD700" opacity={0.28} transparent />
      </mesh>

      {/* Golden Saka */}
      <mesh ref={sakaRef} castShadow position={SAKA_START}>
        <sphereGeometry args={[0.21, 32, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.88}
          roughness={0.08}
          emissive="#C9A227"
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Asyq bone pieces (capsule geometry — ankle-bone shape) */}
      {asyqPos.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { asyqRefs.current[i] = el; }}
          position={pos}
          rotation={[Math.PI / 2 + 0.12, ASYQ_ROTS[i], 0]}
          castShadow
        >
          <capsuleGeometry args={[0.08, 0.22, 4, 8]} />
          <meshStandardMaterial color="#F5E6C8" roughness={0.72} />
        </mesh>
      ))}

      {/* Spinning aim ring */}
      <mesh ref={aimRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.14, 0.24, 32]} />
        <meshStandardMaterial color="#FFD700" opacity={0.85} transparent />
      </mesh>

      {/* Invisible pointer capture plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      >
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
