// src/components/3d/Planet.tsx
"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Html, Ring } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  title: string;
  size: number;
  hasRing?: boolean;
  color?: string;
  onClick: () => void;
}

export default function Planet({ position, title, size, hasRing, color = "#ffffff", onClick }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005; // Դանդաղ պտտում
    }
    if (groupRef.current) {
      // Լողացող էֆեկտ
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Մոլորակի հիմնական գունդը */}
      <Sphere
        ref={meshRef}
        args={[size, 64, 64]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial 
          color={color} 
          roughness={0.4} 
          metalness={0.6} 
          emissive={hovered ? color : "#000000"} 
          emissiveIntensity={hovered ? 0.8 : 0}
        />
      </Sphere>

      {/* Մթնոլորտի փայլ */}
      <Sphere args={[size * 1.05, 64, 64]}>
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.3 : 0.1} 
          blending={THREE.AdditiveBlending} 
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Օղակներ (Եթե կան) */}
      {hasRing && (
        <Ring args={[size * 1.5, size * 2.2, 64]} rotation={[Math.PI / 2 - 0.2, 0, 0]}>
          <meshStandardMaterial 
            color="#d4af37" 
            side={THREE.DoubleSide} 
            transparent 
            opacity={0.7} 
            roughness={0.4} 
          />
        </Ring>
      )}

      {/* Անվանումը մկնիկը վրան դնելիս */}
      {hovered && (
        <Html center distanceFactor={15} zIndexRange={[100, 0]}>
          <div className="bg-black/90 text-white px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)] pointer-events-none select-none backdrop-blur-md">
            {title}
          </div>
        </Html>
      )}
    </group>
  );
}