import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

export const root = path.resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const cache = new Map();
export function loadSource(source, filename) {
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
