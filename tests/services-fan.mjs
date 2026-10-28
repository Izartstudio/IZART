import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
function compile(path, imports = {}) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } }).outputText;
  new Function('require', 'exports', 'React', js)(name => {
    if (name in imports) return imports[name];
    if (name === 'react') return React;
    throw new Error(name);
  }, exports, React);
  return exports;
}
const geometry = compile('src/components/services/fan-motion.ts');
for (const layout of ['fan', 'brand-identity']) {
  const { min, max } = geometry.fanBounds(layout);
  for (const [edge, neighbor] of [[min, min + 1], [max, max - 1]]) {
    const a = geometry.sampleFan(edge, layout), b = geometry.sampleFan(neighbor, layout);
    for (const property of ['y', 'height', 'width']) assert.equal(a[property], b[property], `${layout} edge ${property} stays fixed`);
  }
  for (let p = min; p < max; p += .013) {
    const slot = geometry.sampleFan(p, layout);
    assert.ok(slot.width > 0 && slot.height > 0 && slot.opacity >= 0 && slot.opacity <= 1);
    assert.ok(slot.corners.every(Number.isFinite));
  }
}
const dom = new JSDOM('<div id="root"></div>');
Object.assign(global, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
let hidden = false, reduced = false, motionChanged, intersection;
Object.defineProperty(document, 'hidden', { get: () => hidden });
window.matchMedia = () => ({ get matches() { return reduced; }, addEventListener(_, cb) { motionChanged = cb; }, removeEventListener() {} });
let observers = 0;
global.IntersectionObserver = class {
  constructor(cb) { intersection = cb; }
  observe() { observers++; }
  disconnect() { observers--; }
};
const frames = new Map();
let nextId = 0, time = 0;
window.requestAnimationFrame = cb => { frames.set(++nextId, cb); return nextId; };
window.cancelAnimationFrame = id => frames.delete(id);
const { PerspectiveImageFan } = compile('src/components/services/perspective-image-fan.tsx', {
  './fan-motion': geometry,
  'next/image': { __esModule: true, default: ({ src, alt }) => React.createElement('img', { src, alt }) },
});
const root = createRoot(document.getElementById('root'));
const images = Array.from({ length: 7 }, (_, i) => ({ url: `${i}.png`, alt: '' }));
const mount = (layout, source = images) => React.act(() => root.render(React.createElement(React.StrictMode, null, React.createElement(PerspectiveImageFan, { images: source, layout }))));
const composition = () => [...document.querySelectorAll('.services-fan__slot')].filter(n => n.style.visibility === 'visible').map(n => n.querySelector('img').getAttribute('src') + ':' + n.style.cssText.replace(/-?\d+\.\d+/g, value => Number(value).toFixed(5))).sort();
const snapshot = () => [...document.querySelectorAll('.services-fan__slot')].map(n => n.getAttribute('style')).join('|');
function tick(dt = 16) {
  time += dt;
  const pending = [...frames.values()]; frames.clear(); pending.forEach(cb => cb(time));
  assert.ok(frames.size <= 1, 'one clock only');
}
for (const layout of ['fan', 'brand-identity']) {
  mount(layout); assert.equal(observers, 1); tick();
  for (let i = 0; i < 100; i++) tick();
  for (let cycle = 0; cycle < 100; cycle++) {
    const before = snapshot();
    hidden = true; document.dispatchEvent(new window.Event('visibilitychange'));
    assert.equal(frames.size, 0);
    tick(60000); assert.equal(snapshot(), before, 'background time does not move cards');
    hidden = false; document.dispatchEvent(new window.Event('visibilitychange')); tick();
    assert.equal(snapshot(), before, 'resume has no catch-up jump');
    window.dispatchEvent(new window.Event('blur')); assert.equal(frames.size, 0);
    tick(10000); window.dispatchEvent(new window.Event('focus')); tick();
    assert.equal(snapshot(), before, 'window switching preserves phase');
    intersection([{ isIntersecting: false }]); assert.equal(frames.size, 0);
    tick(10000); intersection([{ isIntersecting: true }]); tick();
    assert.equal(snapshot(), before, 'offscreen resume preserves phase');
    for (let i = 0; i < 30; i++) tick([8, 16, 33][i % 3]);
  }
  const beforeLoop = composition();
  for (let i = 0; i < 595; i++) tick(10);
  assert.deepEqual(composition(), beforeLoop, 'full cycle preserves source order and geometry without a reset flash');
  const beforeRestore = snapshot();
  window.dispatchEvent(new window.Event('pageshow')); tick();
  assert.equal(snapshot(), beforeRestore, 'page restoration preserves phase');
  reduced = true; motionChanged(); assert.equal(frames.size, 0);
  reduced = false; motionChanged(); tick(); assert.equal(frames.size, 1);
}
mount('fan', []); assert.equal(document.querySelectorAll('.services-fan__slot').length, 0);
mount('brand-identity', images.slice(0, 1)); tick();
for (let i = 0; i < 1000; i++) tick();
assert.ok([...document.querySelectorAll('.services-fan__slot')].filter(n => n.style.visibility === 'visible').length >= 9, 'short source lists still populate every slot');
React.act(() => root.unmount()); assert.equal(frames.size, 0); assert.equal(observers, 0);
console.log('PASS: both layouts, fixed edge geometry, 200 hide/window/offscreen cycles, no catch-up, reduced motion, Strict Mode, empty/single sources and cleanup');
