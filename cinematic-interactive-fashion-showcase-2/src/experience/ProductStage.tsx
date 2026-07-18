import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { Product } from "./products";
import ProductCard from "./ProductCard";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

type Props = {
  products: Product[];
  onProgress?: (p: number) => void;
};

type Corner = "bl" | "br" | "tl" | "tr" | "l" | "r";

function getCornerVec(c: Corner, w: number, h: number) {
  const pad = 0.62;
  const x = (c === "bl" || c === "tl" || c === "l") ? -w * pad : w * pad;
  const y = (c === "tl" || c === "tr") ? -h * pad : h * pad;
  if (c === "l") return { x: -w * pad, y: 0 };
  if (c === "r") return { x: w * pad, y: 0 };
  return { x, y };
}

export default function ProductStage({ products, onProgress }: Props) {
  const scrollUnits = products.length * 1.25 + 2;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);

  const cardRefs = useRef<HTMLDivElement[]>([]);
  cardRefs.current = [];

  const miniRefs = useRef<HTMLDivElement[]>([]);
  miniRefs.current = [];

  const corners = useMemo(
    () => ["bl", "br", "l", "tl", "br", "bl"] as Corner[],
    []
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const spacer = spacerRef.current;
    if (!root || !stage || !spacer) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const setStageRX = gsap.quickSetter(stage, "rotateX", "deg");
    const setStageRY = gsap.quickSetter(stage, "rotateY", "deg");
    const setStageRZ = gsap.quickSetter(stage, "rotateZ", "deg");
    const setStageX = gsap.quickSetter(stage, "x", "px");
    const setStageY = gsap.quickSetter(stage, "y", "px");

    const onPointerMove = (e: PointerEvent) => {
      const mx = (e.clientX / window.innerWidth) * 2 - 1;
      const my = (e.clientY / window.innerHeight) * 2 - 1;
      root.style.setProperty("--parX", `${mx * 10}px`);
      root.style.setProperty("--parY", `${-my * 10}px`);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Baseline vars
    root.style.setProperty("--bgFrom", products[0]?.bgFrom ?? "#05060A");
    root.style.setProperty("--bgTo", products[0]?.bgTo ?? "#0A1020");
    root.style.setProperty("--accentFrom", products[0]?.accentFrom ?? "#9AE6FF");
    root.style.setProperty("--accentTo", products[0]?.accentTo ?? "#A78BFA");

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    // Prep
    cardRefs.current.forEach((el, i) => {
      gsap.set(el, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 0.95,
        autoAlpha: i === 0 ? 1 : 0,
        transformPerspective: 1200,
        transformOrigin: "50% 50%",
      });
    });

    if (headlineRef.current) {
      gsap.set(headlineRef.current, { autoAlpha: 0, scale: 0.96, filter: "blur(10px)" });
    }

    miniRefs.current.forEach((el) => {
      gsap.set(el, { autoAlpha: 0, scale: 0.92, rotateZ: gsap.utils.random(-8, 8) });
    });

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    const seg = prefersReduced ? 0.8 : 1.05;
    const overlap = prefersReduced ? 0.12 : 0.34;

    products.forEach((p, i) => {
      const card = cardRefs.current[i];
      if (!card) return;

      const entryCorner = corners[i % corners.length];
      const exitCorner = "tr";

      const entry = () => getCornerVec(entryCorner, w(), h());
      const exit = () => getCornerVec(exitCorner, w(), h());

      const t0 = i * (seg - overlap);
      const tEnter = t0;
      const tCenter = t0 + seg * 0.42;
      const tExit = t0 + seg;

      tl.addLabel(`p${i}`, t0);

      // Theme shift
      tl.to(
        root,
        {
          duration: seg * 0.7,
          css: {
            "--bgFrom": p.bgFrom,
            "--bgTo": p.bgTo,
            "--accentFrom": p.accentFrom,
            "--accentTo": p.accentTo,
          },
        },
        tEnter
      );

      // Blur punch when a product is "active"
      tl.to(
        root,
        {
          duration: seg * 0.35,
          css: { "--bgBlur": prefersReduced ? "6px" : "16px" },
        },
        tCenter - seg * 0.18
      );
      tl.to(
        root,
        {
          duration: seg * 0.35,
          css: { "--bgBlur": prefersReduced ? "4px" : "10px" },
        },
        tCenter + seg * 0.1
      );

      // Product motion path: enter → center → exit
      tl.set(card, { autoAlpha: 1 }, tEnter);

      if (!prefersReduced) {
        tl.fromTo(
          card,
          {
            x: entry().x,
            y: entry().y,
            scale: 0.86,
            rotateX: 10,
            rotateY: -8,
            rotateZ: -9,
            autoAlpha: 0,
          },
          {
            duration: seg * 0.55,
            autoAlpha: 1,
            motionPath: {
              path: [
                { x: entry().x, y: entry().y },
                { x: entry().x * 0.25, y: entry().y * 0.18 },
                { x: 0, y: 0 },
              ],
              curviness: 1.25,
            },
            scale: 1.04,
            rotateX: 2,
            rotateY: 2,
            rotateZ: 0,
            ease: "expo.out",
          },
          tEnter
        );
      } else {
        tl.fromTo(
          card,
          { x: entry().x, y: entry().y, scale: 0.92, autoAlpha: 0 },
          { duration: seg * 0.5, x: 0, y: 0, scale: 1.0, autoAlpha: 1, ease: "power3.out" },
          tEnter
        );
      }

      // Subtle 3D settle
      tl.to(
        card,
        {
          duration: seg * 0.38,
          rotateX: prefersReduced ? 0 : -3,
          rotateY: prefersReduced ? 0 : 4,
          scale: 1.02,
          ease: "sine.inOut",
        },
        tCenter
      );

      // Exit
      tl.to(
        card,
        {
          duration: seg * 0.55,
          motionPath: !prefersReduced
            ? {
                path: [
                  { x: 0, y: 0 },
                  { x: exit().x * 0.35, y: exit().y * 0.25 },
                  { x: exit().x, y: exit().y },
                ],
                curviness: 1.2,
              }
            : undefined,
          x: prefersReduced ? exit().x : undefined,
          y: prefersReduced ? exit().y : undefined,
          scale: 0.9,
          rotateX: prefersReduced ? 0 : -8,
          rotateY: prefersReduced ? 0 : 10,
          rotateZ: prefersReduced ? 0 : 7,
          autoAlpha: 0,
          ease: "expo.in",
        },
        tExit - seg * 0.45
      );

      // Keep always-moving: micro drift on Z for depth (doesn't conflict with x/y timeline)
      tl.to(
        card,
        {
          duration: seg,
          z: gsap.utils.random(-60, 80),
          ease: "sine.inOut",
        },
        tEnter
      );

      // Headline chapter beat (between product 1 and 2)
      if (i === 1 && headlineRef.current) {
        tl.to(
          headlineRef.current,
          {
            duration: 0.55,
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            rotateZ: -0.6,
            ease: "expo.out",
          },
          tExit - seg * 0.25
        );
        tl.to(
          headlineRef.current,
          {
            duration: 0.6,
            autoAlpha: 0,
            scale: 1.04,
            filter: "blur(12px)",
            rotateZ: 0.8,
            ease: "expo.in",
          },
          tExit + 0.25
        );
      }

      // Orbit gallery beat (around product 3)
      if (i === 3 && miniRefs.current.length >= 4) {
        const minis = miniRefs.current;
        tl.to(minis, { autoAlpha: 1, duration: 0.35, stagger: 0.04 }, tEnter - 0.2);

        minis.forEach((m, idx) => {
          const base = idx / minis.length;
          const radius = 240 + idx * 18;
          tl.to(
            m,
            {
              duration: 0.9,
              motionPath: {
                path: [
                  { x: Math.cos(base * Math.PI * 2) * radius, y: Math.sin(base * Math.PI * 2) * radius },
                  {
                    x: Math.cos((base + 0.33) * Math.PI * 2) * radius,
                    y: Math.sin((base + 0.33) * Math.PI * 2) * radius,
                  },
                  {
                    x: Math.cos((base + 0.66) * Math.PI * 2) * radius,
                    y: Math.sin((base + 0.66) * Math.PI * 2) * radius,
                  },
                ],
                curviness: 1,
              },
              rotateZ: "+=50",
              z: -140 + idx * 70,
              ease: "sine.inOut",
            },
            tEnter
          );

          // settle into an asymmetrical overlapping layout
          tl.to(
            m,
            {
              duration: 0.65,
              x: (-280 + idx * 190) * (idx % 2 ? 1 : 0.9),
              y: -40 + (idx % 2 ? 120 : -120),
              rotateZ: gsap.utils.random(-10, 10),
              scale: 0.98,
              z: -80 + idx * 40,
              ease: "expo.out",
            },
            tEnter + 0.65
          );
        });

        tl.to(minis, { autoAlpha: 0, duration: 0.4, stagger: 0.03 }, tExit - 0.2);
      }
    });

    // Camera / stage orbit: driven by ScrollTrigger progress for circular depth
    const st = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: () => `+=${window.innerHeight * scrollUnits}`,
      scrub: prefersReduced ? 0.7 : 1.05,
      animation: tl,
      onUpdate: (self) => {
        const p = self.progress;
        onProgress?.(p);

        if (prefersReduced) {
          setStageRX(0);
          setStageRY(0);
          setStageRZ(0);
          setStageX(0);
          setStageY(0);
          return;
        }

        const orbit = p * Math.PI * 2;
        const rx = Math.sin(orbit) * 3.2;
        const ry = Math.cos(orbit) * 4.4;
        const rz = Math.sin(orbit * 0.5) * 1.2;

        setStageRX(rx);
        setStageRY(ry);
        setStageRZ(rz);
        setStageX(Math.cos(orbit) * 12);
        setStageY(Math.sin(orbit * 0.8) * 10);
      },
    });

    const refresh = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      window.removeEventListener("pointermove", onPointerMove);
      st.kill();
      tl.kill();
    };
  }, [corners, onProgress, products]);

  return (
    <div ref={rootRef} className="experience">
      <div className="experience__bg" aria-hidden="true" />

      <div className="experience__stageWrap">
        <div ref={stageRef} className="experience__stage">
          <div className="experience__parallax">
            <div ref={headlineRef} className="headline glass-panel">
              <div className="headline__kicker">Atelier 01</div>
              <div className="headline__title">A CINEMATIC COLLECTION</div>
              <div className="headline__sub">Scroll like you’re directing the camera.</div>
            </div>

            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                ref={(el) => {
                  if (el) cardRefs.current.push(el);
                }}
              />
            ))}

            <div className="galleryCluster" aria-hidden="true">
              {products.slice(0, 4).map((p) => (
                <div
                  key={`mini-${p.id}`}
                  ref={(el) => {
                    if (el) miniRefs.current.push(el);
                  }}
                  className="galleryCluster__mini"
                >
                  <ProductCard product={p} size="mini" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer only: stage is fixed, scroll just scrubs the timeline */}
      <div
        ref={spacerRef}
        className="experience__spacer"
        style={{ height: `${scrollUnits * 100}vh` }}
      />
    </div>
  );
}
