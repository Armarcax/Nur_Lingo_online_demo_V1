// src/components/3d/GalaxyScene.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles } from "@react-three/drei";
import PomegranateSeed from "./PomegranateSeed";

interface ModuleData {
  id: string;
  title: string;
  pos: [number, number, number];
}

interface Props {
  modules: ModuleData[];
  onSelect: (id: string, title: string) => void;
}

export default function GalaxyScene({ modules, onSelect }: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 18], fov: 60 }}>
      {/* 🌟 Լուսավորություն */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#ffaa00" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0000" />
      
      {/* 🌌 Տիեզերական միջավայր */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* ✨ Փայլեր տարածության մեջ (Drei-ի հատուկ էֆեկտ) */}
      <Sparkles count={200} scale={20} size={2} speed={0.4} color="#ffcc00" />

      {/* 🔴 Նռան հատիկներ (Մոդուլներ) */}
      {modules.map((mod) => (
        <PomegranateSeed 
          key={mod.id}
          position={mod.pos} 
          title={mod.title} 
          onClick={() => onSelect(mod.id, mod.title)} 
        />
      ))}

      {/* 🎮 Կամերայի կառավարում (Պտտել, մոտեցնել) */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.8}
        minDistance={5}
        maxDistance={30}
      />
    </Canvas>
  );
}