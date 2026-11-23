"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { gsap } from "gsap";
import type { ServicesHeroImage } from "@/sanity/services";
import styles from "./services-hero-mosaic.module.css";

type Props = { images: ServicesHeroImage[]; labels: string[] };

export function ServicesHeroMosaic({ images, labels: categoryLabels }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !images.length) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | undefined;
    let labelRenderer: CSS2DRenderer | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let timeline: gsap.core.Timeline | undefined;
    const floatingLabels: HTMLSpanElement[] = [];
    const repeatedCards: Array<{
      group: THREE.Group;
      material: THREE.MeshBasicMaterial;
      scatterX: number;
      scatterY: number;
      scatterZ: number;
      popX: number;
      popY: number;
      popZ: number;
      popScale: number;
    }> = [];
    let cards: Array<{
      group: THREE.Group;
      material: THREE.MeshBasicMaterial;
      ringX: number;
      ringY: number;
      ringZ: number;
      scatterX: number;
      scatterY: number;
      scatterZ: number;
      popX: number;
      popY: number;
      popZ: number;
      popScale: number;
      ringScale: number;
    }> = [];
    let renderTicker: (() => void) | undefined;

    const start = async () => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin("anonymous");
      const loaded = await Promise.all(images.map(async (item) => {
        try { return await textureLoader.loadAsync(item.url); }
        catch { return null; }
      }));
      if (disposed || !hostRef.current) {
        loaded.forEach(texture => texture?.dispose());
        return;
      }

      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;
      const aspect = width / Math.max(height, 1);
      const rendererInstance = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer = rendererInstance;
      rendererInstance.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      rendererInstance.setSize(width, height);
      rendererInstance.outputColorSpace = THREE.SRGBColorSpace;
      rendererInstance.domElement.className = styles.webgl;
      rendererInstance.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(rendererInstance.domElement);

      const labels = new CSS2DRenderer();
      labelRenderer = labels;
      labels.setSize(width, height);
      labels.domElement.className = styles.labels;
      labels.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(labels.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      const collage = new THREE.Group();
      scene.add(collage);
      const repeatedCanvas = new THREE.Group();
      scene.add(repeatedCanvas);
      const camera = new THREE.PerspectiveCamera(43, aspect, 0.1, 120);
      const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
      const cameraRig = new THREE.Group();
      scene.add(cameraRig);
      camera.position.set(0, 0, 0);
      camera.rotation.set(0, 0, 0);
      cameraRig.position.set(0, 0, 22);
      cameraRig.rotation.set(0, 0, 0);
      cameraRig.add(camera);

      const visible = images.flatMap((item, index) => loaded[index] ? [{ item, texture: loaded[index]!, index }] : []);
      // Spread the final composition over an ellipsoid so it reads like a
      // layered globe as the group turns, rather than a flat circular plate.
      const globeRadiusX = Math.min(4.8, aspect * 4.2);
      const globeRadiusY = 3.5;
      const globeRadiusZ = 3.05;
      const count = visible.length;
      const columns = Math.ceil(Math.sqrt(count * aspect));
      const rows = Math.ceil(count / columns);
      const cellWidth = aspect * 24 / columns;
      const cellHeight = 21 / rows;
      const tileWidth = cellWidth * columns;
      const tileHeight = cellHeight * rows;

      cards = visible.map(({ texture, index }) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        // Jitter one card inside every cell. This keeps a random collage feel
        // while covering the whole camera view, including its center and edges.
        const x = (column - (columns - 1) / 2) * cellWidth + randomBetween(-cellWidth * .38, cellWidth * .38);
        const y = ((rows - 1) / 2 - row) * cellHeight + randomBetween(-cellHeight * .38, cellHeight * .38);
        const z = randomBetween(-5.5, 5.5);
        const cardWidth = 1.25 + ((index * 7) % 8) * .15;
        const imageAspect = texture.image.width / Math.max(texture.image.height, 1);
        const cardHeight = cardWidth / Math.max(imageAspect, .42);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth, cardHeight), material);
        const group = new THREE.Group();
        // The opening frame is already spread across the canvas. Cards surge
        // toward the lens from varied depths before settling into the scatter.
        const startScale = .58 + ((index * 7) % 5) * .12;
        const popX = x * .96;
        const popY = y * .96;
        const popZ = z + 2.4;
        const popScale = 1.28 + ((index * 7) % 4) * .1;
        group.position.set(x * .72, y * .72, z - 3.2);
        group.scale.setScalar(startScale);
        group.rotation.set(0, 0, 0);
        group.add(mesh);

        collage.add(group);

        const globeAngle = index * 2.399963229728653;
        const latitude = 1 - 2 * ((index + .5) / Math.max(count, 1));
        const latitudeRadius = Math.sqrt(1 - latitude * latitude);
        const ringX = Math.cos(globeAngle) * globeRadiusX * latitudeRadius + Math.sin(index * 1.31) * .2;
        const ringY = latitude * globeRadiusY + Math.cos(index * 1.83) * .16;
        const ringZ = Math.sin(globeAngle) * globeRadiusZ * latitudeRadius;
        const ringScale = .82 + ((index * 13) % 5) * .1;

        // Repeat the image field in all eight neighboring tiles. This lets the
        // camera explore a card near a tile edge without exposing a blank side.
        for (const tileY of [-1, 0, 1]) {
          for (const tileX of [-1, 0, 1]) {
            if (tileX === 0 && tileY === 0) continue;
            const offsetX = tileX * tileWidth;
            const offsetY = tileY * tileHeight;
            const replicaMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
            const replicaGroup = new THREE.Group();
            replicaGroup.position.set(x * .72 + offsetX, y * .72 + offsetY, z - 3.2);
            replicaGroup.scale.setScalar(startScale);
            replicaGroup.rotation.set(0, 0, 0);
            replicaGroup.add(new THREE.Mesh(mesh.geometry, replicaMaterial));

            repeatedCanvas.add(replicaGroup);
            repeatedCards.push({
              group: replicaGroup,
              material: replicaMaterial,
              scatterX: x + offsetX,
              scatterY: y + offsetY,
              scatterZ: z,
              popX: popX + offsetX,
              popY: popY + offsetY,
              popZ,
              popScale,
            });
          }
        }
        return {
          group, material,
          scatterX: x, scatterY: y, scatterZ: z,
          popX, popY, popZ, popScale,
          ringX, ringY, ringZ, ringScale,
        };
      });

      const labelPositions: Array<[number, number]> = [
        [-.37, .28], [.23, .36], [-.06, -.12], [.38, -.12], [-.34, -.35],
      ];
      for (const tileY of [-1, 0, 1]) {
        for (const tileX of [-1, 0, 1]) {
          categoryLabels.slice(0, 5).forEach((copy, index) => {
            const tag = document.createElement("span");
            tag.className = `${styles.label} ${styles.categoryLabel}`;
            tag.textContent = copy;
            floatingLabels.push(tag);
            const label = new CSS2DObject(tag);
            const [x, y] = labelPositions[index];
            label.position.set(tileX * tileWidth + x * tileWidth, tileY * tileHeight + y * tileHeight, randomBetween(-.5, .5));
            scene.add(label);
          });
        }
      }
      if (disposed) return;
      const render = () => {
        rendererInstance.render(scene, camera);
        labels.render(scene, camera);
      };
      renderTicker = render;
      gsap.ticker.add(render);

      timeline = gsap.timeline({ onComplete: () => {
        scene.remove(collage);
        scene.remove(repeatedCanvas);
        render();
        host.classList.add(styles.finished);
      } });
      // Visit three different image locations: dolly in on each one, then
      // pull back before traveling across to the next in one continuous 3D path.
      const candidates = [...cards];
      for (let index = candidates.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
      }
      const focusCards = [candidates.shift()!];
      while (focusCards.length < Math.min(3, cards.length) && candidates.length) {
        let farthestIndex = 0;
        let farthestScore = -Infinity;
        candidates.forEach((candidate, index) => {
          const closestFocus = Math.min(...focusCards.map(focus => Math.hypot(
            candidate.scatterX - focus.scatterX,
            candidate.scatterY - focus.scatterY,
          )));
          const score = closestFocus + randomBetween(0, 2.5);
          if (score > farthestScore) {
            farthestScore = score;
            farthestIndex = index;
          }
        });
        focusCards.push(candidates.splice(farthestIndex, 1)[0]);
      }
      const travelStart = .08;
      const travelDuration = 5.8;
      const cameraPoints = [new THREE.Vector3(0, 0, 30)];
      const targetPoints = [new THREE.Vector3(0, 0, 0)];
      focusCards.forEach((card, index) => {
        const focusX = card.scatterX + randomBetween(-.6, .6);
        const focusY = card.scatterY + randomBetween(-.45, .45);
        cameraPoints.push(new THREE.Vector3(focusX, focusY, card.scatterZ + 16));
        targetPoints.push(new THREE.Vector3(card.scatterX, card.scatterY, card.scatterZ));

        const nextCard = focusCards[index + 1];
        const dx = nextCard ? nextCard.scatterX - card.scatterX : randomBetween(-1, 1);
        const dy = nextCard ? nextCard.scatterY - card.scatterY : randomBetween(-1, 1);
        const separation = Math.hypot(dx, dy);
        const directionLength = Math.max(separation, .001);
        const sideX = -dy / directionLength;
        const sideY = dx / directionLength;
        const excursion = 17 + Math.max(0, 22 - separation) * .5;
        const travelX = nextCard ? (card.scatterX + nextCard.scatterX) / 2 + sideX * excursion : focusX + sideX * excursion;
        const travelY = nextCard ? (card.scatterY + nextCard.scatterY) / 2 + sideY * excursion : focusY + sideY * excursion;
        const travelZ = nextCard ? (card.scatterZ + nextCard.scatterZ) / 2 : card.scatterZ;
        const pullback = nextCard ? 46 + Math.max(0, 24 - separation) * .32 : 42;
        cameraPoints.push(new THREE.Vector3(travelX, travelY, travelZ + pullback));
        targetPoints.push(new THREE.Vector3((travelX + (nextCard?.scatterX ?? focusX)) / 2, (travelY + (nextCard?.scatterY ?? focusY)) / 2, travelZ));
      });
      const cameraPath = new THREE.CatmullRomCurve3(cameraPoints, false, "centripetal");
      const targetPath = new THREE.CatmullRomCurve3(targetPoints, false, "centripetal");
      // Parameterize camera travel by distance, not by control-point index.
      // This keeps speed even when randomized image locations are far apart.
      cameraPath.arcLengthDivisions = 400;
      targetPath.arcLengthDivisions = 400;
      const cameraPathLength = cameraPath.getLength();
      const travel = { progress: 0 };
      timeline.to(travel, {
        progress: 1,
        duration: travelDuration,
        ease: "none",
        onUpdate: () => {
          const pathT = cameraPath.getUtoTmapping(travel.progress, cameraPathLength * travel.progress);
          const position = cameraPath.getPoint(pathT);
          const lookTarget = targetPath.getPoint(pathT);
          // Zoom depth and lateral travel share this same 3D route, so every
          // pullback and approach stays synchronized through nearby targets.
          cameraRig.position.copy(position);
          cameraRig.up.set(0, 1, 0);
          cameraRig.lookAt(lookTarget);
          // Object3D groups orient their +Z axis toward the target, while a
          // perspective camera views down -Z. Flip the rig so its child camera
          // looks into the image field instead of away from it.
          cameraRig.rotateY(Math.PI);
        },
      }, travelStart);
      const finalPathT = cameraPath.getUtoTmapping(1, cameraPathLength);
      const finalPathPoint = cameraPath.getPoint(finalPathT);
      const lastLookTarget = targetPath.getPoint(finalPathT);
      const lastCameraPosition = finalPathPoint.clone();
      const globeCenter = lastCameraPosition.clone().add(
        lastLookTarget.clone().sub(lastCameraPosition).normalize().multiplyScalar(18),
      );
      const formationStart = travelStart + travelDuration;
      const formationDuration = 1.08;
      const formationStagger = .004;
      const formationTotalDuration = formationDuration + Math.max(0, cards.length - 1) * formationStagger;
      const formationEnd = formationStart + formationTotalDuration;
      const globeTurnAt = formationEnd + .04;
      const fadeStart = globeTurnAt + .72;

      // Pivot the scattered cards beneath the camera's final position while
      // they converge, so globe formation starts directly from the last view.
      timeline.to(collage.position, {
        x: globeCenter.x,
        y: globeCenter.y,
        z: globeCenter.z,
        duration: formationTotalDuration,
        ease: "power2.inOut",
      }, formationStart);
      // Turn the globe by orbiting image positions around its center while
      // keeping each image plane front-facing and un-tilted.
      const globeTurn = { value: 0 };
      timeline.to(globeTurn, {
        value: 1,
        duration: .68,
        ease: "sine.inOut",
        onUpdate: () => {
          const angle = globeTurn.value * .48;
          const cosine = Math.cos(angle);
          const sine = Math.sin(angle);
          cards.forEach(({ group, ringX, ringY, ringZ }) => {
            group.position.set(ringX * cosine + ringZ * sine, ringY, -ringX * sine + ringZ * cosine);
          });
        },
      }, globeTurnAt);

      cards.forEach(({ group, material, scatterX, scatterY, scatterZ, popX, popY, popZ, popScale, ringX, ringY, ringZ, ringScale }, index) => {
        timeline!.to(group.position, { x: popX, y: popY, z: popZ, duration: .42, ease: "power3.out" }, index * .009)
          .to(group.scale, { x: popScale, y: popScale, z: popScale, duration: .42, ease: "power2.out" }, index * .009)
          .to(group.position, { x: scatterX, y: scatterY, z: scatterZ, duration: .68, ease: "power2.inOut" }, .4 + index * .008)
          .to(group.scale, { x: 1, y: 1, z: 1, duration: .68, ease: "power2.inOut" }, .4 + index * .008);
        const progress = { value: 0 };
        const targetX = globeCenter.x + ringX;
        const targetY = globeCenter.y + ringY;
        const targetZ = globeCenter.z + ringZ;
        const controlX = (scatterX + targetX) / 2 + Math.sin(index * 1.7) * .65;
        const controlY = (scatterY + targetY) / 2 + Math.cos(index * 1.3) * .55;
        const controlZ = (scatterZ + targetZ) / 2 + Math.sin(index * 2.1) * .65;
        const itemFormationStart = formationStart + index * formationStagger;
        timeline!.to(progress, {
          value: 1,
          duration: formationDuration,
          ease: "power2.inOut",
          onUpdate: () => {
            const t = progress.value;
            const inverse = 1 - t;
            group.position.set(
              inverse * inverse * scatterX + 2 * inverse * t * controlX + t * t * targetX - collage.position.x,
              inverse * inverse * scatterY + 2 * inverse * t * controlY + t * t * targetY - collage.position.y,
              inverse * inverse * scatterZ + 2 * inverse * t * controlZ + t * t * targetZ - collage.position.z,
            );
          },
        }, itemFormationStart)
          .to(group.scale, { x: ringScale, y: ringScale, z: ringScale, duration: formationDuration, ease: "power2.inOut" }, itemFormationStart)
          .to(material, { opacity: 0, duration: .55, ease: "power1.in" }, fadeStart);
      });
      floatingLabels.forEach(label => timeline!.to(label, { opacity: 0, duration: .42, ease: "sine.inOut" }, formationStart + .08));
      repeatedCards.forEach(({ group, material, scatterX, scatterY, scatterZ, popX, popY, popZ, popScale }, index) => {
        const formationFade = formationStart;
        timeline!.to(group.position, { x: popX, y: popY, z: popZ, duration: .42, ease: "power3.out" }, index % cards.length * .009)
          .to(group.scale, { x: popScale, y: popScale, z: popScale, duration: .42, ease: "power2.out" }, index % cards.length * .009)
          .to(group.position, { x: scatterX, y: scatterY, z: scatterZ, duration: .68, ease: "power2.inOut" }, .4 + index % cards.length * .008)
          .to(group.scale, { x: 1, y: 1, z: 1, duration: .68, ease: "power2.inOut" }, .4 + index % cards.length * .008)
          .to(material, { opacity: 0, duration: .9, ease: "sine.inOut" }, formationFade);
      });
      render();

      resizeObserver = new ResizeObserver(() => {
        const w = host.clientWidth || window.innerWidth;
        const h = host.clientHeight || window.innerHeight;
        camera.aspect = w / Math.max(h, 1);
        camera.updateProjectionMatrix();
        rendererInstance.setSize(w, h);
        labels.setSize(w, h);
        render();
      });
      resizeObserver.observe(host);
    };

    void start();
    return () => {
      disposed = true;
      timeline?.kill();
      resizeObserver?.disconnect();
      if (renderTicker) gsap.ticker.remove(renderTicker);
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
      labelRenderer?.domElement.remove();
      cards.forEach(({ group, material }) => {
        group.traverse(node => { if (node instanceof THREE.Mesh) node.geometry.dispose(); });
        material.map?.dispose();
        material.dispose();
      });
      repeatedCards.forEach(({ material }) => material.dispose());
    };
  }, [images, categoryLabels]);

  return <section className={styles.hero} aria-label="Izart Studio services">
    <div className={styles.stage} ref={hostRef}>
      <ul className={styles.accessibleList}>
        {categoryLabels.map((label, index) => <li key={`label-${index}`}>{label}</li>)}
        {images.map((item, index) => <li key={`${item.url}-${index}`}>{item.alt}</li>)}
      </ul>
    </div>
  </section>;
}
