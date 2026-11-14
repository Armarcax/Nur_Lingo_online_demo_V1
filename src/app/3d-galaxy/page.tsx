// src/app/3d-galaxy/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

const GalaxyScene = dynamic(() => import("@/components/3d/GalaxyScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
      <p className="text-white/60 font-medium">Բեռնվում է Արեգակնային համակարգը...</p>
    </div>
  ),
});

// ✅ Մոլորակների կոնֆիգուրացիա (Տեքստուրաները Three.js-ի օրինակներից են)
const PLANETS = [
  { 
    id: "greetings", 
    title: "Ողջույններ", 
    pos: [-8, 0, 0] as [number, number, number], 
    orbitRadius: 8,
    textureUrl: "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg", 
    size: 1.5, 
    color: "#4facfe" 
  },
  { 
    id: "morning", 
    title: "Առավոտյան առօրյա", 
    pos: [12, 0, 0] as [number, number, number], 
    orbitRadius: 12,
    textureUrl: "https://threejs.org/examples/textures/planets/mars_1k_color.jpg", 
    size: 1.2, 
    color: "#ff9a9e" 
  },
  { 
    id: "grammar", 
    title: "Քերականություն", 
    pos: [0, 0, -16] as [number, number, number], 
    orbitRadius: 16,
    textureUrl: "https://threejs.org/examples/textures/planets/moon_1024.jpg", 
    size: 2.0, 
    color: "#cfd9df" 
  },
  { 
    id: "questions", 
    title: "Հարցեր", 
    pos: [20, 0, 0] as [number, number, number], 
    orbitRadius: 20,
    textureUrl: "https://threejs.org/examples/textures/planets/earth_lights_2048.png", // Երկրի գիշերային լույսերը
    size: 1.8, 
    color: "#f6d365" 
  },
  { 
    id: "prepositions", 
    title: "Նախդիրներ", 
    pos: [-24, 0, 0] as [number, number, number], 
    orbitRadius: 24,
    textureUrl: "https://threejs.org/examples/textures/planets/moon_1024.jpg", 
    size: 0.9, 
    color: "#a1c4fd" 
  },
  { 
    id: "colors", 
    title: "Գույներ", 
    pos: [28, 0, 0] as [number, number, number], 
    orbitRadius: 28,
    textureUrl: "https://threejs.org/examples/textures/planets/mars_1k_color.jpg", 
    size: 2.5, 
    hasRing: true, 
    color: "#ffecd2" 
  },
];

export default function GalaxyPage() {
  const router = useRouter();

  const handleSelect = (id: string, title: string) => {
    // Անցում ենք համապատասխան դասին
    router.push(`/visual-lessons?module=${id}`);
  };

  return (
    <div className="w-screen h-screen bg-[#020202] relative overflow-hidden font-sans">
      {/* Հետ գնալու կոճակ */}
      <button 
        onClick={() => router.push("/world")} 
        className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all border border-white/20 shadow-lg"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Վերնագիր */}
      <div className="absolute top-10 left-0 w-full text-center z-50 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-500 to-purple-600 drop-shadow-[0_0_30px_rgba(255,100,0,0.8)] tracking-wider">
          Նռիկի Տիեզերքը
        </h1>
        <p className="text-white/50 mt-3 font-medium tracking-widest uppercase text-sm">
          Պտտիր մոլորակները և ընտրիր դասը
        </p>
      </div>

      {/* 3D Արեգակնային համակարգ */}
      <GalaxyScene modules={PLANETS} onSelect={handleSelect} />
    </div>
  );
}