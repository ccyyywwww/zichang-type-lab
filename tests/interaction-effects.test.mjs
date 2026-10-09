import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { root, loadSource } from "./helpers/load-ts.mjs";

const definitions = [["glitch", "GlitchText"], ["magnet", "MagnetText"]];
const codePath = path.join(root, "lib/interaction-effect-code.ts");
const { getInteractionEffectCode } = loadSource(readFileSync(codePath, "utf8"), codePath);
const text = '中文 English 123，✨ 👨‍👩‍👧‍👦 é <script> & " { }';
for (const [effect, name] of definitions) {
  const filename = path.join(root, `components/text-effects/${effect}-text/${name}.tsx`);
  const source = readFileSync(filename, "utf8");
  const loaded = loadSource(source, filename);
  const Component = loaded[name];
  const defaults = loaded[`${effect}TextDefaults`];
  test(`${name}: keyboard triggering, semantic element and static pause`, () => {
    assert.doesNotMatch(source, /@\/|app\/|globals\.css|setInterval|setTimeout/);
    const html = renderToStaticMarkup(createElement(Component, { as: "h2", className: "custom", paused: true, active: true }, text));
    assert.match(html, /^<h2/); assert.match(html, /custom/);
    assert.match(html, /tabindex="0"/); assert.match(html, /data-trigger="hover"/);
    assert.match(html, /data-active="true"/); assert.match(html, /is-paused/);
    assert.match(html, /&lt;script&gt;/);
    const always = renderToStaticMarkup(createElement(Component, { trigger: "always" }, text));
    assert.doesNotMatch(always, /tabindex/);
    const card = renderToStaticMarkup(createElement(Component, { tabIndex: -1 }, text));
    assert.match(card, /tabindex="-1"/);
  });
  test(`${name}: copied TSX, CSS and HTML use the same parameters`, () => {
    const options = { ...defaults, trigger: "always", duration: 2.4, delay: .7, paused: true, active: true };
    const codes = getInteractionEffectCode(effect, text, options, 42);
    const css = readFileSync(path.join(path.dirname(filename), `${effect}-text.css`), "utf8");
    assert.ok(codes.source.includes(source)); assert.ok(codes.source.includes(css)); assert.ok(codes.html.includes(css));
    assert.doesNotMatch(codes.react, /@\//);
    const Example = loadSource(codes.react, path.join(path.dirname(filename), "Example.tsx"));
    const html = renderToStaticMarkup(createElement(Example.default));
    for (const markup of [html, codes.html]) {
      assert.match(markup, /font-size:42px/); assert.match(markup, /data-trigger="always"/);
      assert.match(markup, /is-paused/); assert.match(markup, /data-active="true"/);
      assert.match(markup, /&lt;script&gt;/);
      assert.ok(markup.includes(`--zc-${effect}-duration:2.4s`));
      assert.ok(markup.includes(`--zc-${effect}-delay:0.7s`));
    }
    assert.match(css, /prefers-reduced-motion/); assert.match(css, /focus-visible/);
    assert.match(css, /:not\(\.is-paused\)/);
  });
}

test("magnet preserves graphemes and has one full readable text with hidden visual characters", () => {
  const filename = path.join(root, "components/text-effects/magnet-text/MagnetText.tsx");
  const { MagnetText, splitMagnetText, getMagnetTextStyle } = loadSource(readFileSync(filename, "utf8"), filename);
  const characters = splitMagnetText("中👨‍👩‍👧‍👦é 1");
  assert.deepEqual(characters, ["中", "👨‍👩‍👧‍👦", "é", " ", "1"]);
  const html = renderToStaticMarkup(createElement(MagnetText, null, "中👨‍👩‍👧‍👦é 1"));
  assert.match(html, /class="zc-magnet-readable">中👨‍👩‍👧‍👦é 1<\/span>/);
  assert.equal([...html.matchAll(/aria-hidden="true"/g)].length, 5);
  const rest = getMagnetTextStyle({ restSpacing: .16, activeSpacing: -.08 }, 5);
  const reversed = getMagnetTextStyle({ restSpacing: -.08, activeSpacing: .16 }, 5);
  assert.equal(rest["--zc-magnet-gap"], reversed["--zc-magnet-gap"]);
  assert.equal(rest["--zc-magnet-mid"], 2);
  const invalid = getMagnetTextStyle({ restSpacing: Infinity, activeSpacing: NaN, lift: 10000, duration: -1 }, 5);
  assert.equal(invalid["--zc-magnet-lift"], "16px"); assert.equal(invalid["--zc-magnet-duration"], "0.2s");
  assert.doesNotMatch(JSON.stringify(invalid), /NaN|Infinity/);
  assert.equal(renderToStaticMarkup(createElement(MagnetText, null, "")).match(/aria-hidden="true"/g), null);
});

test("glitch clamps displacement and timing without invalid CSS values", () => {
  const filename = path.join(root, "components/text-effects/glitch-text/GlitchText.tsx");
  const { getGlitchTextStyle } = loadSource(readFileSync(filename, "utf8"), filename);
  const style = getGlitchTextStyle({ offset: 100, jitter: -1, skew: NaN, duration: Infinity, delay: -2 });
  assert.equal(style["--zc-glitch-offset"], "16px"); assert.equal(style["--zc-glitch-jitter"], "0px");
  assert.equal(style["--zc-glitch-skew"], "3deg"); assert.equal(style["--zc-glitch-delay"], "0s");
  assert.doesNotMatch(JSON.stringify(style), /NaN|Infinity/);
});

test("interaction workbenches render dedicated controls, fixed preview and valid usage code", () => {
  const filename = path.join(root, "components/site/InteractionEffectWorkbench.tsx");
  const { InteractionEffectWorkbench } = loadSource(readFileSync(filename, "utf8"), filename);
  for (const [effect, name] of definitions) {
    const html = renderToStaticMarkup(createElement(InteractionEffectWorkbench, { effect, text, fontSize: 42, duration: 2.4, paused: true, onTextChange() {}, onFontSizeChange() {}, onDurationChange() {} }));
    assert.match(html, /workbench-stage/); assert.match(html, /font-size:42px/);
    assert.ok(html.includes(name)); assert.match(html, /触发方式/); assert.match(html, /锁定效果/);
    assert.match(html, /全局已暂停/); assert.match(html, /重置参数/);
    assert.match(html, /完整源码/); assert.match(html, /HTML \+ CSS/);
    assert.match(html, effect === "glitch" ? /色差偏移/ : /聚拢字距/);
  }
});

test("registry distributes each interaction effect without site-only dependencies", () => {
  const registry = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf8"));
  for (const [effect] of definitions) {
    const item = registry.items.find(item => item.name === `${effect}-text`);
    assert.equal(item.files.length, 3);
    for (const file of item.files) assert.ok(readFileSync(path.join(root, file.path), "utf8").length);
  }
});
