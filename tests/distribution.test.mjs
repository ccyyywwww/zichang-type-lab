import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { root, loadSource } from "./helpers/load-ts.mjs";
import { validateRegistry } from "../scripts/check-registry.mjs";

const generatorPath = path.join(root, "lib/copy-effect-code.ts");
const { getCopyEffectCode, copyDefinitions } = loadSource(readFileSync(generatorPath, "utf8"), generatorPath);
const text = '中文 English 123，👨‍👩‍👧‍👦 é <script> & " { }\n第二行';
const fixture = mkdtempSync(path.join(tmpdir(), "zichang-copy-"));
const copiedTsFiles = new Set();
const options = {
  highlight: { bandColor: "#fa5b91", direction: "right", bandThickness: 60, duration: 2.4, paused: true },
  gradient: { colors: ["#ff3f7f", "#7c5cff", "#2dddc2"], direction: "reverse", spread: 350, duration: 2.4, paused: true },
  outline: { strokeWidth: 3, shadowX: -8, shadowY: 6 },
  underline: { trigger: "mount", direction: "right", width: 120, duration: 2.4, paused: true },
  slide: { direction: "left", distance: 80, stagger: .08, delay: .3, duration: 2.4, initialOpacity: .2, paused: true },
  blur: { direction: "down", blur: 20, distance: 30, stagger: .08, delay: .3, duration: 2.4, initialOpacity: .2, paused: true },
  scale: { initialScale: .3, overshoot: 1.4, stagger: .08, delay: .3, duration: 2.4, initialOpacity: .2, paused: true },
  typewriter: { typingSpeed: 20, deletingSpeed: 10, holdDelay: 200, startDelay: 0, loop: false, cursor: '"<|', paused: true },
  shimmer: { angle: 45, width: 40, baseColor: "#777777", shineColor: "#fa5b91", duration: 2.4, paused: true },
  wave: { direction: "down", amplitude: 30, stagger: .1, accentColor: "#fa5b91", duration: 2.4, paused: true },
};

for (const [effect, definition] of Object.entries(copyDefinitions)) {
  const output = getCopyEffectCode(effect, text, options[effect], 42);
  for (const file of output.files) {
    const filename = path.join(fixture, file.path);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, file.content, "utf8");
    if (/\.tsx?$/.test(filename)) copiedTsFiles.add(filename);
  }
  test(`${definition.name}: complete copy runs outside the project and matches HTML output`, () => {
    const main = output.files.find(file => file.path.endsWith(`${definition.name}.tsx`));
    assert.equal(main.content, readFileSync(path.join(root, main.path), "utf8"));
    assert.ok(output.source.includes(definition.source)); assert.ok(output.source.includes(definition.css));
    assert.doesNotMatch(output.react, /@\//);
    const example = output.files.find(file => file.path.endsWith("/Example.tsx"));
    const Example = loadSource(example.content, path.join(fixture, example.path));
    const rendered = renderToStaticMarkup(createElement(Example.default));
    assert.match(rendered, /font-size:42px/); assert.match(rendered, /&lt;script&gt;/);
    if (effect === "typewriter") {
      assert.equal(output.htmlAvailable, false);
      assert.doesNotMatch(output.html, /<span/);
      assert.match(rendered, /zc-typewriter-visible/);
    } else {
      assert.equal(output.htmlAvailable, true);
      assert.equal(output.html.split("\n\n<style>")[0], rendered);
      assert.ok(output.html.includes(definition.css));
      if (effect !== "outline") assert.match(rendered, /is-paused/);
    }
  });
}

test("all distributed components and copied examples type-check in an isolated React project", () => {
  const registry = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf8"));
  for (const file of registry.items.find(item => item.name === "text-effects").files) {
    const filename = path.join(fixture, file.path);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, readFileSync(path.join(root, file.path), "utf8"), "utf8");
    if (/\.tsx?$/.test(filename)) copiedTsFiles.add(filename);
  }
  const program = ts.createProgram([...copiedTsFiles], {
    noEmit: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX, types: [],
    paths: { react: [path.join(root, "node_modules/@types/react/index.d.ts")], "react/jsx-runtime": [path.join(root, "node_modules/@types/react/jsx-runtime.d.ts")] },
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const message = ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => fixture, getCanonicalFileName: filename => filename, getNewLine: () => "\n" });
  assert.equal(diagnostics.length, 0, message);
});

test("all registry items include the closure of their local dependencies", () => {
  const result = validateRegistry(root);
  assert.equal(result.items, 38);
  const registry = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf8"));
  const generic = registry.items.find(item => item.name === "text-effect");
  assert.ok(!generic.files.some(file => file.path === "components/text-effects/index.ts"));
  assert.ok(generic.files.some(file => file.path.endsWith("core/segment-text.ts")));
  const all = registry.items.find(item => item.name === "text-effects");
  assert.ok(all.files.some(file => file.path === "components/text-effects/index.ts"));
});
