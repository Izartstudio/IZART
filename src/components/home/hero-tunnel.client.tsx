"use client";

import { useEffect, useRef } from "react";
import type { Group, Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from "three";

import { heroLeftImages, heroRightImages } from "@/content/hero-images";
import { getImageProps } from "next/image";

const TUNNEL_WIDTH = 2.72;
const TUNNEL_HEIGHT = 2.1;
const ROWS = 3;
const SEGMENT_DEPTH = 0.72;
const NUM_SEGMENTS = 18;
const CAMERA_FOV = 42;
const CAMERA_CHASE = 0.085;
const SCROLL_TO_Z = 0.05;
const IMAGE_FADE_DURATION = 0.7;

function loadCardMark() {
  const mark = new Image();
  mark.src = "/assets/home/services/card-mark.svg";
  return mark.decode().then(() => mark, () => null);
}

function frameArtwork(image: HTMLImageElement, mark: HTMLImageElement | null, aspect: number) {
  const card = document.createElement("canvas");
  const width = card.width = 512;
  const height = card.height = Math.round(width / aspect);
  const ctx = card.getContext("2d");
  if (!ctx) return null;

  const header = Math.round(height * 0.1);
  const footer = Math.round(height * 0.05);
  const artworkHeight = height - header - footer;
  const scale = Math.max(width / image.width, artworkHeight / image.height);
  const cropWidth = width / scale;
  const cropHeight = artworkHeight / scale;

  ctx.fillStyle = "#0b0a08";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, (image.width - cropWidth) / 2, (image.height - cropHeight) / 2,
    cropWidth, cropHeight, 0, header, width, artworkHeight);

  ctx.fillStyle = "#35de12";
  ctx.textBaseline = "middle";
  ctx.font = "13px Arial, sans-serif";
  const center = header / 2;
  if (mark) {
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 3;
    ctx.drawImage(mark, 19, center - 6, 60, 12);
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = "right";
  ctx.fillText("2026", width - 17, center);
  const yearStart = width - 17 - ctx.measureText("2026").width;
  ctx.beginPath();
  ctx.moveTo(yearStart - 23, center - 5);
  ctx.lineTo(yearStart - 9, center);
  ctx.lineTo(yearStart - 23, center + 5);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = "left";
  for (const [index, letter] of ["I", "Z", "R"].entries()) {
    ctx.fillText(letter, 10 + index * 61, height - footer / 2);
  }
  return card;
}

export function HeroTunnel({ leftImages, rightImages }: { leftImages?: string[]; rightImages?: string[] }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let disposed = false;
    let cleanup = () => { disposed = true; };

    void Promise.all([import("three"), loadCardMark()]).then(([THREE, mark]) => {
      if (disposed) return;

      const scene = new THREE.Scene();
      const background = new THREE.Color("#000000");
      scene.background = background;
      scene.fog = new THREE.Fog(background, SEGMENT_DEPTH * 3.8, SEGMENT_DEPTH * 7.2);

      const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 1000);
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.className = "home-hero__canvas";
      frame.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
      const loader = new THREE.TextureLoader();
      const rowHeight = TUNNEL_HEIGHT / ROWS;
      const halfWidth = TUNNEL_WIDTH / 2;
      const geometry = new THREE.PlaneGeometry(1, 1);
      const fading = new Set<MeshBasicMaterial>();
      const textures = new Set<Texture>();

      const makeMaterials = (urls: string[]) => urls.map((url) => {
        const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide });
        const source = url.startsWith("https://cdn.sanity.io/")
          ? getImageProps({ src: url, alt: "", width: 640, height: 480 }).props.src
          : url;
        loader.load(source, (artwork) => {
          if (disposed) { artwork.dispose(); return; }
          const card = frameArtwork(artwork.image, mark, SEGMENT_DEPTH / rowHeight);
          const texture = card ? new THREE.CanvasTexture(card) : artwork;
          if (card) artwork.dispose();
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          material.map = texture;
          material.needsUpdate = true;
          textures.add(texture);
          fading.add(material);
        });
        return material;
      });

      const leftMaterials = makeMaterials(leftImages?.length ? leftImages : heroLeftImages);
      const rightMaterials = makeMaterials(rightImages?.length ? rightImages : heroRightImages);
      const allMaterials = [...leftMaterials, ...rightMaterials];
      let leftIndex = 0;
      let rightIndex = 0;

      type TunnelSegment = Group & {
        userData: {
          sequenceIndex: number;
          leftCards: Mesh<PlaneGeometry, MeshBasicMaterial>[];
          rightCards: Mesh<PlaneGeometry, MeshBasicMaterial>[];
        };
      };

      const createCard = (side: "left" | "right", row: number) => {
        const mesh = new THREE.Mesh(geometry, side === "left" ? leftMaterials[0] : rightMaterials[0]);
        mesh.position.set(side === "left" ? -halfWidth : halfWidth, (TUNNEL_HEIGHT - rowHeight) / 2 - row * rowHeight, -SEGMENT_DEPTH / 2);
        mesh.rotation.y = side === "left" ? Math.PI / 2 : -Math.PI / 2;
        mesh.scale.set(SEGMENT_DEPTH, rowHeight, 1);
        mesh.visible = false;
        return mesh;
      };

      const assignImage = (mesh: Mesh<PlaneGeometry, MeshBasicMaterial>, side: "left" | "right") => {
        const isLeft = side === "left";
        const materials = isLeft ? leftMaterials : rightMaterials;
        const index = isLeft ? leftIndex++ : rightIndex++;
        mesh.material = materials[index % materials.length];
        mesh.visible = true;
      };

      const populate = (segment: TunnelSegment) => {
        const { leftCards, rightCards, sequenceIndex } = segment.userData;
        [...leftCards, ...rightCards].forEach((card) => { card.visible = false; });
        if (Math.abs(sequenceIndex) % 2 === 0) {
          assignImage(leftCards[0], "left"); assignImage(leftCards[2], "left"); assignImage(rightCards[1], "right");
        } else {
          assignImage(leftCards[1], "left"); assignImage(rightCards[0], "right"); assignImage(rightCards[2], "right");
        }
      };

      const segments: TunnelSegment[] = Array.from({ length: NUM_SEGMENTS }, (_, index) => {
        const segment = new THREE.Group() as TunnelSegment;
        const leftCards = [0, 1, 2].map((row) => createCard("left", row));
        const rightCards = [0, 1, 2].map((row) => createCard("right", row));
        segment.position.z = -index * SEGMENT_DEPTH;
        segment.userData = { sequenceIndex: index, leftCards, rightCards };
        segment.add(...leftCards, ...rightCards);
        populate(segment);
        scene.add(segment);
        return segment;
      });

      const resize = () => {
        const width = Math.max(1, frame.clientWidth);
        const height = Math.max(1, frame.clientHeight);
        const aspect = width / height;
        let wallX = halfWidth;
        let fov = CAMERA_FOV;
        if (width <= 479) { wallX = 0.48; fov = 60; }
        else if (width <= 767) { wallX = 0.62; fov = 56; }
        else if (width <= 991) { wallX = 0.92; fov = 49; }
        if (width <= 991) wallX *= THREE.MathUtils.clamp(aspect / 0.75, 0.82, 1.08);
        segments.forEach((segment) => {
          segment.userData.leftCards.forEach((card) => { card.position.x = -wallX; });
          segment.userData.rightCards.forEach((card) => { card.position.x = wallX; });
        });
        camera.aspect = aspect;
        camera.fov = fov;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width <= 767 ? 1.5 : 2));
        renderer.setSize(width, height, false);
      };

      const observer = new ResizeObserver(resize);
      observer.observe(frame);
      resize();

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let running = !document.hidden;
      let raf = 0;
      let previousTime = 0;
      let travel = 0;

      const animate = (now: number) => {
        if (disposed) return;
        raf = requestAnimationFrame(animate);
        if (!running) { previousTime = now; return; }
        const delta = previousTime ? Math.min((now - previousTime) / 1000, 1 / 30) : 1 / 60;
        previousTime = now;
        if (!reduceMotion) {
          travel += 0.28;
          const targetZ = -SCROLL_TO_Z * travel;
          camera.position.z += CAMERA_CHASE * (targetZ - camera.position.z);
          const span = NUM_SEGMENTS * SEGMENT_DEPTH;
          for (const segment of segments) {
            if (segment.position.z > camera.position.z + SEGMENT_DEPTH) {
              segment.position.z = Math.min(...segments.map((item) => item.position.z)) - SEGMENT_DEPTH;
              segment.userData.sequenceIndex = Math.max(...segments.map((item) => item.userData.sequenceIndex)) + 1;
              populate(segment);
            } else if (segment.position.z < camera.position.z - span - SEGMENT_DEPTH) {
              segment.position.z = Math.max(...segments.map((item) => item.position.z)) + SEGMENT_DEPTH;
              segment.userData.sequenceIndex = Math.min(...segments.map((item) => item.userData.sequenceIndex)) - 1;
              populate(segment);
            }
          }
        }
        fading.forEach((material) => {
          material.opacity = Math.min(1, material.opacity + delta / IMAGE_FADE_DURATION);
          if (material.opacity === 1) fading.delete(material);
        });
        renderer.render(scene, camera);
      };

      const onVisibility = () => { running = !document.hidden; };
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(animate);

      cleanup = () => {
        disposed = true;
        cancelAnimationFrame(raf);
        observer.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        geometry.dispose();
        textures.forEach((texture) => texture.dispose());
        allMaterials.forEach((material) => material.dispose());
        renderer.dispose();
        canvas.remove();
      };
    }).catch(() => {
      frame.dataset.webgl = "unavailable";
    });

    return () => cleanup();
  }, [leftImages, rightImages]);

  return <div ref={frameRef} className="home-hero__tunnel" aria-hidden="true" />;
}
