import React, { useEffect, useRef } from "react";
import type { Product } from "./products";

type Props = {
  product: Product;
  size?: "hero" | "mini";
};

const ProductCard = React.forwardRef<HTMLDivElement, Props>(function ProductCard(
  { product, size = "hero" },
  ref
) {
  const localRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;

    let raf: number | null = null;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 10;
      const ry = (px - 0.5) * 12;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--tiltX", `${rx}deg`);
        el.style.setProperty("--tiltY", `${ry}deg`);
        el.style.setProperty("--glx", `${px * 100}%`);
        el.style.setProperty("--gly", `${py * 100}%`);
      });
    };

    const onLeave = () => {
      el.style.setProperty("--tiltX", `0deg`);
      el.style.setProperty("--tiltY", `0deg`);
      el.style.setProperty("--glx", `35%`);
      el.style.setProperty("--gly", `15%`);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    onLeave();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const cls = size === "hero" ? "product-card product-card--hero" : "product-card product-card--mini";

  return (
    <div
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cls}
      style={{
        // Accent gradients for the reflection + borders
        ["--accentFrom" as never]: product.accentFrom,
        ["--accentTo" as never]: product.accentTo,
      }}
    >
      <div className="product-card__chrome" aria-hidden="true" />

      <div className="product-card__inner">
        <div className="product-card__meta">
          <div className="product-card__chapter">{product.chapter}</div>
          <div className="product-card__name">{product.name}</div>
          <div className="product-card__desc">{product.description}</div>
        </div>

        <div className="product-card__imageWrap">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="product-card__image"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
