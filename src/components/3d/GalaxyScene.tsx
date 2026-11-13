// src/components/3d/GalaxyScene.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import PomegranateSeed from "./PomegranateSeed";

// Փոխանցում ենք մոդուլները և սեղմելու ֆունկցիան որպես prop
export default function GalaxyScene({ 
  modules, 
  onSelect 
}: { 
  modules: any[]; 
  onSelect: (id: string, title: string) => void;
}) {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
      {/* Լուսավորություն */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffaa00" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0000" />

      {/* Աստղեր */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Նռան հատիկներ */}
      {modules.map((mod) => (
        <PomegranateSeed 
          key={mod.id}
          position={mod.pos as [number, number, number]} 
          title={mod.title} 
          onClick={() => onSelect(mod.id, mod.title)} 
        />
      ))}

      {/* Կամերայի կառավարում */}
      <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}