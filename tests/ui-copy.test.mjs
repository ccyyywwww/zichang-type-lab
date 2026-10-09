import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { root, loadSource } from "./helpers/load-ts.mjs";
const load = relative => { const filename = path.join(root, relative); return loadSource(readFileSync(filename, "utf8"), filename); };
const { uiCatalog } = load("components/site/ui-catalog.ts");
const { getUICode, uiDefaults } = load("lib/ui-component-code.ts");
const fixture = mkdtempSync(path.join(tmpdir(), "zichang-ui-copy-"));
const sources = [];
for (const entry of uiCatalog) {
  const options = { ...uiDefaults(entry), label: '<script>中文👨‍👩‍👧‍👦 " { }', description: '<b>内容 &</b>', items: '一\n二\n<script>', radius: 27, accent: "#123456", loading: entry.kind === "button", checked: false, value: 37, lines: 5 };
  const output = getUICode(entry, options, { text: '自定义 < & "', selection: "1", clicks: 3 });
  const target = path.join(fixture, entry.id);
  for (const file of output.files) {
    const filename = path.join(target, file.path);
    mkdirSync(path.dirname(filename), { recursive: true }); writeFileSync(filename, file.content);
    if (/\.tsx?$/.test(filename)) sources.push(filename);
  }
  test(`${entry.id}: customized copy compiles and renders outside the site`, () => {
    assert.doesNotMatch(output.react, /@\//);
    assert.ok(output.react.includes('"--zc-accent":"#123456"'));
    assert.ok(output.react.includes('"--zc-radius":"27px"'));
    const main = output.files[0]; assert.equal(main.content, readFileSync(path.join(root, main.path), "utf8"));
    const Example = loadSource(output.react, path.join(target, "Example.tsx"));
    const html = renderToStaticMarkup(createElement(Example.default));
    assert.doesNotMatch(html, /<script>/); assert.match(html, /--zc-accent:#123456/);
    if (entry.kind === "button") { assert.match(html, /disabled=""/); assert.match(html, /aria-busy="true"/); }
    if (["input", "textarea"].includes(entry.kind)) assert.match(html, /自定义 &lt; &amp;/);
    if (entry.kind === "tabs") { assert.match(html, /role="tablist"/); assert.match(html, /role="tabpanel"/); }
    if (entry.kind === "accordion") assert.match(html, /<details/);
    if (entry.kind === "skeleton") assert.equal((html.match(/zc-skeleton-line/g) ?? []).length, 5);
  });
}
test("all customized UI examples pass isolated strict TypeScript checks", () => {
  const program = ts.createProgram(sources, { noEmit: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX, types: [], paths: { react: [path.join(root, "node_modules/@types/react/index.d.ts")], "react/jsx-runtime": [path.join(root, "node_modules/@types/react/jsx-runtime.d.ts")] } });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => fixture, getCanonicalFileName: filename => filename, getNewLine: () => "\n" }));
});
