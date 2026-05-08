'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Palette matched to reference image ─── */
const C = {
  skin:       '#EABC8C',
  skinShade:  '#C8905A',
  teal:       '#42BCBA',
  tealDark:   '#2C9C98',
  cream:      '#F2EDE0',
  creamDark:  '#D8D0B8',
  gold:       '#CFA020',
  goldBright: '#ECC030',
  blue:       '#5280C4',
  blueDark:   '#3A60A0',
  boot:       '#5C3618',
  bootDark:   '#3E2210',
  brown:      '#7C5028',
  brownMid:   '#9A6838',
  brownLight: '#BA8848',
  basket:     '#B07840',
  dark:       '#180A04',
  orange:     '#E87820',
  red:        '#D42828',
  green:      '#389038',
  greenDark:  '#286828',
  white:      '#F8F6EE',
  gray:       '#7A7A7A',
  hair:       '#180804',
  lips:       '#C25850',
  pink:       '#E89080',
  wood:       '#9A6838',
  woodDark:   '#724E26',
  grass:      '#4A8A36',
  grassDark:  '#326224',
};

/* cloth/matte material roughness ~0.7, skin 0.55, gold shiny */
function Mat({
  color, roughness = 0.72, metalness = 0, transparent = false, opacity = 1,
}: {
  color: string; roughness?: number; metalness?: number; transparent?: boolean; opacity?: number;
}) {
  return (
    <meshStandardMaterial color={color} roughness={roughness}
      metalness={metalness} transparent={transparent} opacity={opacity} />
  );
}

interface Props {
  gender?: 'female' | 'male';
  waving?: boolean;
  scale?: number;
}

