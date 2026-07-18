import { useEffect, useMemo } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll(enabled = true) {
  const lenis = useMemo(() => {
    if (!enabled) return null;

    return new Lenis({
      duration: 1.05,
      lerp: 0.085,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.12,
      infinite: false,
    });
  }, [enabled]);

  useEffect(() => {
    if (!lenis) return;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    gsap.ticker.lagSmoothing(0);
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, [lenis]);

  return lenis;
}
