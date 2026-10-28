# Three.js integration boundary

Three.js and React Three Fiber are installed. No scene is mounted before design approval.

Implement each scene behind a small `use client` wrapper with `next/dynamic` and `ssr: false` inside that wrapper. Keep the enclosing page and editorial content as Server Components. Do not import scene modules from the root layout.

Render a server-visible, dimensioned image poster outside the canvas. Load the scene near the viewport or after interaction; preserve the poster for no JavaScript, reduced motion, unavailable WebGL, and scene errors. Text, links and actions must remain semantic HTML. Avoid duplicate accessible descriptions for decorative canvas. Cap DPR, pause offscreen rendering, dispose resources, compress models/textures, and profile mobile before release. Continuous rendering needs a design reason; prefer on-demand rendering for static scenes.
