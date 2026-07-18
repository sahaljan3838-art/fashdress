import { useEffect, useMemo, useState } from "react";
import MagneticButton from "./components/MagneticButton";
import { products } from "./experience/products";
import ProductStage from "./experience/ProductStage";
import ThreeBackground from "./experience/ThreeBackground";
import { usePrefersReducedMotion } from "./experience/usePrefersReducedMotion";
import { useSmoothScroll } from "./experience/useSmoothScroll";

export default function App() {
  const reduced = usePrefersReducedMotion();
  useSmoothScroll(!reduced);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 700);
    return () => window.clearTimeout(t);
  }, []);

  const activeIndex = useMemo(() => {
    const raw = Math.floor(progress * products.length);
    return Math.max(0, Math.min(products.length - 1, raw));
  }, [progress]);

  const active = products[activeIndex];

  return (
    <div className="appRoot">
      <ThreeBackground progress={progress} />

      <header className="topbar">
        <div className="topbar__left">
          <div className="logo">
            <div className="logo__dot" aria-hidden="true" />
            <div className="logo__text">
              <div className="logo__name">ATELIER</div>
              <div className="logo__tag">DIGITAL STUDIO</div>
            </div>
          </div>
        </div>

        <nav className="topbar__right" aria-label="Primary">
          <a className="navlink" href="#" onClick={(e) => e.preventDefault()}>
            Work
          </a>
          <a className="navlink" href="#" onClick={(e) => e.preventDefault()}>
            Studio
          </a>
          <a className="navlink" href="#" onClick={(e) => e.preventDefault()}>
            Labs
          </a>
          <MagneticButton
            className="navbtn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Rewind
          </MagneticButton>
        </nav>
      </header>

      <aside className="indexRail" aria-label="Index">
        <div className="indexRail__label">Index</div>
        <div className="indexRail__list">
          {products.map((p, i) => (
            <div key={p.id} className={`indexItem ${i === activeIndex ? "indexItem--active" : ""}`}>
              <div className="indexItem__num">{String(i + 1).padStart(2, "0")}</div>
              <div className="indexItem__name">{p.name}</div>
            </div>
          ))}
        </div>
      </aside>

      <div className="chapterHUD" aria-live="polite">
        <div className="chapterHUD__chapter">{active?.chapter}</div>
        <div className="chapterHUD__title">{active?.name}</div>
      </div>

      <ProductStage products={products} onProgress={setProgress} />

      <footer className="scrollHint glass-panel">
        <div className="scrollHint__label">Scroll</div>
        <div className="scrollHint__bar" aria-hidden="true">
          <div className="scrollHint__dot" />
        </div>
        <div className="scrollHint__value">{Math.round(progress * 100)}%</div>
      </footer>

      <div className="preloader" data-ready={ready ? "true" : "false"}>
        <div className="preloader__inner">
          <div className="preloader__title">ATELIER</div>
          <div className="preloader__sub">Immersive WebGL / Motion System</div>
          <div className="preloader__bar" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>

      <div className="noise" aria-hidden="true" />
    </div>
  );
}

