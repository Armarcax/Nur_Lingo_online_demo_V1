// src/app/drive-test/[testNum]/page.tsx
// ⚠️ Server Component — առանց "use client"
import { Suspense } from "react";
import DriveTestRunner from "./DriveTestRunner";
import LoadingFallback from "./LoadingFallback";

// ✅ Next.js-ը նախապես կկառուցի 10 թեստերի էջերը
export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({
    testNum: String(i + 1),
  }));
}

// ✅ Թույլ տանք dynamic params նույնպես (օր.՝ /drive-test/11)
export const dynamicParams = true;

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DriveTestRunner />
    </Suspense>
  );
}