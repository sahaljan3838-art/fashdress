import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  progress: number;
};

export default function ThreeBackground({ progress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 7.4);

    const particlesGeo = new THREE.BufferGeometry();
    const count = 1400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Minimal monochrome palette (ActiveTheory-inspired)
    const c1 = new THREE.Color("#EAF0FF");
    const c2 = new THREE.Color("#9FB2FF");

    for (let i = 0; i < count; i++) {
      const r = 2.8 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const t = Math.random();
      const col = c1.clone().lerp(c2, t);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(
      particlesGeo,
      new THREE.PointsMaterial({
        size: 0.022,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(points);

    const beamGeo = new THREE.PlaneGeometry(6.5, 1.3, 1, 1);
    const makeBeam = (hex: string, opacity: number) =>
      new THREE.Mesh(
        beamGeo,
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(hex),
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );

    const beam1 = makeBeam("#A78BFA", 0.05);
    beam1.position.set(-1.2, 1.1, -1.8);
    beam1.rotation.z = 0.4;

    const beam2 = makeBeam("#93C5FD", 0.04);
    beam2.position.set(1.2, -0.9, -2.2);
    beam2.rotation.z = -0.35;

    const beam3 = makeBeam("#FFFFFF", 0.025);
    beam3.position.set(0.4, 0.2, -2.6);
    beam3.rotation.z = 0.15;

    scene.add(beam1, beam2, beam3);

    // Subtle fashion silhouette
    const texLoader = new THREE.TextureLoader();
    const silhouetteTex = texLoader.load(
      "/images/silhouette.png",
      () => {
        silhouetteTex.wrapS = THREE.ClampToEdgeWrapping;
        silhouetteTex.wrapT = THREE.ClampToEdgeWrapping;
      }
    );

    const silhouette = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      new THREE.MeshBasicMaterial({
        map: silhouetteTex,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      })
    );
    silhouette.position.set(1.7, -0.2, -3.1);
    scene.add(silhouette);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    let raf = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      points.rotation.y = t * 0.06 + progress * 0.35;
      points.rotation.x = t * 0.035;

      beam1.position.y = 1.1 + Math.sin(t * 0.6) * 0.12;
      beam2.position.y = -0.9 + Math.cos(t * 0.5) * 0.14;
      beam3.position.x = 0.4 + Math.sin(t * 0.4) * 0.18;

      silhouette.position.x = 1.7 + Math.sin(t * 0.25) * 0.18;
      silhouette.rotation.z = 0.05 + Math.sin(t * 0.2) * 0.08;

      const orbit = progress * Math.PI * 2;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      camera.position.x = Math.cos(orbit) * 0.25 + mx * 0.25;
      camera.position.y = Math.sin(orbit) * 0.18 + -my * 0.18;
      camera.position.z = 7.4 + Math.sin(orbit) * 0.06;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);

      particlesGeo.dispose();
      (points.material as THREE.Material).dispose();
      beamGeo.dispose();
      (beam1.material as THREE.Material).dispose();
      (beam2.material as THREE.Material).dispose();
      (beam3.material as THREE.Material).dispose();
      silhouette.geometry.dispose();
      (silhouette.material as THREE.Material).dispose();
      silhouetteTex.dispose();
      renderer.dispose();
    };
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
