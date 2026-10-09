import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export function validateRegistry(projectRoot) {
  const registry = JSON.parse(readFileSync(path.join(projectRoot, "registry.json"), "utf8"));
  const itemNames = new Set();
  let checkedFiles = 0;
  for (const item of registry.items) {
    assert.ok(!itemNames.has(item.name), `Duplicate registry item ${item.name}`);
    itemNames.add(item.name);
    const files = new Set(item.files.map(file => file.path.replaceAll("\\", "/")));
    assert.equal(files.size, item.files.length, `Duplicate files in ${item.name}`);
    for (const file of item.files) {
      const absolute = path.resolve(projectRoot, file.path);
      assert.ok(absolute.startsWith(path.resolve(projectRoot) + path.sep), "Registry path escaped project");
      assert.ok(existsSync(absolute), `Missing ${item.name}: ${file.path}`);
      checkedFiles++;
      if (!/\.tsx?$/.test(file.path)) continue;
      const source = ts.createSourceFile(file.path, readFileSync(absolute, "utf8"), ts.ScriptTarget.Latest, true);
      for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
        const specifier = statement.moduleSpecifier;
        if (!specifier || !ts.isStringLiteral(specifier)) continue;
        const dependency = specifier.text;
        if (dependency === "react" || dependency.startsWith("react/")) continue;
        assert.ok(dependency.startsWith("."), `${item.name} has site-only or unsupported import ${dependency}`);
        const target = path.posix.normalize(path.posix.join(path.posix.dirname(file.path), dependency));
        const candidates = [target, `${target}.ts`, `${target}.tsx`, `${target}/index.ts`, `${target}/index.tsx`];
        assert.ok(candidates.some(candidate => files.has(candidate)), `${item.name} omits dependency ${dependency} from ${file.path}`);
      }
    }
  }
  return { items: itemNames.size, checkedFiles };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = validateRegistry(path.resolve(import.meta.dirname, ".."));
  process.stdout.write(`Registry dependency checks passed: ${result.items} items, ${result.checkedFiles} file entries\n`);
}
