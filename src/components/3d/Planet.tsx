// src/components/3d/Planet.tsx
"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Html, Ring, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  title: string;
  textureUrl: string;
  size: number;
  hasRing?: boolean;
  color?: string;
  onClick: () => void;
}

export default function Planet({ position, title, textureUrl, size, hasRing, color = "#ffffff", onClick }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Բեռնում ենք մոլորակի տեքստուրան (նկարը)
  const texture = useTexture(textureUrl);

  useFrame((state) => {
    if (meshRef.current) {
      // Մոլորակը պտտվում է իր առանցքի շուրջ
      meshRef.current.rotation.y += 0.005;
    }
    if (groupRef.current) {
      // Մոլորակը դանդաղ լողում է տարածության մեջ
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
          map={texture} 
          roughness={0.8} 
          metalness={0.2} 
          emissive={hovered ? color : "#000000"} // Մկնիկը վրան դնելիս լուսավորվում է
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </Sphere>

      {/* Մթնոլորտի փայլ (Atmosphere Glow) */}
      <Sphere args={[size * 1.05, 64, 64]}>
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.3 : 0.1} 
          blending={THREE.AdditiveBlending} 
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Մոլորակի օղակները (Եթե կան) */}
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

      {/* Երբ մկնիկը վրան է, ցույց ենք տալիս անվանումը */}
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