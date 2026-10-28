"use client";

import { useEffect, useRef } from "react";
import type { ListingProject } from "../project-types";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function useProjectColors(projects: ListingProject[]) {
  const colorsRef = useRef(projects.map(project => project.listingColor || project.background));

  useEffect(() => {
    const images = projects.map((project, projectIndex) => {
      if (project.listingColor) return null;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 24;
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) return;
          context.drawImage(image, 0, 0, 24, 24);
          const pixels = context.getImageData(0, 0, 24, 24).data;
          let red = 0, green = 0, blue = 0, weight = 0;
          for (let index = 0; index < pixels.length; index += 4) {
            if (pixels[index + 3] < 180) continue;
            const maximum = Math.max(pixels[index], pixels[index + 1], pixels[index + 2]);
            const minimum = Math.min(pixels[index], pixels[index + 1], pixels[index + 2]);
            const pixelWeight = .35 + (maximum - minimum) / 255;
            red += pixels[index] * pixelWeight;
            green += pixels[index + 1] * pixelWeight;
            blue += pixels[index + 2] * pixelWeight;
            weight += pixelWeight;
          }
          if (!weight) return;
          red /= weight; green /= weight; blue /= weight;
          const maximum = Math.max(red, green, blue), minimum = Math.min(red, green, blue), delta = maximum - minimum;
          let hue = 0;
          if (delta) {
            if (maximum === red) hue = ((green - blue) / delta) % 6;
            else if (maximum === green) hue = (blue - red) / delta + 2;
            else hue = (red - green) / delta + 4;
            hue = Math.round(hue * 60);
            if (hue < 0) hue += 360;
          }
          const color = `hsl(${hue} ${clamp(34 + delta / 255 * 34, 34, 68).toFixed(0)}% 12%)`;
          colorsRef.current[projectIndex] = color;
          window.dispatchEvent(new CustomEvent("iz-project-color", { detail: { index: projectIndex, color } }));
        } catch { /* Keep the configured project background when canvas sampling is blocked. */ }
      };
      image.src = project.listingImage.url;
      return image;
    });
    return () => images.forEach(image => { if (image) image.onload = null; });
  }, [projects]);

  return colorsRef;
}
