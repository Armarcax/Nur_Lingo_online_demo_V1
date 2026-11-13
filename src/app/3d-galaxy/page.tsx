// src/app/3d-galaxy/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

// ✅ Անջատում ենք SSR-ը (Server-Side Rendering)
const GalaxyScene = dynamic(() => import("@/components/3d/GalaxyScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black">
      <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
      <p className="text-white/60">Բեռնվում է Գալակտիկան...</p>
    </div>
  ),
});

const MODULES = [
  { id: "greetings", title: "Ողջույններ", pos: [-5, 2, 0] as [number, number, number] },
  { id: "morning", title: "Առավոտյան առօրյա", pos: [5, -1, -2] as [number, number, number] },
  { id: "grammar", title: "Քերականություն", pos: [0, 4, -6] as [number, number, number] },
  { id: "questions", title: "Հարցեր", pos: [0, -4, 2] as [number, number, number] },
  { id: "prepositions", title: "Նախդիրներ", pos: [-6, -3, -4] as [number, number, number] },
  { id: "colors", title: "Գույներ", pos: [6, 3, -4] as [number, number, number] },
];

export default function GalaxyPage() {
  const router = useRouter();

  const handleSelect = (id: string, title: string) => {
    // Անցում ենք համապատասխան դասին (օրինակ՝ /visual-lessons)
    router.push(`/visual-lessons?module=${id}`);
  };

  return (
    <div className="w-screen h-screen bg-[#050505] relative overflow-hidden">
      {/* Հետ գնալու կոճակ */}
      <button 
        onClick={() => router.push("/world")} 
        className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all border border-white/20"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Վերնագիր */}
      <div className="absolute top-10 left-0 w-full text-center z-50 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.6)]">
          Նռիկի Գալակտիկա
        </h1>
        <p className="text-white/60 mt-2 font-medium">Պտտիր տիեզերքը և ընտրիր հատիկը</p>
      </div>

      {/* 3D Տեսարանը */}
      <GalaxyScene modules={MODULES} onSelect={handleSelect} />
    </div>
  );
}