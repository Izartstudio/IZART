export function ArtworkStrip({ edge = "top" }: { edge?: "top" | "bottom" }) {
  return edge === "top" ? (
    <div className="artwork-strip artwork-strip--top" aria-hidden="true">
      <span className="artwork-strip__mark" />
      <span className="artwork-strip__year">2026</span>
    </div>
  ) : (
    <div className="artwork-strip artwork-strip--bottom" aria-hidden="true">
      <span>I</span><span>Z</span><span>R</span>
    </div>
  );
}