export function KazakhFarmer({ gender = 'female', waving = false, scale = 1 }: Props) {
  const rootRef     = useRef<THREE.Group>(null!);
  const headRef     = useRef<THREE.Group>(null!);
  const leftArmRef  = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (rootRef.current) {
      rootRef.current.position.y = Math.sin(t * 1.3) * 0.018;
      rootRef.current.rotation.z = Math.sin(t * 0.6) * 0.012;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.12;
      headRef.current.rotation.z = Math.sin(t * 0.38) * 0.05;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(t * 0.9) * 0.04;
    }
    if (rightArmRef.current) {
      if (waving) {
        rightArmRef.current.rotation.z = -0.9 + Math.sin(t * 4.0) * 0.72;
        rightArmRef.current.rotation.x = 0.3 + Math.sin(t * 4.0) * 0.24;
      } else {
        rightArmRef.current.rotation.x = -Math.sin(t * 0.9) * 0.04;
        rightArmRef.current.rotation.z = -0.08;
      }
    }
  });

  const isFemale = gender === 'female';

  return (
    <group ref={rootRef} scale={[scale, scale, scale]}>

      {/* ══════ WOODEN BASE WITH GRASS ══════ */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.72, 0.16, 0.64]} /><Mat color={C.wood} roughness={0.78} />
      </mesh>
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <mesh key={i} position={[x, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.005, 0.60]} /><Mat color={C.woodDark} roughness={0.85} />
        </mesh>
      ))}
      {/* Grass layer on top of base */}
      <mesh position={[0, -0.034, 0]}>
        <boxGeometry args={[0.68, 0.02, 0.60]} /><Mat color={C.grass} roughness={0.88} />
      </mesh>
      {/* Grass tufts */}
      {[[-0.26,-0.2],[0.24,-0.18],[-0.08,0.24],[0.28,0.1],[-0.3,0.08],[0.05,-0.22],[0.14,0.22],[-0.18,0.06]].map(([x,z],i) => (
        <mesh key={i} position={[x as number, -0.01, z as number]}>
          <sphereGeometry args={[0.055, 6, 4]} /><Mat color={C.grassDark} roughness={0.9} />
        </mesh>
      ))}

      {/* ══════ BOOTS — tall dark leather ══════ */}
      {([-0.11, 0.11] as const).map((x, i) => (
        <group key={i} position={[x, 0.2, 0]}>
          {/* Shaft */}
          <mesh><cylinderGeometry args={[0.082, 0.076, 0.38, 12]} /><Mat color={C.boot} roughness={0.65} /></mesh>
          {/* Rounded toe */}
          <mesh position={[0, -0.175, 0.088]}>
            <sphereGeometry args={[0.088, 12, 8]} /><Mat color={C.boot} roughness={0.65} />
          </mesh>
          {/* Sole */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.094, 0.094, 0.018, 12]} /><Mat color={C.bootDark} roughness={0.62} />
          </mesh>
          {/* Top rim */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.086, 0.086, 0.028, 12]} /><Mat color={C.bootDark} roughness={0.62} />
          </mesh>
        </group>
      ))}

      {/* ══════ PANTS — blue, slightly puffed ══════ */}
      {([-0.11, 0.11] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0]}>
          <cylinderGeometry args={[0.1, 0.092, 0.27, 12]} /><Mat color={C.blue} roughness={0.76} />
        </mesh>
      ))}
      {/* Crotch join */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.145, 12, 9]} /><Mat color={C.blue} roughness={0.76} />
      </mesh>

      {/* ══════ CHAPAN (COAT) ══════ */}
      {/* Main teal body */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.218, 0.272, 0.66, 16]} /><Mat color={C.teal} roughness={0.72} />
      </mesh>

      {/* ─── CREAM SHIRT / WIDE V-NECK ─── */}
      {/* Center chest panel */}
      <mesh position={[0, 0.88, 0.214]}>
        <boxGeometry args={[0.155, 0.58, 0.018]} /><Mat color={C.cream} roughness={0.68} />
      </mesh>
      {/* Left lapel flap (angled, visible cream flap going up-right to collar) */}
      <mesh position={[-0.062, 0.98, 0.21]} rotation={[0, 0, 0.32]}>
        <boxGeometry args={[0.02, 0.28, 0.016]} /><Mat color={C.cream} roughness={0.68} />
      </mesh>
      <mesh position={[0.062, 0.98, 0.21]} rotation={[0, 0, -0.32]}>
        <boxGeometry args={[0.02, 0.28, 0.016]} /><Mat color={C.cream} roughness={0.68} />
      </mesh>

      {/* ─── ORNAMENTAL BORDER SYSTEM ─── */}
      {/* Bottom hem — dark brown band */}
      <mesh position={[0, 0.568, 0]}>
        <cylinderGeometry args={[0.276, 0.278, 0.095, 18]} /><Mat color={C.bootDark} roughness={0.62} />
      </mesh>
      {/* Gold stripes top/bottom of hem band */}
      <mesh position={[0, 0.618, 0]}>
        <cylinderGeometry args={[0.274, 0.274, 0.02, 18]} /><Mat color={C.gold} roughness={0.3} metalness={0.52} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.276, 0.278, 0.016, 18]} /><Mat color={C.gold} roughness={0.3} metalness={0.52} />
      </mesh>
      {/* Teal swirl ornament dots on hem */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a)*0.273, 0.568, Math.cos(a)*0.273]}>
            <sphereGeometry args={[0.011, 5, 5]} /><Mat color={C.teal} roughness={0.4} />
          </mesh>
        );
      })}

      {/* LEFT LAPEL ornamental border strip */}
      <mesh position={[-0.092, 0.88, 0.208]} rotation={[0, 0, 0.36]}>
        <boxGeometry args={[0.034, 0.64, 0.015]} /><Mat color={C.bootDark} roughness={0.62} />
      </mesh>
      <mesh position={[-0.092, 0.88, 0.212]} rotation={[0, 0, 0.36]}>
        <boxGeometry args={[0.014, 0.62, 0.012]} /><Mat color={C.gold} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* RIGHT LAPEL ornamental border strip */}
      <mesh position={[0.092, 0.88, 0.208]} rotation={[0, 0, -0.36]}>
        <boxGeometry args={[0.034, 0.64, 0.015]} /><Mat color={C.bootDark} roughness={0.62} />
      </mesh>
      <mesh position={[0.092, 0.88, 0.212]} rotation={[0, 0, -0.36]}>
        <boxGeometry args={[0.014, 0.62, 0.012]} /><Mat color={C.gold} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Collar band */}
      <mesh position={[0, 1.065, 0]}>
        <cylinderGeometry args={[0.214, 0.214, 0.044, 14]} /><Mat color={C.gold} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.065, 0]}>
        <cylinderGeometry args={[0.218, 0.218, 0.018, 14]} /><Mat color={C.bootDark} roughness={0.62} />
      </mesh>

      {/* ─── BELT ─── */}
      <mesh position={[0, 0.71, 0]}>
        <cylinderGeometry args={[0.256, 0.256, 0.065, 18]} /><Mat color={C.brown} roughness={0.65} />
      </mesh>
      {/* Belt weave texture lines */}
      {[-0.018, 0, 0.018].map((dy, i) => (
        <mesh key={i} position={[0, 0.71 + dy, 0]}>
          <cylinderGeometry args={[0.258, 0.258, 0.004, 18]} /><Mat color={C.bootDark} roughness={0.6} />
        </mesh>
      ))}
      {/* Buckle */}
      <mesh position={[0, 0.71, 0.252]}>
        <boxGeometry args={[0.054, 0.042, 0.014]} /><Mat color={C.gold} roughness={0.2} metalness={0.82} />
      </mesh>
      <mesh position={[0, 0.71, 0.256]}>
        <boxGeometry args={[0.024, 0.018, 0.01]} /><Mat color={C.bootDark} roughness={0.6} />
      </mesh>

      {/* ─── BACK ORNAMENT (Kazakh shanyrak motif) ─── */}
      <mesh position={[0, 0.86, -0.228]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.076, 0.014, 5, 18]} /><Mat color={C.brown} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.86, -0.232]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.042, 0.009, 5, 12]} /><Mat color={C.gold} roughness={0.28} metalness={0.5} />
      </mesh>
      {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((r, i) => (
        <mesh key={i} position={[0, 0.86, -0.232]} rotation={[Math.PI/2, 0, r]}>
          <boxGeometry args={[0.14, 0.01, 0.007]} /><Mat color={C.brown} roughness={0.6} />
        </mesh>
      ))}
      {[Math.PI/4, Math.PI*3/4, Math.PI*5/4, Math.PI*7/4].map((a, i) => (
        <mesh key={i}
          position={[Math.sin(a)*0.056, 0.86+Math.cos(a)*0.056, -0.232]}
          rotation={[Math.PI/2, 0, a+Math.PI/2]}>
          <torusGeometry args={[0.024, 0.007, 4, 8, Math.PI*0.9]} />
          <Mat color={C.gold} roughness={0.28} metalness={0.48} />
        </mesh>
      ))}

      {/* ══════ LEFT ARM — basket (elbow bent outward) ══════ */}
      <group ref={leftArmRef} position={[-0.264, 0.94, 0.02]} rotation={[0.22, 0.06, 0.3]}>
        {/* Upper arm */}
        <mesh><cylinderGeometry args={[0.074, 0.07, 0.28, 10]} /><Mat color={C.teal} roughness={0.7} /></mesh>
        {/* Gold cuff */}
        <mesh position={[0, -0.155, 0]}>
          <cylinderGeometry args={[0.076, 0.076, 0.026, 10]} /><Mat color={C.gold} roughness={0.28} metalness={0.52} />
        </mesh>
        {/* Forearm — angled forward/down toward waist */}
        <mesh position={[0, -0.31, 0.07]} rotation={[0.52, 0, 0]}>
          <cylinderGeometry args={[0.064, 0.06, 0.26, 10]} /><Mat color={C.skin} roughness={0.56} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.48, 0.19]}>
          <sphereGeometry args={[0.074, 10, 10]} /><Mat color={C.skin} roughness={0.56} />
        </mesh>

        {/* ── WICKER BASKET ── */}
        <group position={[0.02, -0.62, 0.28]}>
          {/* Body */}
          <mesh>
            <cylinderGeometry args={[0.132, 0.104, 0.135, 14]} /><Mat color={C.basket} roughness={0.78} />
          </mesh>
          {/* Wicker weave horizontal bands */}
          {Array.from({length:6},(_,j) => (
            <mesh key={j} position={[0,-0.044+j*0.03,0]} rotation={[Math.PI/2,0,0]}>
              <torusGeometry args={[0.12,0.0055,4,16]} /><Mat color={C.brownLight} roughness={0.82} />
            </mesh>
          ))}
          {/* Vertical wicker lines */}
          {Array.from({length:8},(_,j) => {
            const a=(j/8)*Math.PI*2;
            return (
              <mesh key={j} position={[Math.sin(a)*0.118,0,Math.cos(a)*0.118]} rotation={[0,a,0]}>
                <boxGeometry args={[0.007,0.13,0.007]} /><Mat color={C.brownMid} roughness={0.8} />
              </mesh>
            );
          })}
          {/* Rim ring */}
          <mesh position={[0,0.076,0]}>
            <torusGeometry args={[0.126,0.014,6,16]} /><Mat color={C.brown} roughness={0.72} />
          </mesh>
          {/* Handle arc */}
          <mesh rotation={[Math.PI/2,0,0]} position={[0,0.12,0]}>
            <torusGeometry args={[0.094,0.015,8,18,Math.PI]} /><Mat color={C.brown} roughness={0.72} />
          </mesh>

          {/* Vegetables */}
          {/* Orange carrot */}
          <mesh position={[0.048,0.096,0.036]} rotation={[0,0,0.52]}>
            <coneGeometry args={[0.026,0.096,7]} /><Mat color={C.orange} roughness={0.55} />
          </mesh>
          <mesh position={[0.084,0.144,0.05]}><sphereGeometry args={[0.022,6,6]} /><Mat color={C.green} roughness={0.6} /></mesh>
          {/* Red radish */}
          <mesh position={[-0.054,0.094,0.032]}><sphereGeometry args={[0.038,9,9]} /><Mat color={C.red} roughness={0.5} /></mesh>
          <mesh position={[-0.054,0.134,0.032]}><sphereGeometry args={[0.02,6,6]} /><Mat color={C.green} roughness={0.6} /></mesh>
          {/* Green potato/veggie */}
          <mesh position={[0.012,0.096,-0.056]}><sphereGeometry args={[0.033,8,8]} /><Mat color="#B8A040" roughness={0.65} /></mesh>
          {/* Extra green veggie */}
          <mesh position={[-0.03,0.1,0.06]}><sphereGeometry args={[0.025,7,7]} /><Mat color={C.green} roughness={0.58} /></mesh>

          {/* LAMB — fluffy white, sitting in basket */}
          {/* Body */}
          <mesh position={[0.074,0.122,-0.034]}><sphereGeometry args={[0.05,12,12]} /><Mat color={C.white} roughness={0.88} /></mesh>
          {/* Wool bumps */}
          {Array.from({length:7},(_,j) => {
            const a=(j/7)*Math.PI*2;
            return (
              <mesh key={j} position={[0.074+Math.sin(a)*0.038,0.136,-0.034+Math.cos(a)*0.038]}>
                <sphereGeometry args={[0.022,6,6]} /><Mat color={C.white} roughness={0.88} />
              </mesh>
            );
          })}
          {/* Head */}
          <mesh position={[0.116,0.128,0.03]}><sphereGeometry args={[0.034,10,10]} /><Mat color="#CAC6B6" roughness={0.65} /></mesh>
          {/* Ears */}
          <mesh position={[0.122,0.152,0.04]} rotation={[0,0,0.44]}><sphereGeometry args={[0.016,6,6]} /><Mat color="#B8B4A4" roughness={0.65} /></mesh>
          {/* Eye */}
          <mesh position={[0.134,0.126,0.056]}><sphereGeometry args={[0.009,7,7]} /><Mat color={C.dark} roughness={0.9} /></mesh>
          <mesh position={[0.138,0.128,0.06]}><sphereGeometry args={[0.005,5,5]} /><Mat color={C.white} roughness={0.2} /></mesh>
        </group>
      </group>

      {/* ══════ RIGHT ARM — staff ══════ */}
      <group ref={rightArmRef} position={[0.264, 0.94, 0.02]} rotation={[0.04, 0, -0.08]}>
        <mesh><cylinderGeometry args={[0.074, 0.07, 0.28, 10]} /><Mat color={C.teal} roughness={0.7} /></mesh>
        <mesh position={[0,-0.155,0]}><cylinderGeometry args={[0.076,0.076,0.026,10]} /><Mat color={C.gold} roughness={0.28} metalness={0.52} /></mesh>
        <mesh position={[0,-0.3,0]} rotation={[-0.08,0,0]}>
          <cylinderGeometry args={[0.064,0.06,0.26,10]} /><Mat color={C.skin} roughness={0.56} />
        </mesh>
        <mesh position={[0.014,-0.475,-0.02]}><sphereGeometry args={[0.074,10,10]} /><Mat color={C.skin} roughness={0.56} /></mesh>
        {/* Long wooden staff pole */}
        <mesh position={[0.055,0.15,-0.075]} rotation={[0.1,0,0.06]}>
          <cylinderGeometry args={[0.022,0.016,1.8,8]} /><Mat color={C.brownMid} roughness={0.82} />
        </mesh>
        {/* Bottom ferrule */}
        <mesh position={[0.072,-0.77,-0.23]} rotation={[0.1,0,0.06]}>
          <cylinderGeometry args={[0.028,0.028,0.036,8]} /><Mat color={C.gray} roughness={0.28} metalness={0.8} />
        </mesh>
        {/* HOE BLADE at top — flat axe/hoe shape */}
        <mesh position={[0.1,1.02,-0.34]} rotation={[0.78,0,0.22]}>
          <boxGeometry args={[0.095,0.055,0.014]} /><Mat color={C.gray} roughness={0.25} metalness={0.82} />
        </mesh>
        {/* Socket connector */}
        <mesh position={[0.092,0.9,-0.3]} rotation={[0.78,0,0.22]}>
          <cylinderGeometry args={[0.028,0.028,0.04,8]} /><Mat color={C.gray} roughness={0.26} metalness={0.78} />
        </mesh>
      </group>

      {/* ══════ NECK ══════ */}
      <mesh position={[0,1.1,0]}>
        <cylinderGeometry args={[0.092,0.1,0.1,12]} /><Mat color={C.skin} roughness={0.58} />
      </mesh>

      {/* ══════ HEAD GROUP (pivot at head center y=1.32) ══════ */}
      <group ref={headRef} position={[0, 1.32, 0]}>

        {/* ─ Big round head sphere ─ */}
        <mesh><sphereGeometry args={[0.258, 22, 22]} /><Mat color={C.skin} roughness={0.56} /></mesh>

        {/* Chubby cheek pads (pushes face width out) */}
        {([-1,1] as const).map((s,i) => (
          <mesh key={i} position={[s*0.235, -0.04, 0.11]}>
            <sphereGeometry args={[0.11, 10, 8]} /><Mat color={C.skin} roughness={0.54} />
          </mesh>
        ))}

        {/* Ears */}
        {([-1,1] as const).map((s,i) => (
          <mesh key={i} position={[s*0.252, 0.03, 0]}>
            <sphereGeometry args={[0.068, 10, 9]} /><Mat color={C.skin} roughness={0.56} />
          </mesh>
        ))}

        {/* ─── EYES ─── */}
        {([-0.105, 0.105] as const).map((x,i) => (
          <group key={i} position={[x, 0.075, 0]}>
            {/* Sclera */}
            <mesh position={[0,0,0.238]}>
              <sphereGeometry args={[0.05, 12, 12]} /><Mat color={C.white} roughness={0.22} />
            </mesh>
            {/* Iris — warm brown */}
            <mesh position={[0,0,0.276]}>
              <sphereGeometry args={[0.032, 10, 10]} /><Mat color="#3E2818" roughness={0.7} />
            </mesh>
            {/* Pupil */}
            <mesh position={[0,0,0.292]}>
              <sphereGeometry args={[0.019, 9, 9]} /><Mat color={C.dark} roughness={0.9} />
            </mesh>
            {/* Catchlight */}
            <mesh position={[0.01,0.012,0.302]}>
              <sphereGeometry args={[0.009, 7, 7]} /><Mat color={C.white} roughness={0.1} />
            </mesh>
            {/* Eyelid upper line */}
            <mesh position={[0,0.036,0.274]}>
              <boxGeometry args={[0.068, 0.016, 0.008]} /><Mat color={C.dark} roughness={0.82} />
            </mesh>
          </group>
        ))}

        {/* Nose — round button */}
        <mesh position={[0, 0.016, 0.254]}>
          <sphereGeometry args={[0.028, 9, 8]} /><Mat color={C.skinShade} roughness={0.6} />
        </mesh>

        {/* Warm friendly smile */}
        <mesh position={[0,-0.065,0]} rotation={[0.38,0,0]}>
          <torusGeometry args={[0.072, 0.013, 5, 12, Math.PI*0.76]} /><Mat color={C.skinShade} roughness={0.65} />
        </mesh>
        {/* Teeth hint */}
        <mesh position={[0,-0.072,0.27]}>
          <boxGeometry args={[0.062,0.014,0.008]} /><Mat color={C.white} roughness={0.3} />
        </mesh>

        {/* Rosy cheeks — soft blush */}
        {([-0.178, 0.178] as const).map((x,i) => (
          <mesh key={i} position={[x,-0.04,0.232]}>
            <sphereGeometry args={[0.058, 9, 8]} />
            <Mat color={C.pink} roughness={0.9} transparent opacity={0.4} />
          </mesh>
        ))}

        {/* ─── GENDER FEATURES ─── */}
        {isFemale ? (
          <>
            {/* Thin arched brows */}
            {([-0.105, 0.105] as const).map((x,i) => (
              <mesh key={i} position={[x,0.148,0.248]} rotation={[0,0,i===0?0.12:-0.12]}>
                <boxGeometry args={[0.068,0.013,0.007]} /><Mat color={C.dark} roughness={0.82} />
              </mesh>
            ))}
            {/* Long braid — root near hat, hangs left */}
            <mesh position={[-0.268,0.1,-0.11]} rotation={[0.1,0.2,0.4]}>
              <cylinderGeometry args={[0.032,0.028,0.46,7]} /><Mat color={C.hair} roughness={0.68} />
            </mesh>
            {[0,1,2,3,4,5].map(j => (
              <mesh key={j} position={[-0.276-j*0.01,0.06-j*0.094,-0.09+j*0.012]}>
                <sphereGeometry args={[0.03,6,5]} /><Mat color={C.hair} roughness={0.68} />
              </mesh>
            ))}
            <mesh position={[-0.305,-0.44,-0.04]} rotation={[0.04,0.1,0.18]}>
              <cylinderGeometry args={[0.024,0.019,0.42,6]} /><Mat color={C.hair} roughness={0.68} />
            </mesh>
            <mesh position={[-0.314,-0.65,-0.03]}>
              <sphereGeometry args={[0.025,7,7]} /><Mat color={C.hair} roughness={0.68} />
            </mesh>
            {/* Front wisp */}
            <mesh position={[-0.185,0.18,0.175]} rotation={[0.14,0.24,0.26]}>
              <cylinderGeometry args={[0.016,0.012,0.13,5]} /><Mat color={C.hair} roughness={0.68} />
            </mesh>
            {/* Earrings */}
            {([-0.268, 0.268] as const).map((x,i) => (
              <group key={i} position={[x,-0.01,0.082]}>
                <mesh><sphereGeometry args={[0.02,8,8]} /><Mat color={C.gold} roughness={0.15} metalness={0.88} /></mesh>
                <mesh position={[0,-0.03,0]}><sphereGeometry args={[0.014,7,7]} /><Mat color={C.goldBright} roughness={0.12} metalness={0.9} /></mesh>
              </group>
            ))}
          </>
        ) : (
          <>
            {/* Thick dark brows — characteristic male */}
            {([-0.105, 0.105] as const).map((x,i) => (
              <mesh key={i} position={[x,0.152,0.252]} rotation={[0,0,i===0?0.18:-0.18]}>
                <boxGeometry args={[0.08,0.022,0.01]} /><Mat color={C.dark} roughness={0.82} />
              </mesh>
            ))}
            {/* Droopy mustache — big, signature style */}
            <mesh position={[-0.044,-0.048,0.276]} rotation={[0,0,0.45]}>
              <boxGeometry args={[0.086,0.03,0.018]} /><Mat color={C.dark} roughness={0.82} />
            </mesh>
            <mesh position={[0.044,-0.048,0.276]} rotation={[0,0,-0.45]}>
              <boxGeometry args={[0.086,0.03,0.018]} /><Mat color={C.dark} roughness={0.82} />
            </mesh>
            {/* Center bridge */}
            <mesh position={[0,-0.059,0.28]}>
              <boxGeometry args={[0.026,0.022,0.014]} /><Mat color={C.dark} roughness={0.82} />
            </mesh>
            {/* Short dark hair at sides of hat */}
            {([-0.262,0.262] as const).map((x,i) => (
              <mesh key={i} position={[x,0.185,0.072]} rotation={[0.08,0,i===0?0.08:-0.08]}>
                <boxGeometry args={[0.016,0.12,0.013]} /><Mat color={C.hair} roughness={0.72} />
              </mesh>
            ))}
          </>
        )}

        {/* ══════ KALPAK HAT ══════ */}

        {/* Leather brim band — brown, at base of crown */}
        <mesh position={[0,0.272,0]}>
          <cylinderGeometry args={[0.295,0.302,0.08,18]} /><Mat color="#4E3014" roughness={0.64} />
        </mesh>
        {/* Brim overhanging ring — clearly wider */}
        <mesh position={[0,0.278,0]}>
          <cylinderGeometry args={[0.322,0.332,0.034,20]} /><Mat color="#3C2208" roughness={0.62} />
        </mesh>
        {/* Brim top edge */}
        <mesh position={[0,0.296,0]}>
          <torusGeometry args={[0.326,0.009,7,22]} /><Mat color="#5E3C18" roughness={0.66} />
        </mesh>

        {/* Crown body — white felt, nearly cylindrical, slightly wider at top */}
        <mesh position={[0,0.556,0]}>
          <cylinderGeometry args={[0.274,0.268,0.52,18]} /><Mat color={C.cream} roughness={0.62} />
        </mesh>
        {/* Crown top dome */}
        <mesh position={[0,0.82,0]}>
          <sphereGeometry args={[0.148,16,12]} /><Mat color={C.cream} roughness={0.62} />
        </mesh>

        {/* ── Front ornament strip ── */}
        {/* Dark leather backing */}
        <mesh position={[0,0.555,0.276]}>
          <boxGeometry args={[0.062,0.33,0.014]} /><Mat color="#5E3E18" roughness={0.62} />
        </mesh>
        {/* Vertical gold line */}
        <mesh position={[0,0.555,0.283]}>
          <boxGeometry args={[0.008,0.29,0.009]} /><Mat color={C.gold} roughness={0.25} metalness={0.6} />
        </mesh>
        {/* Top diamond gem */}
        <mesh position={[0,0.718,0.284]}>
          <boxGeometry args={[0.032,0.032,0.012]} /><Mat color={C.gold} roughness={0.2} metalness={0.65} />
        </mesh>
        {/* Center jewel */}
        <mesh position={[0,0.555,0.284]}>
          <sphereGeometry args={[0.022,9,9]} /><Mat color={C.gold} roughness={0.18} metalness={0.68} />
        </mesh>
        {/* Bottom diamond */}
        <mesh position={[0,0.394,0.284]}>
          <boxGeometry args={[0.024,0.024,0.011]} /><Mat color={C.gold} roughness={0.2} metalness={0.65} />
        </mesh>
        {/* Wing lines spreading from center */}
        {([-1,1] as const).map((s,i) => (
          <mesh key={i} position={[s*0.018,0.555,0.283]} rotation={[0,0,s*0.7]}>
            <boxGeometry args={[0.008,0.1,0.008]} /><Mat color={C.gold} roughness={0.22} metalness={0.62} />
          </mesh>
        ))}

        {/* ── Side stitching lines ── */}
        {([-1,1] as const).map((s,i) => (
          <mesh key={i} position={[s*0.236,0.548,0.172]} rotation={[0,s*-0.62,0]}>
            <boxGeometry args={[0.013,0.25,0.01]} /><Mat color="#5E3E18" roughness={0.66} />
          </mesh>
        ))}

        {/* ── Feather ── */}
        <mesh position={[0.018,0.974,0.074]} rotation={[0.42,0.2,0.26]}>
          <cylinderGeometry args={[0.012,0.003,0.28,5]} /><Mat color={C.creamDark} roughness={0.92} />
        </mesh>
        <mesh position={[0.025,1.12,0.124]} rotation={[0.42,0.2,0.26]}>
          <sphereGeometry args={[0.02,8,8]} /><Mat color={C.creamDark} roughness={0.92} />
        </mesh>

      </group>{/* end HEAD GROUP */}

    </group>
  );
}
