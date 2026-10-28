// Stable world coordinates: no random values during rendering or recycling.
const anchors = [[-.12,-.34],[.16,.39],[-.35,.06],[.31,-.22],[-.08,.16],[.08,-.09],[-.24,.34],[.38,.17],[.22,-.4],[-.4,-.25]];
export const wrap = (value: number, length: number) => {
  const result = ((value % length) + length) % length;
  return result < 1e-10 || length - result < 1e-10 ? 0 : result;
};
export const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };

export function worldPosition(index: number, genre: number) {
  const anchor = anchors[(index + genre * 3) % anchors.length];
  const seed = ((index + 1) * 73 + genre * 137) % 101;
  return { x: anchor[0] + (seed / 100 - .5) * .055, y: anchor[1] + ((seed * 7 % 101) / 100 - .5) * .06 };
}

export function projectCard(position: number, birth: number, genreCount: number) {
  const age = wrap(position - birth, genreCount);
  const lifetime = Math.min(1.45, genreCount - .06);
  // Perspective projection for a camera retreating past successive card planes.
  // The near plane is clipped before recycling; the far plane fades to zero.
  const scale = 1 / (.24 + age * 4.4);
  const opacity = smooth(age / .045) * (1 - smooth((age - lifetime + .32) / .32));
  return { age, scale, opacity, blur: smooth((age - .15) / .62), visible: age < lifetime && opacity > .001 };
}
