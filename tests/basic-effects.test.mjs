import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const cache = new Map();
function loadSource(source, filename) {
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, reportDiagnostics: true });
  assert.equal(result.diagnostics?.length ?? 0, 0);
  const compiledModule = { exports: {} };
  const localRequire = specifier => {
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return require(specifier);
    const raw = specifier.endsWith("?raw");
    const target = specifier.startsWith("@/") ? path.join(root, specifier.slice(2).replace(/\?raw$/, "")) : path.resolve(path.dirname(filename), specifier.replace(/\?raw$/, ""));
    if (raw) return readFileSync(target, "utf8");
    if (specifier.endsWith(".css")) { readFileSync(target, "utf8"); return {}; }
    for (const candidate of [target + ".tsx", target + ".ts", path.join(target, "index.ts")]) {
      try { const contents = readFileSync(candidate, "utf8"); if (!cache.has(candidate)) cache.set(candidate, loadSource(contents, candidate)); return cache.get(candidate); }
      catch (error) { if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error; }
    }
    throw new Error(`Unresolved import ${specifier}`);
  };
  new Function("require", "module", "exports", result.outputText)(localRequire, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const definitions = [["neon", "neon-text", "NeonText"], ["rainbow", "rainbow-text", "RainbowText"], ["longshadow", "long-shadow-text", "LongShadowText"]];
const generatorPath = path.join(root, "lib/basic-effect-code.ts");
const { getBasicEffectCode } = loadSource(readFileSync(generatorPath, "utf8"), generatorPath);
const text = '中文 English 123，✨ 👨‍👩‍👧‍👦 é <script> & " { }\n第二行';

for (const [effect, folder, name] of definitions) {
  const filename = path.join(root, `components/text-effects/${folder}/${name}.tsx`);
  const source = readFileSync(filename, "utf8");
  const loaded = loadSource(source, filename);
  const Component = loaded[name];
  const defaults = loaded[`${name[0].toLowerCase()}${name.slice(1)}Defaults`];
  test(`${name}: semantic rendering and independent copy output`, () => {
    assert.doesNotMatch(source, /@\/|app\/|globals\.css/);
    const html = renderToStaticMarkup(createElement(Component, { as: "h2", className: "custom", ...defaults }, text));
    assert.match(html, /^<h2/); assert.match(html, /custom/); assert.match(html, /中文 English 123/);
    assert.match(html, /&lt;script&gt;/); assert.match(html, /👨‍👩‍👧‍👦/);
    const options = effect === "longshadow" ? defaults : { ...defaults, duration: 2.4, delay: .3, paused: true };
    const codes = getBasicEffectCode(effect, text, options, 42);
    assert.ok(codes.source.includes(source));
    const css = readFileSync(path.join(path.dirname(filename), `${folder}.css`), "utf8");
    assert.ok(codes.source.includes(css)); assert.ok(codes.html.includes(css));
    assert.match(codes.html, /font-size:42px/); assert.match(codes.html, /&lt;script&gt;/);
    assert.doesNotMatch(codes.react, /@\//);
    const Example = loadSource(codes.react, path.join(path.dirname(filename), "Example.tsx"));
    const rendered = renderToStaticMarkup(createElement(Example.default));
    assert.match(rendered, /font-size:42px/); assert.match(rendered, /&lt;script&gt;/);
    if (effect !== "longshadow") {
      assert.match(rendered, /is-paused/); assert.match(codes.html, /is-paused/);
      assert.match(css, /prefers-reduced-motion/);
      const staticMarkup = renderToStaticMarkup(createElement(Component, { animated: false }, text));
      assert.doesNotMatch(staticMarkup, /is-animated/);
    }
  });
}

test("long shadows clamp layer count and preserve zero length and direction", () => {
  const filename = path.join(root, "components/text-effects/long-shadow-text/LongShadowText.tsx");
  const { getLongShadow } = loadSource(readFileSync(filename, "utf8"), filename);
  assert.equal(getLongShadow(45, 0, "#fff"), "none");
  assert.equal(getLongShadow(0, -1, "#fff"), "none");
  assert.equal(getLongShadow(0, 1, "#fff"), "1.000px 0.000px 0 #fff");
  assert.equal(getLongShadow(90, 1, "#fff"), "0.000px 1.000px 0 #fff");
  assert.equal(getLongShadow(45, 10000, "#fff").split(", ").length, 80);
  assert.doesNotMatch(getLongShadow(NaN, Infinity, "#fff"), /NaN|Infinity/);
});

test("registry includes all standalone files for phase E basic effects", () => {
  const registry = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf8").replace(/^\uFEFF/, ""));
  for (const [, folder] of definitions) {
    const item = registry.items.find(item => item.name === folder);
    assert.equal(item.files.length, 3);
    for (const file of item.files) assert.ok(readFileSync(path.join(root, file.path), "utf8").length);
  }
});

test("all three workbenches render their real preview and synchronized usage code", () => {
  const filename = path.join(root, "components/site/BasicEffectWorkbench.tsx");
  const { BasicEffectWorkbench } = loadSource(readFileSync(filename, "utf8"), filename);
  for (const [effect, folder, name] of definitions) {
    const html = renderToStaticMarkup(createElement(BasicEffectWorkbench, { effect, text, fontSize: 42, duration: 2.4, paused: true, onTextChange() {}, onFontSizeChange() {}, onDurationChange() {} }));
    assert.match(html, /workbench-stage/);
    assert.match(html, /font-size:42px/);
    assert.ok(html.includes(`zc-${folder}`));
    assert.ok(html.includes(name));
    assert.match(html, /完整源码/); assert.match(html, /HTML \+ CSS/);
    assert.match(html, /重置参数/);
    if (effect !== "longshadow") assert.match(html, /全局已暂停/);
  }
});
