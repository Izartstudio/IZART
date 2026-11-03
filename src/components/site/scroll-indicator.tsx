/** Shared decorative scroll cue used by the hero and service showcases. */
export function ScrollIndicator() {
  return <span className="home-hero__scroll" aria-hidden="true">
    <i />
    <svg viewBox="0 0 22 40" fill="none">
      <path d="m14.091 30.534-3.29 3.3-3.301-3.3.474-.464 2.5 2.499v-6.064h.664v6.064l2.5-2.489.453.454Z" fill="currentColor" />
    </svg>
  </span>;
}
