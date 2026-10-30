export type ProjectTheme = {
  background: string; foreground: string; muted: string;
  blobOne: string; blobTwo: string;
  heroBackground: string; heroForeground: string; heroMuted: string;
};
export type ProjectColorOverrides = {
  portfolioBackground?: string; blobOne?: string; blobTwo?: string;
  heroBackground?: string; foreground?: string;
};
export const isHex = (value: unknown): value is string => typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
const rgb = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
const hex = (values: number[]) => "#" + values.map(value => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, "0")).join("");
export const mixColor = (a: string, b: string, weight: number) => hex(rgb(a).map((value, index) => value * (1 - weight) + rgb(b)[index] * weight));
export function luminance(color: string) {
  const linear = rgb(color).map(value => { const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; });
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}
export function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}
function foreground(background: string, requested?: string) {
  if (isHex(requested) && contrast(requested, background) >= 4.5) return requested;
  return contrast("#ffffff", background) >= contrast("#000000", background) ? "#ffffff" : "#000000";
}
function safeAccent(color: string, background: string, text: string) {
  for (let amount = 0; amount <= 1; amount += .05) {
    // Adjust lightness without mixing a cover accent into the base hue.
    const candidate = mixColor(color, luminance(text) > .5 ? "#000000" : "#ffffff", amount);
    if (contrast(text, candidate) >= 4.5) return candidate;
  }
  return background;
}
function muted(text: string, background: string) {
  const candidate = mixColor(text, background, .18);
  return contrast(candidate, background) >= 4.5 ? candidate : text;
}
export function createProjectTheme(palette: string[], suppliedOverrides: ProjectColorOverrides | null = null): ProjectTheme {
  // GROQ returns null for an unset object; parameter defaults only cover undefined.
  const overrides = suppliedOverrides ?? {};
  const colors = palette.filter(isHex);
  const primary = colors[0] || "#17201d";
  const secondary = colors[1] || mixColor(primary, "#ffffff", .2);
  const tertiary = colors[2] || mixColor(primary, "#000000", .2);
  const background = isHex(overrides.portfolioBackground) ? overrides.portfolioBackground : mixColor(primary, "#000000", .15);
  const text = foreground(background, overrides.foreground);
  const heroBackground = isHex(overrides.heroBackground) ? overrides.heroBackground : background;
  const heroForeground = foreground(heroBackground, overrides.foreground);
  const distance = (a: string, b: string) => Math.hypot(...rgb(a).map((value, index) => value - rgb(b)[index]));
  const accents = colors.slice(1).map(color => safeAccent(color, background, text));
  const chroma = (color: string) => { const values = rgb(color); return Math.max(...values) - Math.min(...values); };
  const first = [...accents].sort((a, b) => (distance(b, background) + chroma(b) * .6) - (distance(a, background) + chroma(a) * .6))[0] || secondary;
  const blobOne = safeAccent(isHex(overrides.blobOne) ? overrides.blobOne : first, background, text);
  const second = [...accents].sort((a, b) => (Math.min(distance(b, blobOne), distance(b, background)) + chroma(b) * .35) - (Math.min(distance(a, blobOne), distance(a, background)) + chroma(a) * .35))[0] || tertiary;
  let blobTwo = safeAccent(isHex(overrides.blobTwo) ? overrides.blobTwo : second, background, text);
  if (!isHex(overrides.blobTwo) && distance(blobOne, blobTwo) < 45) {
    // Monochrome covers still get tonal separation, using a cover-derived hue.
    blobTwo = safeAccent(mixColor(second, luminance(text) > .5 ? "#000000" : "#ffffff", .35), background, text);
  }
  const secondaryText = muted(text, background);
  return {
    background, foreground: text,
    muted: [background, blobOne, blobTwo].every(color => contrast(secondaryText, color) >= 4.5) ? secondaryText : text,
    blobOne, blobTwo,
    heroBackground, heroForeground, heroMuted: muted(heroForeground, heroBackground),
  };
}

/** Small quantized palette of distinct cover colors, ranked by visible area. */
export function paletteFromPixels(pixels: Uint8Array): string[] {
  const buckets = new Map<string, { sum: number[]; count: number }>();
  for (let offset = 0; offset + 2 < pixels.length; offset += 3) {
    const sample = Array.from(pixels.slice(offset, offset + 3));
    const key = sample.map(value => Math.floor(value / 32)).join(",");
    const bucket = buckets.get(key) || { sum: [0, 0, 0], count: 0 };
    bucket.count++; sample.forEach((value, index) => { bucket.sum[index] += value; }); buckets.set(key, bucket);
  }
  const ranked = [...buckets.values()].sort((a, b) => b.count - a.count);
  const chosen: number[][] = [];
  for (const bucket of ranked) {
    if (bucket.count < Math.max(2, pixels.length / 3 * .005)) continue;
    const color = bucket.sum.map(value => value / bucket.count);
    if (!chosen.length || chosen.every(other => Math.hypot(...color.map((value, index) => value - other[index])) > 65)) chosen.push(color);
    if (chosen.length === 8) break;
  }
  return chosen.map(hex);
}
