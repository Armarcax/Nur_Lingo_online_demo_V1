"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import { useRouter } from "next/navigation";
import PomegranateSeed from "@/components/3d/PomegranateSeed";
import { ArrowLeft } from "lucide-react";

const MODULES = [
  { id: "greetings", title: "Ողջույններ", pos: [-4, 1, 0] },
  { id: "morning", title: "Առավոտյան առօրյա", pos: [4, -1, -2] },
  { id: "grammar", title: "Քերականություն", pos: [0, 3, -5] },
  { id: "questions", title: "Հարցեր", pos: [0, -3, 2] },
  { id: "prepositions", title: "Նախդիրներ", pos: [-5, -2, -4] },
  { id: "colors", title: "Գույներ", pos: [5, 2, -3] },
];

export default function GalaxyPage() {
  const router = useRouter();

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">
      {/* Կոճակ հետ գնալու համար */}
      <button 
        onClick={() => router.push("/world")} 
        className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all border border-white/20"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Վերնագիր */}
      <div className="absolute top-10 left-0 w-full text-center z-50 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
          Նռիկի Գալակտիկա
        </h1>
        <p className="text-white/60 mt-2">Ընտրիր հատիկը և սկսիր սովորել</p>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        {/* Լուսավորություն */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffaa00" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0000" />

        {/* Աստղեր */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Նռան հատիկներ (Դասեր) */}
        {MODULES.map((mod) => (
          <PomegranateSeed 
            key={mod.id}
            position={mod.pos as [number, number, number]} 
            title={mod.title} 
            onClick={() => {
              // Այստեղ կանցնենք դասին
              // router.push(`/visual-lessons?module=${mod.id}`);
              alert(`Սեղմեցիր ${mod.title} հատիկին:`);
            }} 
          />
        ))}

        {/* Կամերայի կառավարում (Պտտելու համար) */}
        <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}