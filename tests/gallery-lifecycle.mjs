import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

const dom = new JSDOM('<div id="root"></div>');
Object.assign(global, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true,
  innerWidth: 1280, innerHeight: 720, getComputedStyle: () => ({ top: '119px' }),
  matchMedia: () => ({ matches: false }) });
window.scrollY = 0;
const frames = new Map();
let nextFrame = 0, time = 0, creates = 0, disposes = 0;
global.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame; };
global.cancelAnimationFrame = id => frames.delete(id);
const renders = [];
const source = fs.readFileSync('src/components/projects/gallery/use-project-gallery.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const exportsObject = {};
new Function('require', 'exports', compiled)(name => {
  if (name === 'react') return React;
  if (name === '../paper-renderer') return { createPaperRenderer: () => {
    creates++;
    return { resize() {}, render(progress) { renders.push(progress); return true; }, dispose() { disposes++; } };
  } };
  if (name === './constants') return { DESKTOP_CARD_STEP: .78, MOBILE_CARD_STEP: .70, DESKTOP_EXIT_RUNWAY: .20, MOBILE_EXIT_RUNWAY: .16, MOBILE_QUERY: '(max-width: 767px)' };
  throw new Error(name);
}, exportsObject);
const projects = [0, 1, 2].map(index => ({ listingImage: { url: `${index}.png` }, background: '#132316' }));
const colors = { current: projects.map(project => project.background) };
let controller;
function Harness({ enabled }) {
  controller = exportsObject.useProjectGallery(projects, enabled, colors);
  return React.createElement('section', { ref: controller.hostRef },
    React.createElement('div', { ref: node => {
      controller.galleryRef.current = node;
      if (node) Object.defineProperty(node, 'offsetHeight', { configurable: true, value: 589 });
    } }, React.createElement('canvas', { ref: controller.canvasRef })));
}
function flush(count = 1) {
  React.act(() => { for (let index = 0; index < count; index++) {
    time += 16;
    const callbacks = [...frames.values()]; frames.clear();
    callbacks.forEach(callback => callback(time));
  } });
}
const root = createRoot(document.getElementById('root'));
const mount = enabled => React.act(() => root.render(React.createElement(React.StrictMode, null, React.createElement(Harness, { enabled }))));
mount(true); flush(3);
assert.equal(creates, 2, 'Strict Mode replay creates a fresh renderer');
assert.equal(disposes, 1);
assert.ok(renders.length > 0, 'render loop restarts after Strict Mode cleanup');
React.act(() => { window.scrollY = 589 * .78 * 1.25; window.dispatchEvent(new window.Event('scroll')); });
flush(60);
assert.ok(renders.some(value => value > 0 && value < 1), 'renderer receives fractional progress');
assert.equal(renders.at(-1), 1.25);
assert.equal(controller.active, 1);
mount(false); const stoppedAt = renders.length; flush(5);
assert.equal(renders.length, stoppedAt, 'grid mode stops rendering');
mount(true); flush(5);
assert.equal(creates, 2, 'view switching reuses renderer');
assert.ok(renders.length > stoppedAt, 'gallery resumes');
React.act(() => { window.scrollY = 0; window.dispatchEvent(new window.Event('scroll')); });
flush(60); assert.equal(renders.at(-1), 0);
React.act(() => root.unmount());
assert.equal(frames.size, 0, 'unmount cancels pending work');
console.log('PASS: Strict Mode restart, continuous forward/reverse progress, grid pause/resume, resource cleanup');
