// src/components/3d/GalaxyScene.tsx
"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles, Line, Sphere } from "@react-three/drei";
import * as THREE from "three"; // ✅ ԱՎԵԼԱՑՐԻՆՔ ԱՅՍ ՏՈՂԸ
import Planet from "./Planet";

interface PlanetData {
  id: string;
  title: string;
  pos: [number, number, number];
  textureUrl: string;
  size: number;
  hasRing?: boolean;
  color?: string;
  orbitRadius: number;
}

interface Props {
  modules: PlanetData[];
  onSelect: (id: string, title: string) => void;
}

export default function GalaxyScene({ modules, onSelect }: Props) {
  return (
    <Canvas camera={{ position: [0, 10, 25], fov: 60 }}>
      {/* 🌟 Լուսավորություն */}
      <ambientLight intensity={0.1} />
      {/* Կենտրոնական աստղի լույսը */}
      <pointLight position={[0, 0, 0]} intensity={3} color="#ffcc00" distance={100} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0022ff" />

      {/* 🌌 Տիեզերական միջավայր */}
      <Stars radius={150} depth={50} count={8000} factor={5} saturation={0} fade speed={0.5} />
      <Sparkles count={300} scale={40} size={2} speed={0.2} color="#ffcc00" opacity={0.5} />

      {/* ☀️ Կենտրոնական Արևը (Nurik's Core) */}
      <group>
        <Sphere args={[3, 64, 64]}>
          <meshBasicMaterial color="#ffaa00" />
        </Sphere>
        <Sphere args={[3.2, 64, 64]}>
          <meshBasicMaterial color="#ff4400" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </Sphere>
      </group>

      <Suspense fallback={null}>
        {/* 🪐 Մոլորակներ և ուղեծրեր */}
        {modules.map((planet) => (
          <group key={planet.id}>
            {/* Ուղեծրի գիծը */}
            <Line
              points={Array.from({ length: 64 }).map((_, i) => {
                const angle = (i / 64) * Math.PI * 2;
                return [Math.cos(angle) * planet.orbitRadius, 0, Math.sin(angle) * planet.orbitRadius];
              })}
              color="#ffffff"
              lineWidth={1}
              transparent
              opacity={0.15}
            />
            
            {/* Մոլորակը */}
            <Planet
              position={planet.pos}
              title={planet.title}
              textureUrl={planet.textureUrl}
              size={planet.size}
              hasRing={planet.hasRing}
              color={planet.color}
              onClick={() => onSelect(planet.id, planet.title)}
            />
          </group>
        ))}
      </Suspense>

      {/* 🎮 Կամերայի կառավարում */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.3}
        minDistance={10}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2} // Թույլ չենք տալիս նայել ներքևից
      />
    </Canvas>
  );
}