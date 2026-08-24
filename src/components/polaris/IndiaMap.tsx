import { Suspense, lazy, useEffect, useState } from "react";
import type { IndiaMapClientProps } from "./IndiaMapClient";
import { LoadingBlock } from "./primitives";

const IndiaMapClient = lazy(() => import("./IndiaMapClient"));

/**
 * SSR-safe wrapper: Leaflet touches `window` at import time, so the client
 * module is only imported after hydration.
 */
export function IndiaMap(props: IndiaMapClientProps) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return <LoadingBlock label="Preparing India state map" rows={4} />;
  }

  return (
    <Suspense fallback={<LoadingBlock label="Preparing India state map" rows={4} />}>
      <IndiaMapClient {...props} />
    </Suspense>
  );
}
