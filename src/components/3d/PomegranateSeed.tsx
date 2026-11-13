"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Html } from "@react-three/drei";
import * as THREE from "three";

export default function PomegranateSeed({ position, title, onClick }: { position: [number, number, number], title: string, onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Անիմացիա՝ հատիկը դանդաղ պտտվում է և լողում
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[1, 32, 32]} // Չափը
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.3 : 1} // Մեծանում է մկնիկը վրան դնելիս
      >
        <meshStandardMaterial 
          color="#ff0033" 
          emissive="#ff0033" 
          emissiveIntensity={hovered ? 2 : 0.5} 
          roughness={0.2} 
          metalness={0.8} 
        />
      </Sphere>

      {/* Երբ մկնիկը վրան է, ցույց ենք տալիս դասի անվանումը */}
      {hovered && (
        <Html center distanceFactor={10}>
          <div className="bg-black/80 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border border-red-500/50 shadow-lg shadow-red-500/20">
            {title}
          </div>
        </Html>
      )}
    </group>
  );
}