"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { preload } from "react-dom";
import { getImageProps } from "next/image";
import type { Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from "three";
import { heroLeftImages, heroRightImages } from "@/content/hero-images";
import styles from "./hero-image-field.module.css";

// Stable, repeatable positions keep the scene consistent across renders and visits.
const noise = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const introDuration = 3.5;
const introProgress = (elapsed: number) => Math.min(1, elapsed / introDuration);
const cameraTravel = (progress: number) => (1 - Math.cos(Math.PI * progress)) / 2;
let homeCamera: { yaw: number; height: number; elapsed: number } | undefined;

export function HeroImageField({ leftImages = heroLeftImages, rightImages = heroRightImages, projectImages }: { projectImages?: string[]; leftImages?: string[]; rightImages?: string[] }) {
  const frameRef = useRef<HTMLDivElement>(null);

  const isHome = Boolean(projectImages?.length);
  if (isHome) {
    for (const src of heroLeftImages.slice(0, 3)) {
      preload(src, { as: "image", crossOrigin: "anonymous", fetchPriority: "high" });
    }
  }
  useLayoutEffect(() => {
    if (!isHome) return;
    const section = frameRef.current?.parentElement;
    if (homeCamera) {
      section?.style.setProperty("--hero-intro", String(cameraTravel(introProgress(homeCamera.elapsed))));
      frameRef.current?.setAttribute("data-returning", "");
    }
  }, [isHome]);

  useEffect(() => {
    const frame = frameRef.current;
    const section = frame?.parentElement;
    if (!frame || !section) return;
    const returningCamera = isHome ? homeCamera : undefined;
    let disposed = false;
    let cleanup = () => { disposed = true; };
    const urls = [...new Set([...(projectImages || []), ...leftImages, ...rightImages])];
    if (!urls.length) return;

    void Promise.all([
      import("three"),
      import("three/addons/postprocessing/EffectComposer.js"),
      import("three/addons/postprocessing/RenderPass.js"),
      import("three/addons/postprocessing/AfterimagePass.js"),
      import("three/addons/postprocessing/OutputPass.js"),
    ]).then(async ([THREE, { EffectComposer }, { RenderPass }, { AfterimagePass }, { OutputPass }]) => {
      if (disposed) return;
      let canvas = document.createElement("canvas");
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        // A failed canvas cannot be reused with different context attributes.
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        if (disposed) return;
        canvas = document.createElement("canvas");
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
      }
      canvas.className = styles.canvas;
      frame.dataset.renderer = "webgl";
      frame.appendChild(canvas);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog("#000000", 6, 32);
      const camera = new THREE.PerspectiveCamera(64, 1, .1, 70);
      camera.rotation.order = "YXZ";
      const composer = new EffectComposer(renderer);
      const trail = new AfterimagePass(0);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(trail);
      const output = new OutputPass();
      composer.addPass(output);
      const group = new THREE.Group();
      scene.add(group);
      const geometry = new THREE.PlaneGeometry(1, 1);
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      const textures = new Set<Texture>();
      const aspects = urls.map(() => 1.25);
      const materials = urls.map(() => new THREE.MeshBasicMaterial({
        color: "#b6bcb1", transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
      }));
      const imageFade = new Float32Array(urls.length);
      type Card = { mesh: Mesh<PlaneGeometry, MeshBasicMaterial>; image: number; width: number; tilt: number };
      const cards: Card[] = [];
      // Seeded scattering keeps the composition organic and stable across renders.
      const placements: { longitude: number; latitude: number }[] = [];
      for (let attempt = 0; attempt < 1600 && cards.length < 250; attempt++) {
        const seed = attempt + 1;
        const longitude = noise(seed) * Math.PI * 2;
        const latitude = (noise(seed + 1701) - .5) * 4.8;
        const crowded = placements.some(position => {
          const difference = Math.abs(longitude - position.longitude);
          const horizontal = Math.min(difference, Math.PI * 2 - difference);
          return Math.hypot(horizontal, latitude - position.latitude) < .19;
        });
        if (crowded) continue;
        placements.push({ longitude, latitude });
        const radius = 11 + noise(seed + 3201) * 3;
        const image = Math.floor(noise(seed + 4901) * urls.length);
        const mesh = new THREE.Mesh(geometry, materials[image].clone());
        mesh.position.set(Math.sin(longitude) * radius, latitude * 12, -Math.cos(longitude) * radius);
        mesh.lookAt(0, mesh.position.y, 0);
        const width = 1.1 + noise(seed + 6101) ** 1.6 * 3;
        mesh.scale.set(width, width / aspects[image], 1);
        group.add(mesh);
        cards.push({ mesh, image, width, tilt: mesh.rotation.y });
      }
      let failed = 0;
      let introElapsed = returningCamera?.elapsed ?? 0;
      let introFinished = false;
      let presented = false;
      urls.forEach((url, index) => {
        // Same-origin optimized textures also work when the asset CDN omits CORS
        // headers. Ordinary <img> tags can display those files; WebGL cannot.
        const textureUrl = url.startsWith("https://cdn.sanity.io/")
          ? getImageProps({ src: url, alt: "", width: 512, height: 512, quality: 90 }).props.src
          : url;
        loader.load(textureUrl, artwork => {
          if (disposed) { artwork.dispose(); return; }
          const source = artwork.image as HTMLImageElement;
          const originalAspect = source.width / source.height;
          const aspect = projectImages?.includes(url) ? 400 / 501 : originalAspect;
          const texture = artwork;
          texture.repeat.set(Math.min(1, aspect / originalAspect), Math.min(1, originalAspect / aspect));
          texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          renderer.initTexture(texture);
          textures.add(texture);
          aspects[index] = aspect;
          materials[index].map = texture;
          materials[index].needsUpdate = true;
          cards.forEach(card => {
            if (card.image !== index) return;
            card.mesh.scale.y = card.width / aspect;
            card.mesh.material.map = texture;
            card.mesh.material.needsUpdate = true;
          });
          requestFrame();
        }, undefined, () => {
          if (disposed) return;
          failed++;
          if (failed === urls.length) frame.dataset.renderer = "fallback";
          else requestFrame();
        });
      });

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let visible = true;
      let raf = 0;
      let previousTime = 0;
      let yaw = returningCamera?.yaw ?? 0;
      let cameraHeight = returningCamera?.height ?? 0;
      let targetYaw = yaw;
      let targetHeight = cameraHeight;
      let dragYaw = 0;
      let motionAmount = 0;
      const viewDirection = new THREE.Vector3();
      const cardDirection = new THREE.Vector3();
      const viewFrustum = new THREE.Frustum();
      const projectionView = new THREE.Matrix4();
      let drag: { x: number; y: number; yaw: number; id: number } | null = null;
      let departureStart: number | null = null;
      let contextLost = false;
      const canRender = () => !contextLost && visible && !document.hidden && !disposed && frame.dataset.renderer !== "fallback";
      const render = (now: number) => {
        raf = 0;
        if (!canRender()) { previousTime = 0; return; }
        const delta = previousTime ? Math.min((now - previousTime) / 1000, .15) : 1 / 60;
        previousTime = now;
        if (!textures.size) { previousTime = 0; return; }
        if (presented) introElapsed += delta;
        const progress = motion.matches ? 1 : introProgress(introElapsed);
        const entrance = cameraTravel(progress);
        if (presented) section.style.setProperty("--hero-intro", String(entrance));

        const blend = 1 - Math.exp(-6 * delta);
        const interactionWeight = motion.matches ? 0 : entrance;
        const desiredYaw = interactionWeight * (targetYaw + dragYaw);
        const desiredHeight = interactionWeight * targetHeight;
        const yawStep = (desiredYaw - yaw) * blend;
        const heightStep = (desiredHeight - cameraHeight) * blend;
        yaw += yawStep;
        cameraHeight += heightStep;
        const speed = Math.abs(yawStep) / delta + Math.abs(heightStep) / delta * .08;
        const intensity = motion.matches ? 0 : Math.min(1, speed * .8);
        motionAmount += (intensity - motionAmount) * (1 - Math.exp(-10 * delta));
        trail.uniforms.damp.value = motionAmount > .005 ? Math.pow(.38 + motionAmount * .2, delta * 60) : 0;
        camera.rotation.set(0, yaw, 0);
        camera.position.set(0, cameraHeight, 0);
        if (!introFinished) {
          // Enter the cylinder along its axis of view. Perspective carries the
          // foreground cards out to the edges while distant cards stay near center.
          const distance = 16 * (1 - entrance);
          camera.position.z += distance;
          for (const card of cards) {
            const side = Math.sign(card.mesh.position.x);
            card.mesh.rotation.y = card.tilt - side * .28 * (1 - THREE.MathUtils.smoothstep(introElapsed, 2.5, introDuration));
          }
        }
        if (!introFinished && progress === 1) {
          introFinished = true;
          frame.dataset.intro = "complete";
        }
        let imagesFading = false;
        materials.forEach((material, index) => {
          if (!material.map) return;
          imageFade[index] = motion.matches || returningCamera ? 1 : Math.min(1, imageFade[index] + delta / .65);
          material.opacity = .88 * imageFade[index];
          if (imageFade[index] < 1) imagesFading = true;
        });
        camera.getWorldDirection(viewDirection);
        let hasVisibleArtwork = false;
        if (!presented) {
          scene.updateMatrixWorld();
          projectionView.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
          viewFrustum.setFromProjectionMatrix(projectionView);
        }
        for (const card of cards) {
          cardDirection.copy(card.mesh.position).multiplyScalar(group.scale.x).sub(camera.position);
          const forwardDistance = cardDirection.dot(viewDirection);
          const cameraClearance = THREE.MathUtils.smoothstep(forwardDistance, 3.5, 7);
          cardDirection.normalize();
          const alignment = Math.max(0, cardDirection.dot(viewDirection));
          const frontOpacity = .28 + .72 * THREE.MathUtils.smoothstep(alignment, .45, .98);
          card.mesh.material.opacity = materials[card.image].opacity * frontOpacity * cameraClearance;
          if (!presented && !hasVisibleArtwork && card.mesh.material.opacity > 0) {
            hasVisibleArtwork = viewFrustum.intersectsObject(card.mesh);
          }
        }
        if (departureStart !== null) {
          const progress = THREE.MathUtils.smoothstep(now - departureStart, 0, 1650);
          group.position.copy(viewDirection).multiplyScalar(progress * 19);
        }
        composer.render(delta);
        if (!presented && hasVisibleArtwork) {
          presented = true;
          frame.dataset.ready = "true";
        } else if (!presented && !imagesFading && textures.size + failed === urls.length) {
          frame.dataset.renderer = "fallback";
          previousTime = 0;
          return;
        }
        if (isHome && presented) homeCamera = { yaw, height: cameraHeight, elapsed: Math.min(introDuration, motion.matches ? introDuration : introElapsed) };
        const stillTurning = Math.abs(desiredYaw - yaw) > .00005 || Math.abs(desiredHeight - cameraHeight) > .00005;
        const hoverPending = !motion.matches && (Math.abs(targetYaw + dragYaw - yaw) > .00005 || Math.abs(targetHeight - cameraHeight) > .00005);
        if (departureStart !== null || imagesFading || !introFinished || stillTurning || hoverPending || motionAmount > .001) requestFrame();
        else previousTime = 0;
      };
      function requestFrame() { if (!raf && canRender()) raf = requestAnimationFrame(render); }
      const resize = () => {
        const width = Math.max(1, frame.clientWidth);
        const height = Math.max(1, frame.clientHeight);
        camera.fov = width < 768 ? 75 : 64;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(width, height, false);
        composer.setPixelRatio(renderer.getPixelRatio());
        composer.setSize(width, height);
        requestFrame();
      };
      const pointerMove = (event: PointerEvent) => {
        if (motion.matches || !visible) return;
        const bounds = frame.getBoundingClientRect();
        if (event.clientY < bounds.top || event.clientY > bounds.bottom) return;
        if (event.pointerType === "mouse" && !drag) {
          const horizontal = THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
          const vertical = THREE.MathUtils.clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
          targetYaw = -horizontal * 2.2;
          targetHeight = -vertical * 11.5;
        }
        if (drag && drag.id === event.pointerId) dragYaw = drag.yaw - (event.clientX - drag.x) / bounds.width * 2.4;
        requestFrame();
      };
      const pointerDown = (event: PointerEvent) => {
        if (motion.matches || event.button !== 0 || (event.target as Element).closest("a,button,input")) return;
        drag = { x: event.clientX, y: event.clientY, yaw: dragYaw, id: event.pointerId };
      };
      const pointerUp = () => { drag = null; };
      const captureGallery = (event: Event) => {
        const bounds = frame.getBoundingClientRect();
        const projected = new THREE.Vector3();
        const visibleCards = cards.filter(card => {
          card.mesh.getWorldPosition(projected).project(camera);
          return projectImages?.includes(urls[card.image]) && Math.abs(projected.x) < .9 && Math.abs(projected.y) < .9 && projected.z < 1 && card.mesh.material.opacity > .1;
        }).sort((a, b) => b.mesh.material.opacity - a.mesh.material.opacity).filter((card, index, sorted) => sorted.findIndex(other => other.image === card.image) === index).slice(0, 6).map(card => {
          card.mesh.getWorldPosition(projected).project(camera);
          const distance = card.mesh.position.distanceTo(camera.position);
          const width = card.width / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance) * bounds.height;
          return { src: urls[card.image], x: bounds.left + (projected.x + 1) * bounds.width / 2 - width / 2, y: bounds.top + (1 - projected.y) * bounds.height / 2 - width / aspects[card.image] / 2, width, height: width / aspects[card.image] };
        });
        (event as CustomEvent).detail(visibleCards);
        departureStart = performance.now();
        requestFrame();
      };
      const restoreGallery = () => {
        departureStart = null;
        group.position.set(0, 0, 0);
        requestFrame();
      };
      section.addEventListener("hero:restore", restoreGallery);
      section.addEventListener("hero:capture", captureGallery);
      const pointerLeave = () => {
        drag = null;
        targetYaw = yaw - dragYaw;
        targetHeight = cameraHeight;
      };
      const onVisibility = () => { previousTime = 0; if (canRender()) requestFrame(); };
      const onMotion = () => { introFinished = false; introElapsed = introDuration; targetYaw = 0; targetHeight = 0; requestFrame(); };
      const onContextLost = (event: Event) => {
        event.preventDefault();
        contextLost = true;
        cancelAnimationFrame(raf);
        raf = 0;
        previousTime = 0;
      };
      const onContextRestored = () => {
        contextLost = false;
        requestFrame();
      };
      canvas.addEventListener("webglcontextlost", onContextLost);
      canvas.addEventListener("webglcontextrestored", onContextRestored);
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(frame);
      const intersectionObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; onVisibility(); });
      intersectionObserver.observe(section);
      window.addEventListener("pointermove", pointerMove, { passive: true });
      section.addEventListener("pointerdown", pointerDown, { passive: true });
      document.documentElement.addEventListener("pointerleave", pointerLeave);
      window.addEventListener("pointerup", pointerUp);
      window.addEventListener("pointercancel", pointerUp);
      document.addEventListener("visibilitychange", onVisibility);
      motion.addEventListener("change", onMotion);
      resize();
      cleanup = () => {
        disposed = true;
        section.removeEventListener("hero:restore", restoreGallery);
        section.removeEventListener("hero:capture", captureGallery);
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        window.removeEventListener("pointermove", pointerMove);
        section.removeEventListener("pointerdown", pointerDown);
        document.documentElement.removeEventListener("pointerleave", pointerLeave);
        window.removeEventListener("pointerup", pointerUp);
        window.removeEventListener("pointercancel", pointerUp);
        document.removeEventListener("visibilitychange", onVisibility);
        motion.removeEventListener("change", onMotion);
        textures.forEach(texture => texture.dispose());
        materials.forEach(material => material.dispose());
        cards.forEach(card => card.mesh.material.dispose());
        geometry.dispose();
        trail.dispose();
        output.dispose();
        composer.dispose();
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
        delete frame.dataset.ready;
        delete frame.dataset.intro;
        delete frame.dataset.renderer;
      };
    }).catch(() => { if (!disposed) frame.dataset.renderer = "fallback"; });
    return () => cleanup();
  }, [leftImages, rightImages, projectImages, isHome]);

  return <div ref={frameRef} className={styles.field} data-renderer="pending" aria-hidden="true" />;
}
