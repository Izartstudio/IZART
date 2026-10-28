import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

const dom = new JSDOM('<div id="root"></div>');
Object.assign(global, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
const frames = new Map();
let frameId = 0;
global.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
global.cancelAnimationFrame = id => frames.delete(id);
let resize;
let disconnected = false;
global.ResizeObserver = class {
  constructor(callback) { resize = callback; }
  observe() {}
  disconnect() { disconnected = true; }
};
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
window.innerWidth = 1000;
window.scrollY = 0;
let centers = [500, 900, 1500];
const proto = window.HTMLElement.prototype;
Object.defineProperty(proto, 'scrollWidth', { get() { return this.className === 'showcase__track' ? 3000 : 0; } });
proto.getBoundingClientRect = function () {
  const index = this.dataset.project;
  return { left: index === undefined ? 0 : centers[Number(index)] - 100, width: 200, top: -window.scrollY };
};
const source = fs.readFileSync('src/components/home/showcase-motion.client.tsx', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } }).outputText;
const exported = {};
new Function('require', 'exports', 'React', compiled)(name => {
  if (name === 'react') return React;
  throw new Error(name);
}, exported, React);
const root = createRoot(document.getElementById('root'));
function mount(count) {
  React.act(() => root.render(React.createElement(React.StrictMode, null,
    React.createElement(exported.ShowcaseMotion, { projectCount: count },
      React.createElement('ol', { className: 'showcase__list' },
        Array.from({ length: count }, (_, index) => React.createElement('li', { key: index },
          React.createElement('a', { className: 'showcase-card', 'data-project': index }))))))));
}
function flush() {
  React.act(() => { for (let i = 0; i < 100; i++) {
    const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback());
  } });
}
function scroll(offset) {
  window.scrollY = offset;
  window.dispatchEvent(new window.Event('scroll'));
  flush();
}
const marker = () => document.querySelector('.showcase-progress__marker').style.left;
mount(3); flush();
assert.equal(document.querySelectorAll('.is-major').length, 3);
assert.equal(marker(), '0%');
scroll(400); assert.equal(marker(), '50%', 'second card center maps to second tick');
scroll(700); assert.equal(marker(), '75%', 'interpolates across unequal card spacing');
scroll(1000); assert.equal(marker(), '100%');
scroll(1800); assert.equal(marker(), '100%', 'outro does not advance project progress');
scroll(200); assert.equal(marker(), '25%', 'reverse scrolling tracks rendered cards');
centers = [500, 1100, 1700]; resize(); flush();
scroll(600); assert.equal(marker(), '50%', 'layout changes recalculate card centers');
mount(1); flush();
assert.equal(document.querySelectorAll('.is-major').length, 1);
assert.equal(marker(), '50%', 'single project remains centered');
React.act(() => root.unmount());
assert.equal(frames.size, 0);
assert.ok(disconnected);
console.log('PASS: project count, card centers, unequal spacing, reverse scroll, outro, resize, single project, Strict Mode and cleanup');
