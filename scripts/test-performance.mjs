import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const origin = process.env.PERF_BASE_URL || 'http://127.0.0.1:3100';
const pages = (process.env.PERF_PATHS || '/,/blogs,/brand-identity,/blogs/best-branding-for-startups-differentiation-vs-distinction').split(',');
const runs = Number(process.env.PERF_RUNS || 3);
if (!Number.isInteger(runs) || runs < 1) throw new Error('PERF_RUNS must be a positive integer');
const out = path.resolve(process.env.PERF_OUTPUT || 'docs/seo-audit/performance');
await fs.mkdir(out, { recursive: true });
const results = [];
let failed = false;
for (const pathname of pages) {
  const url = new URL(pathname, origin).href;
  const timings = [];
  for (let i = 0; i < runs; i++) {
    const probe = spawnSync('curl', ['-sS', '-L', '--max-time', '45', '-o', '/dev/null', '-w', '%{json}', url], { encoding: 'utf8' });
    if (probe.status !== 0) throw new Error(`TTFB probe failed: ${probe.stderr}`);
    const sample = JSON.parse(probe.stdout);
    if (sample.http_code !== 200) throw new Error(`${url}: HTTP ${sample.http_code}`);
    timings.push({ ttfbMs: sample.time_starttransfer * 1000, totalMs: sample.time_total * 1000, dnsMs: sample.time_namelookup * 1000, tlsMs: sample.time_appconnect * 1000, redirects: sample.num_redirects });
  }
  const sorted = timings.map(t => t.ttfbMs).sort((a, b) => a - b);
  const ttfbP75Ms = sorted[Math.ceil(sorted.length * .75) - 1];
  const row = { url, ttfbP75Ms, samples: timings, lab: [] };
  if (process.env.PERF_TTFB_ONLY !== 'true') {
    for (let i = 0; i < runs; i++) {
      const chrome = await launch({ chromePath: process.env.CHROME_PATH, chromeFlags: ['--headless=new', '--disable-gpu'] });
      try {
        const result = await lighthouse(url, { port: chrome.port, output: ['json', 'html'], logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], formFactor: 'mobile', throttlingMethod: 'simulate' });
        if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message || 'Lighthouse produced no result');
        const a = result.lhr.audits;
        const metrics = { fcpMs: a['first-contentful-paint'].numericValue, lcpMs: a['largest-contentful-paint'].numericValue, cls: a['cumulative-layout-shift'].numericValue, tbtMs: a['total-blocking-time'].numericValue, performance: result.lhr.categories.performance.score, seo: result.lhr.categories.seo.score, accessibility: result.lhr.categories.accessibility.score };
        row.lab.push(metrics);
        const stem = (pathname.replace(/[^a-z0-9]/gi, '_') || 'home') + `-${i + 1}`;
        await fs.writeFile(path.join(out, `${stem}.json`), result.report[0]);
        await fs.writeFile(path.join(out, `${stem}.html`), result.report[1]);
      } finally { await chrome.kill(); }
    }
    const median = key => row.lab.map(r => r[key]).sort((a, b) => a - b)[Math.floor(row.lab.length / 2)];
    row.median = { fcpMs: median('fcpMs'), lcpMs: median('lcpMs'), cls: median('cls'), tbtMs: median('tbtMs') };
    row.passed = ttfbP75Ms <= 800 && row.median.fcpMs <= 1800 && row.median.lcpMs <= 2500 && row.median.cls <= .1 && row.median.tbtMs <= 200;
  } else { row.passed = ttfbP75Ms <= 800; }
  if (!row.passed) failed = true;
  results.push(row);
  console.log(JSON.stringify({ url, ttfbP75Ms, ...row.median, passed: row.passed }));
}
await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify({ measuredAt: new Date().toISOString(), origin, runs, method: 'curl fresh connections; Lighthouse simulated mobile lab, no field INP', results }, null, 2));
if (failed) process.exitCode = 1;
