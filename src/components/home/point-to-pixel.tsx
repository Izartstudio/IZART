export function PointToPixel() {
  return <section className="point-to-pixel" aria-labelledby="point-to-pixel-title">
    <h2 id="point-to-pixel-title" className="sr-only">From point to pixel</h2>
    <div className="point-to-pixel__item">
      <BridgePhrase leading="From" selected="Point" leadingAt={0.08} selectedAt={0.2} borderAt={0.32} />
    </div>
    <div className="point-to-pixel__line-wrapper" data-bridge-step data-bridge-at="0.44" aria-hidden="true">
      <span className="point-to-pixel__line" />
    </div>
    <div className="point-to-pixel__item">
      <BridgePhrase leading="To" selected="Pixel" leadingAt={0.58} selectedAt={0.7} borderAt={0.82} pixel />
    </div>
  </section>;
}

function BridgePhrase({ leading, selected, leadingAt, selectedAt, borderAt, pixel = false }: { leading: string; selected: string; leadingAt: number; selectedAt: number; borderAt: number; pixel?: boolean }) {
  return <p className="point-to-pixel__phrase" aria-hidden="true">
    <span className="point-to-pixel__word" data-bridge-step data-bridge-at={leadingAt}>{leading}</span>{" "}
    <span className={`point-to-pixel__selection${pixel ? " is-pixel" : ""}`} data-bridge-step data-bridge-at={borderAt}>
      <span className="point-to-pixel__word" data-bridge-step data-bridge-at={selectedAt}>{selected}</span>
      <i className="selection-border selection-border--top" /><i className="selection-border selection-border--right" /><i className="selection-border selection-border--bottom" /><i className="selection-border selection-border--left" />
      <i className="corner corner--tl" /><i className="corner corner--tr" /><i className="corner corner--bl" /><i className="corner corner--br" />
    </span>
  </p>;
}
