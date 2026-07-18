import { ButtonHTMLAttributes, useEffect, useRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  strength?: number;
};

export default function MagneticButton({ strength = 18, className = "", ...props }: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number | null = null;

    const reset = () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);

      const dx = Math.max(-strength, Math.min(strength, x * 0.22));
      const dy = Math.max(-strength, Math.min(strength, y * 0.22));

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${dx}px`);
        el.style.setProperty("--my", `${dy}px`);
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      reset();
    };

    const onDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--rx", `${x}px`);
      el.style.setProperty("--ry", `${y}px`);
      el.classList.remove("ripple");
      // force reflow
      void el.offsetWidth;
      el.classList.add("ripple");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);

    reset();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
    };
  }, [strength]);

  return (
    <button ref={ref} className={`magnetic-btn ${className}`} {...props} />
  );
}
