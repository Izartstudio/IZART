// Run against a production server. Save frames and raw timing samples outside the checkout.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { launch } from "chrome-launcher";
import puppeteer from "puppeteer-core";

const origin = process.env.PERF_BASE_URL || "http://127.0.0.1:3100";
const output = process.env.SHOWREEL_REPORT || "/tmp/izart-showreel";
await mkdir(output, { recursive: true });
const chrome = await launch({ chromeFlags: ["--headless=new"] });
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on("request", request => {
    if (request.url().startsWith("https://player.vimeo.com/video/")) {
      void request.respond({ contentType: "text/html", body: '<body style="margin:0;background:repeating-linear-gradient(45deg,#242824 0px 20px,#596859 20px 40px);height:100vh"></body>' });
    } else void request.continue();
  });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector(".showreel-layer")?.style.getPropertyValue("--showreel-width"));
  const cdp = await page.createCDPSession();
  await cdp.send("Performance.enable");
  const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(({ name, value }) => [name, value]));
  const geometry = async () => page.evaluate(() => {
    const layer = document.querySelector(".showreel-layer");
    return ["x", "y", "width", "height"].map(key => Number.parseFloat(layer.style.getPropertyValue(`--showreel-${key}`)));
  });
  const results = [];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 430, height: 740 }, { width: 1024, height: 560 }]) {
    await page.setViewport(viewport);
    const destination = await page.$eval(".video-expansion", element => element.getBoundingClientRect().top + scrollY);
    const offset = viewport.height * .55;
    const place = progress => page.evaluate(async top => {
      scrollTo({ top, behavior: "instant" });
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, destination - offset * (1 - progress));
    await place(0);
    const before = await metrics();
    const samples = [];
    for (const progress of [...Array.from({ length: 25 }, (_, i) => i / 24), ...Array.from({ length: 25 }, (_, i) => 1 - i / 24)]) {
      await place(progress);
      samples.push(await geometry());
    }
    const after = await metrics();
    for (let i = 0; i < 25; i++) {
      assert.ok(samples[i].every((value, axis) => Math.abs(value - samples[49 - i][axis]) < 1.5), "Forward and reverse geometry differ");
    }
    assert.ok(Math.abs(samples[24][2] - viewport.width) <= 1);
    assert.ok(Math.abs(samples[24][3] - viewport.height) <= 1);
    for (const progress of [0, .5, 1]) {
      await place(progress);
      await page.screenshot({ path: `${output}/${viewport.width}-${progress}.png` });
    }
    results.push({ viewport, samples, layoutCount: after.LayoutCount - before.LayoutCount, layoutMs: (after.LayoutDuration - before.LayoutDuration) * 1000 });
  }
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluate(() => scrollTo(0, 0));
  assert.equal(await page.$(".hero-explore"), null);
  await page.mouse.wheel({ deltaY: 950 });
  await page.waitForFunction(() => {
    const showcase = document.querySelector(".home .showcase");
    return scrollY > 0 && showcase.getBoundingClientRect().top <= 0;
  });
  await page.goto(new URL("/industries", origin).href, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".showcase--industries");
  const showcase = await page.$eval(".showcase--industries", element => ({ cards: element.querySelectorAll(".showcase-card").length, ticks: element.querySelectorAll(".showcase-progress__navigation button").length }));
  assert.equal(showcase.cards, showcase.ticks);
  assert.ok(showcase.cards > 1);
  await page.$eval(".showcase--industries .showcase-progress__navigation button:last-child", button => button.click());
  await page.waitForFunction(() => {
    const marker = document.querySelector(".showcase--industries .showcase-progress__marker");
    return Number.parseFloat(marker.style.left.replace("calc(", "")) > 99;
  });
  assert.deepEqual(errors, []);
  const report = { browser: await browser.version(), results, showcase, errors };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, results: results.map(({ viewport, layoutCount, layoutMs }) => ({ viewport, layoutCount, layoutMs })) }, null, 2));
} finally {
  browser.disconnect();
  await chrome.kill();
}
