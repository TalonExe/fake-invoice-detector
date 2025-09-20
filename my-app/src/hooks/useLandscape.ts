import { useEffect, useState } from "react";

export function useLandscape() {
  const [landscape, setLandscape] = useState(
    typeof window !== "undefined" ? window.matchMedia("(orientation: landscape)").matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const h = (e: MediaQueryListEvent) => setLandscape(e.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  return landscape;
}
