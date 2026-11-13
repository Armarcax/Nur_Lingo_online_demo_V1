// src/components/3d/PomegranateSeed.tsx
"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Html } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  title: string;
  onClick: () => void;
}

export default function PomegranateSeed({ position, title, onClick }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Անիմացիա. Հատիկը դանդաղ պտտվում է և լողում վեր-վար
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.4;
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[1, 32, 32]} // Շառավիղը և հատվածների քանակը
        onClick={(e) => {
          e.stopPropagation(); // Կանխում ենք այլ օբյեկտների սեղմումը
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer"; // Մկնիկը դառնում է ձեռք
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        scale={hovered ? 1.3 : 1} // Մեծանում է մկնիկը վրան դնելիս
      >
        <meshPhysicalMaterial 
          color="#ff0033" 
          emissive="#ff0033" 
          emissiveIntensity={hovered ? 1.5 : 0.4} 
          roughness={0.1} 
          metalness={0.8}
          clearcoat={1} // Ավելացնում է փայլ
        />
      </Sphere>

      {/* Երբ մկնիկը վրան է, ցույց ենք տալիս դասի անվանումը HTML-ով */}
      {hovered && (
        <Html center distanceFactor={15} zIndexRange={[100, 0]}>
          <div className="bg-black/80 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border border-red-500/50 shadow-lg shadow-red-500/20 pointer-events-none select-none">
            {title}
          </div>
        </Html>
      )}
    </group>
  );
}