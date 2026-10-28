export type FanLayout = "fan" | "brand-identity";
type Slot = { x: number; y: number; width: number; height: number; corners: number[]; entryX: number; entryScale: number; opacity: number };
const left = [0, .9, 100, 0, 100, 100, 0, 95.2];
const right = [0, 0, 100, .9, 100, 95.2, 0, 100];
const rectangle = [0, 0, 100, 0, 100, 100, 0, 100];
const slot = (x: number, y: number, width: number, height: number, corners: number[], entryX: number, entryScale: number): Slot =>
  ({ x, y, width, height, corners, entryX, entryScale, opacity: 1 });
const fan = [
  slot(-1.875, 51.65, 8.103, 22.59, left, 170, .45),
  slot(8.658, 46.87, 11.535, 32.15, left, 100, .48),
  slot(22.624, 42.16, 14.865, 41.57, left, 36, .55),
  slot(39.919, 41.444, 20.097, 43, rectangle, 0, .3),
  slot(62.446, 42.16, 14.865, 41.57, right, -36, .55),
  slot(79.741, 46.87, 11.535, 32.15, right, -100, .48),
  slot(93.707, 51.65, 8.103, 22.59, right, -170, .45),
];
const brand = [
  slot(-5.606, 48.107, 12.727, 39.83, rectangle, 170, .45),
  slot(7.121, 51.621, 12.727, 32.801, rectangle, 135, .47),
  slot(19.848, 53.462, 12.727, 29.119, rectangle, 95, .5),
  slot(32.575, 56.977, 12.727, 22.09, rectangle, 48, .55),
  slot(45.302, 59.989, 8.284, 16.066, rectangle, 0, .3),
  slot(53.587, 56.977, 12.727, 22.09, rectangle, -48, .55),
  slot(66.314, 53.462, 12.727, 29.119, rectangle, -95, .5),
  slot(79.041, 51.621, 12.727, 32.801, rectangle, -135, .47),
  slot(91.768, 48.107, 12.727, 39.83, rectangle, -170, .45),
];
export const FAN_STEP_MS = 850;
export const FAN_START_MS = 650;
export const FAN_INTRO_MS = 600;
export const fanBounds = (layout: FanLayout) => layout === "fan" ? { min: -1, max: 7 } : { min: -2, max: 8 };

export function sampleFan(position: number, layout: FanLayout): Slot {
  const visible = layout === "fan" ? fan : brand;
  const first = visible[0], last = visible[visible.length - 1];
  // Hidden endpoints extend horizontally. They must never pull an exiting
  // panel up/down or resize it before it disappears.
  const slots = [{ ...first, x: first.x - first.width - 3, opacity: 0 }, ...visible,
    { ...last, x: last.x + last.width + 3, opacity: 0 }];
  const { min } = fanBounds(layout);
  const cursor = Math.max(0, Math.min(slots.length - 1, position - min));
  const index = Math.floor(cursor), from = slots[index], to = slots[Math.min(index + 1, slots.length - 1)];
  const t = cursor - index;
  const mix = (a: number, b: number) => a + (b - a) * t;
  return { x: mix(from.x, to.x), y: mix(from.y, to.y), width: mix(from.width, to.width), height: mix(from.height, to.height),
    corners: from.corners.map((value, i) => mix(value, to.corners[i])), entryX: mix(from.entryX, to.entryX),
    entryScale: mix(from.entryScale, to.entryScale), opacity: index === 0 ? Math.min(1, t * FAN_STEP_MS / 300) : index === slots.length - 2 ? Math.min(1, (1 - t) * FAN_STEP_MS / 300) : mix(from.opacity, to.opacity) };
}

// Invert the original cubic-bezier(.16,1,.3,1) entrance timing curve.
export function fanEntrance(progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  let low = 0, high = 1;
  for (let i = 0; i < 16; i++) {
    const u = (low + high) / 2;
    const x = 3 * (1 - u) ** 2 * u * .16 + 3 * (1 - u) * u * u * .3 + u ** 3;
    if (x < t) low = u; else high = u;
  }
  return 1 - (1 - (low + high) / 2) ** 3;
}
