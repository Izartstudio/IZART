import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

const dom = new JSDOM('<div id="root"></div>');
Object.assign(global, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
let top = 100, time = 0, nextId = 0, motionChange, resize;
let reduced = false;
const frames = new Map();
window.requestAnimationFrame = callback => { frames.set(++nextId, callback); return nextId; };
window.cancelAnimationFrame = id => frames.delete(id);
window.matchMedia = () => ({ get matches() { return reduced; },
  addEventListener(_, callback) { motionChange = callback; }, removeEventListener() {} });
let observers = 0;
global.ResizeObserver = class {
  constructor(callback) { resize = callback; }
  observe() { observers++; }
  disconnect() { observers--; }
};
window.HTMLElement.prototype.getBoundingClientRect = () => ({ top });
const source = fs.readFileSync('src/components/home/about-stats.client.tsx', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } }).outputText;
const exported = {};
new Function('require', 'exports', 'React', compiled)(name => {
  if (name === 'react') return React;
  return { AboutIntroduction: () => null, ClientLogoStrip: () => null, StatsGrid: () => null };
}, exported, React);
const root = createRoot(document.getElementById('root'));
const mount = () => React.act(() => root.render(React.createElement(React.StrictMode, null, React.createElement(exported.AboutStats, null, React.createElement('section', { className: 'video-expansion' })))));
const value = () => Number(document.querySelector('.about-theme').style.getPropertyValue('--about-theme-progress'));
function tick(dt = 16) {
  time += dt;
  const callbacks = [...frames.values()]; frames.clear();
  callbacks.forEach(callback => callback(time));
  assert.ok(frames.size <= 1, 'only one animation frame may be pending');
  assert.ok(Number.isFinite(value()) && value() >= 0 && value() <= 1, 'progress stays finite and bounded');
}
function scroll(nextTop) {
  top = nextTop;
  for (let i = 0; i < 50; i++) window.dispatchEvent(new window.Event('scroll'));
  assert.ok(frames.size <= 1, 'scroll bursts coalesce');
}
function settle(target, dt = 16) {
  for (let i = 0; i < 400 && frames.size; i++) tick(dt);
  assert.equal(value(), target);
  assert.equal(frames.size, 0, 'animation sleeps when settled');
}
mount(); assert.ok(document.querySelector('.about-theme > .about-stats + .video-expansion'), 'About and showreel share the animated surface'); assert.equal(value(), 0); assert.equal(observers, 1);
scroll(-1); tick(); tick(); assert.ok(value() > 0 && value() < 1);
// Oscillation around top/top must not repeatedly reverse the transition.
for (let i = 0; i < 200; i++) { scroll(i % 2 ? 2 : -2); tick(); }
settle(1);
scroll(47); settle(1);
scroll(49); settle(0);
// Deterministic rapid reversals at mixed frame rates, including long stalls.
let seed = 12345;
for (let i = 0; i < 3000; i++) {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  scroll(seed % 3 === 0 ? 80 : -20);
  const before = value();
  tick([7, 16, 33, 120][seed % 4]);
  assert.ok(Math.abs(value() - before) < .25, 'no abrupt flashes after stalls or reversals');
}
scroll(-100); settle(1, 7);
scroll(100); settle(0, 33);
// Layout shifts and history restoration also refresh the target.
top = -100; resize(); settle(1);
top = 100; window.dispatchEvent(new window.Event('pageshow')); settle(0);
reduced = true; motionChange(); scroll(-10); tick(); assert.equal(value(), 1);
scroll(100); tick(); assert.equal(value(), 0);
reduced = false; motionChange(); scroll(-10); tick(); tick();
React.act(() => root.unmount());
assert.equal(frames.size, 0); assert.equal(observers, 0);
window.dispatchEvent(new window.Event('scroll'));
assert.equal(frames.size, 0, 'unmount removes listeners');
console.log('PASS: 3,000 reversals, threshold chatter, burst coalescing, mixed frame rates, stalls, layout shifts, history restore, reduced motion, Strict Mode and cleanup');
