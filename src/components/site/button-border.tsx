/** A normalized path keeps the border sweep consistent at every button size. */
export function ButtonBorder() {
  return <svg className="button-border" width="100%" height="100%" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" pathLength="100" />
  </svg>;
}
