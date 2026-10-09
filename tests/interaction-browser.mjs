// Local headless CSS verification. Run: node tests/interaction-browser.mjs
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { root, loadSource } from "./helpers/load-ts.mjs";

const browser = process.env.TEXT_EFFECT_TEST_BROWSER || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find(existsSync);
assert.ok(browser, "Set TEXT_EFFECT_TEST_BROWSER to a Chromium browser executable");
const temp = mkdtempSync(path.join(tmpdir(), "zichang-interaction-"));
const codePath = path.join(root, "lib/interaction-effect-code.ts");
const { getInteractionEffectCode } = loadSource(readFileSync(codePath, "utf8"), codePath);
const magnet = getInteractionEffectCode("magnet", "中👨‍👩‍👧‍👦é ABC", { restSpacing: .16, activeSpacing: -.08, lift: 8, duration: .2, delay: 0, trigger: "hover" }, 42).html;
const glitch = getInteractionEffectCode("glitch", "信号 SIGNAL", { offset: 6, jitter: 3, skew: 4, duration: .6, delay: 0, trigger: "hover" }, 42).html;
const file = path.join(temp, "fixture.html");
writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><style>body{background:#10110f;color:#fff;padding:60px;font-family:Arial,sans-serif}section{margin:40px 0}</style></head><body><section>${magnet}</section><section>${glitch}</section><pre id="result">pending</pre><script>
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const finishTransitions = element => element.getAnimations({ subtree: true }).filter(animation => animation.effect.getTiming().iterations !== Infinity).forEach(animation => animation.finish());
(async () => {
  const magnet = document.querySelector('.zc-magnet-text');
  const glyph = magnet.querySelector('.zc-magnet-character');
  const glitch = document.querySelector('.zc-glitch-text');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const before = { width: magnet.getBoundingClientRect().width, x: glyph.getBoundingClientRect().x };
  magnet.focus();
  await pause(400);
  finishTransitions(magnet);
  const focused = { width: magnet.getBoundingClientRect().width, x: glyph.getBoundingClientRect().x, focusVisible: magnet.matches(':focus-visible') };
  magnet.blur();
  magnet.setAttribute('data-active', 'true');
  await pause(400);
  finishTransitions(magnet);
  const active = { width: magnet.getBoundingClientRect().width, x: glyph.getBoundingClientRect().x };
  magnet.classList.add('is-paused');
  await pause(100);
  const paused = { width: magnet.getBoundingClientRect().width, x: glyph.getBoundingClientRect().x };
  glitch.focus();
  await pause(100);
  const signal = { focusVisible: glitch.matches(':focus-visible'), animation: getComputedStyle(glitch).animationName, shadow: getComputedStyle(glitch).textShadow };
  glitch.classList.add('is-paused');
  const signalPaused = { animation: getComputedStyle(glitch).animationName, shadow: getComputedStyle(glitch).textShadow };
  document.querySelector('#result').textContent = JSON.stringify({ reduced, before, focused, active, paused, signal, signalPaused });
})();
</script></body></html>`, "utf8");

for (const reduced of [false, true]) {
  const args = ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking", `--user-data-dir=${path.join(temp, reduced ? "reduced-profile" : "profile")}`, "--virtual-time-budget=3000", "--dump-dom"];
  if (reduced) args.push("--force-prefers-reduced-motion");
  args.push(pathToFileURL(file).href);
  const result = spawnSync(browser, args, { encoding: "utf8", windowsHide: true, timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.error?.message || result.stderr.slice(-1000));
  const match = result.stdout.match(/<pre id="result">([^<]+)<\/pre>/);
  assert.ok(match, "Browser did not return measurements");
  const measurements = JSON.parse(match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  const detail = JSON.stringify(measurements);
  assert.equal(measurements.reduced, reduced);
  for (const state of [measurements.focused, measurements.active, measurements.paused]) assert.ok(Math.abs(state.width - measurements.before.width) < .01, "Magnet interaction changed layout width");
  assert.equal(measurements.focused.focusVisible, true);
  assert.equal(measurements.signal.focusVisible, true);
  if (reduced) {
    assert.ok(Math.abs(measurements.active.x - measurements.before.x) < .01);
    assert.equal(measurements.signal.animation, "none");
  } else {
    assert.ok(Math.abs(measurements.focused.x - measurements.before.x) > 1, `Keyboard focus did not move characters: ${detail}`);
    assert.ok(Math.abs(measurements.active.x - measurements.before.x) > 1, `Locked preview did not move characters: ${detail}`);
    assert.equal(measurements.signal.animation, "zc-glitch-signal");
  }
  assert.ok(Math.abs(measurements.paused.x - measurements.before.x) < .01);
  assert.notEqual(measurements.signal.shadow, "none");
  assert.equal(measurements.signalPaused.animation, "none");
  assert.equal(measurements.signalPaused.shadow, "none");
  process.stdout.write(`CSS browser checks passed (reduced motion: ${reduced})\n`);
}
