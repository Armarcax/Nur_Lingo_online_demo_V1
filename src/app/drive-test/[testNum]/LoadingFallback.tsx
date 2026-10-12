// src/app/drive-test/[testNum]/LoadingFallback.tsx
import { Loader2 } from "lucide-react";

export default function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
      <Loader2 size={32} className="animate-spin text-red-500 mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  );
}