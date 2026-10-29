import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
function compile(path, imports = {}) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } }).outputText;
  new Function('require','exports','React',js)(name => name === 'react' ? React : imports[name], exports, React);
  return exports;
}
const data = compile('src/components/services/service-showcase-data.ts');
const { serviceScrollState, showcaseServices } = data;
assert.equal(serviceScrollState(-100,1000,5).active,0);
assert.equal(serviceScrollState(10000,1000,5).active,4);
assert.equal(serviceScrollState(1000,1000,5).progress,1);
assert.equal(serviceScrollState(0,0,5).progress,0);
for (let i=0;i<5;i++) assert.equal(serviceScrollState((i+.5)*200,1000,5).active,i);
const dom = new JSDOM('<div id="root"></div>');
Object.assign(global,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
let top=100, height=5000, resize, next=0;
const frames=new Map();
window.requestAnimationFrame=cb=>{frames.set(++next,cb);return next;};
window.cancelAnimationFrame=id=>frames.delete(id);
window.HTMLElement.prototype.getBoundingClientRect=()=>({top});
Object.defineProperty(window.HTMLElement.prototype,'offsetHeight',{get(){return this.tagName==='SECTION'?height:this.tagName==='HEADER'?155:1000;}});
let observed=0;
global.ResizeObserver=class {constructor(cb){resize=cb;}observe(){observed++;}disconnect(){observed-=4;}};
const styles=new Proxy({}, {get:(_,key)=>String(key)});
const {ServicesShowcase}=compile('src/components/services/services-showcase.client.tsx',{
 './service-showcase-data':data,
 './services-showcase.module.css':{__esModule:true,default:styles},
 'next/image':{__esModule:true,default:()=>null},
 'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},
});
const root=createRoot(document.getElementById('root'));
React.act(()=>root.render(React.createElement(React.StrictMode,null,React.createElement(ServicesShowcase))));
const flush=()=>React.act(()=>{const pending=[...frames.values()];frames.clear();pending.forEach(cb=>cb());});
flush();assert.equal(observed,4);
// A preserved page may still carry the previous horizontal renderer's transform.
document.querySelector('.fill').style.transform='scaleX(0)';
window.dispatchEvent(new window.Event('scroll'));flush();
assert.equal(document.querySelector('.fill').style.transform,'','CSS must own the timeline axis');
function verify(index){const copy=document.querySelector('.copy[data-active="true"]');assert.match(copy.querySelector('h3').textContent,new RegExp(showcaseServices[index].title));assert.equal(copy.querySelector('a').getAttribute('href'),showcaseServices[index].href);assert.equal(document.querySelectorAll('.copy[data-active="true"]').length,1);assert.equal(document.querySelectorAll('nav[aria-label="Choose a service"]').length,0);assert.equal(document.querySelectorAll('.copy:not([data-active="true"])[inert]').length,4);}

let seed=42;
for(let i=0;i<2000;i++){
 seed=(seed*1664525+1013904223)>>>0;
 const index=seed%5;
 top=-155-(index+.5)*(height-1155)/5;
 for(let j=0;j<10;j++)window.dispatchEvent(new window.Event('scroll'));
 assert.equal(frames.size,1,'scroll bursts schedule one measurement');
 flush();verify(index);assert.equal(frames.size,0,'no permanent animation loop');
}
height=7000;top=-3077.5;resize();flush();verify(2);
top=-7000;window.dispatchEvent(new window.Event('pageshow'));flush();verify(4);
assert.equal(document.querySelector('.fill').style.getPropertyValue('--services-progress'),'1');
top=100;document.dispatchEvent(new window.Event('visibilitychange'));flush();verify(0);
assert.equal(document.querySelector('.fill').style.getPropertyValue('--services-progress'),'0');
window.dispatchEvent(new window.Event('scroll'));
React.act(()=>root.unmount());assert.equal(frames.size,0);assert.equal(observed,0);
console.log('PASS: five states, CTA mapping, 2,000 scroll reversals, burst coalescing, resize, page restoration, endpoints, Strict Mode and cleanup');
