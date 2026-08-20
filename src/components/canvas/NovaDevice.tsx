"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PARTS, runtime, type PartName } from "./runtime";

const BODY_R = 1;
const UPPER_H = 0.3;
const LOWER_H = 0.26;

/**
 * Go-stone (碁石) silhouette: flat-ish crown, thin tangent rim.
 * Points are emitted bottom-to-top so LatheGeometry winds outward normals.
 */
function crown(height: number, up: boolean, segments = 48) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    // rim → axis for the upper half, axis → rim for the lower half
    const t = up ? 1 - i / segments : i / segments;
    const y = height * Math.pow(1 - Math.pow(t, 2.6), 0.72);
    pts.push(new THREE.Vector2(t * BODY_R, up ? y : -y));
  }
  return pts;
}

/** Shallow concave dish sunk into the crown: r 0.58, depth 0.05. */
function dishProfile(segments = 28) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pts.push(new THREE.Vector2(t * 0.58, -0.05 * (1 - t * t)));
  }
  return pts;
}

const MIC_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

/** the nine exploding groups, listed once instead of per frame */
const PART_KEYS = Object.keys(PARTS) as PartName[];

export default function NovaDevice() {
  const upper = useMemo(() => crown(UPPER_H, true), []);
  const lower = useMemo(() => crown(LOWER_H, false), []);
  const dish = useMemo(() => dishProfile(), []);

  const groups = {
    bodyUpper: useRef<THREE.Group>(null),
    bodyLower: useRef<THREE.Group>(null),
    dish: useRef<THREE.Group>(null),
    ring: useRef<THREE.Group>(null),
    micRing: useRef<THREE.Group>(null),
    board: useRef<THREE.Group>(null),
    battery: useRef<THREE.Group>(null),
    coil: useRef<THREE.Group>(null),
    band: useRef<THREE.Group>(null),
  };

  const shellMats = useRef<(THREE.MeshPhysicalMaterial | null)[]>([]);
  const ringMat = useRef<THREE.MeshStandardMaterial>(null);
  const chipMat = useRef<THREE.MeshStandardMaterial>(null);
  const halo = useRef<THREE.Mesh>(null);
  const haloMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const e = runtime.explode;

    for (const key of PART_KEYS) {
      const g = groups[key].current;
      if (!g) continue;
      const part = PARTS[key];
      g.position.y = part.y + part.e * e;
    }
    // board tilts open as it lifts out
    if (groups.board.current) groups.board.current.rotation.y = e * 0.4;

    for (const mat of shellMats.current) {
      if (mat) mat.envMapIntensity = runtime.envInt;
    }

    if (ringMat.current) {
      ringMat.current.emissiveIntensity = runtime.ringEI;
      ringMat.current.emissive.copy(runtime.ringColor);
    }
    if (chipMat.current) chipMat.current.emissiveIntensity = runtime.chipEI;

    if (halo.current && haloMat.current) {
      halo.current.visible = e > 0.015;
      halo.current.position.y = runtime.haloY;
      halo.current.scale.setScalar(runtime.haloR);
      haloMat.current.emissiveIntensity = runtime.haloEI;
    }
  });

  return (
    <group>
      {/* upper shell */}
      <group ref={groups.bodyUpper}>
        <mesh>
          <latheGeometry args={[upper, 128]} />
          <meshPhysicalMaterial
            ref={(mat) => {
              shellMats.current[0] = mat;
            }}
            color="#08090b"
            metalness={0.55}
            roughness={0.16}
            clearcoat={1}
            /* 0.1 mirrored the HDRI panel as a hard slab of white; spreading
               the clearcoat turns it into a gradient the eye reads as glass */
            clearcoatRoughness={0.32}
            envMapIntensity={1.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* lower shell */}
      <group ref={groups.bodyLower}>
        <mesh>
          <latheGeometry args={[lower, 128]} />
          <meshPhysicalMaterial
            ref={(mat) => {
              shellMats.current[1] = mat;
            }}
            color="#08090b"
            metalness={0.55}
            roughness={0.16}
            clearcoat={1}
            /* 0.1 mirrored the HDRI panel as a hard slab of white; spreading
               the clearcoat turns it into a gradient the eye reads as glass */
            clearcoatRoughness={0.32}
            envMapIntensity={1.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* equator band */}
      <group ref={groups.band}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.002, 0.018, 16, 128]} />
          <meshStandardMaterial color="#c7ccd6" metalness={1} roughness={0.28} />
        </mesh>
      </group>

      {/* sunken dish */}
      <group ref={groups.dish}>
        <mesh>
          <latheGeometry args={[dish, 96]} />
          <meshStandardMaterial
            color="#0c0d10"
            roughness={0.5}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* light ring — the only Bloom source */}
      <group ref={groups.ring}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.012, 12, 128]} />
          <meshStandardMaterial
            ref={ringMat}
            color="#000000"
            emissive="#7c8cff"
            emissiveIntensity={2.2}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* four beamforming mic ports */}
      <group ref={groups.micRing}>
        {MIC_ANGLES.map((a, i) => (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8]}
            rotation={[0, 0, 0]}
          >
            <cylinderGeometry args={[0.031, 0.031, 0.02, 20]} />
            <meshStandardMaterial
              color="#22242b"
              metalness={0.8}
              roughness={0.45}
            />
          </mesh>
        ))}
      </group>

      {/* logic board + neural chip */}
      <group ref={groups.board}>
        <mesh>
          <cylinderGeometry args={[0.72, 0.72, 0.085, 96]} />
          {/* was a flat grey disc: thickness + a faint clearcoat give it a
              readable top face and a lit edge (WS5-6) */}
          <meshPhysicalMaterial
            color="#1c212a"
            roughness={0.3}
            metalness={0.55}
            clearcoat={0.55}
            clearcoatRoughness={0.35}
            envMapIntensity={1.25}
          />
        </mesh>
        <mesh position={[0, 0.043, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.007, 10, 96]} />
          <meshStandardMaterial color="#8d95a3" metalness={1} roughness={0.34} />
        </mesh>
        <mesh position={[0, -0.043, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.007, 10, 96]} />
          <meshStandardMaterial color="#5f6672" metalness={1} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.058, 0]}>
          <boxGeometry args={[0.22, 0.03, 0.22]} />
          <meshStandardMaterial
            ref={chipMat}
            color="#05060a"
            emissive="#7c8cff"
            emissiveIntensity={1.4}
            roughness={0.35}
          />
        </mesh>
      </group>

      {/* battery cell + copper rim */}
      <group ref={groups.battery}>
        <mesh>
          <cylinderGeometry args={[0.66, 0.66, 0.16, 96]} />
          <meshStandardMaterial
            color="#1a1d24"
            metalness={0.7}
            roughness={0.35}
          />
        </mesh>
        {/* steel rim, not copper: the palette holds at four hues (WS5-2) */}
        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.66, 0.008, 10, 96]} />
          <meshStandardMaterial
            color="#aab1bd"
            metalness={1}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* wireless charging coil — graphite, one step darker than the rim */}
      <group ref={groups.coil}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.02, 12, 96]} />
          <meshStandardMaterial
            color="#767d8a"
            metalness={1}
            roughness={0.42}
          />
        </mesh>
      </group>

      {/* travelling emphasis halo (technology section) */}
      <mesh
        ref={halo}
        visible={false}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.7}
      >
        <torusGeometry args={[1, 0.006, 8, 128]} />
        <meshStandardMaterial
          ref={haloMat}
          color="#000000"
          emissive="#7c8cff"
          emissiveIntensity={2.5}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}
