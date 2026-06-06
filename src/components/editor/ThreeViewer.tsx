import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ThreeViewerClient = lazy(() =>
  import("./ThreeViewer.client").then((module) => ({ default: module.ThreeViewer })),
);

export function ThreeViewer({ glbUrl }: { glbUrl?: string }) {
  return (
    <ClientOnly fallback={<div className="h-full w-full" />}>
      <Suspense fallback={<div className="h-full w-full" />}>
        <ThreeViewerClient glbUrl={glbUrl} />
      </Suspense>
    </ClientOnly>
  );
}