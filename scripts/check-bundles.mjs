import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "vite";
import reactPlugin from "@vitejs/plugin-react";

export async function checkBundles(projectRoot, outputDirectory = path.join(projectRoot, "outputs/distribution")) {
  const registry = JSON.parse(readFileSync(path.join(projectRoot, "registry.json"), "utf8"));
  const definitions = registry.items.filter(item => !["text-effect", "text-effects"].includes(item.name)).map(item => {
    const component = item.files.find(file => file.path.endsWith(".tsx"));
    return { name: item.name, component: component.path, exportName: path.basename(component.path, ".tsx"), css: item.files.find(file => file.path.endsWith(".css")).path };
  });
  const normalize = filename => path.resolve(projectRoot, filename).replaceAll("\\", "/");
  const measurements = [];
  const entryPath = path.join(mkdtempSync(path.join(tmpdir(), "zichang-bundle-")), "entry.mjs");
  for (const definition of definitions) {
    const versions = {};
    for (const mode of ["direct", "barrel"]) {
      const barrel = definition.component.startsWith("components/ui/") ? "components/ui/index.ts" : "components/text-effects/index.ts";
      const entry = `export { ${definition.exportName} } from ${JSON.stringify(normalize(mode === "direct" ? definition.component : barrel))};\nimport ${JSON.stringify(normalize(definition.css))};`;
      writeFileSync(entryPath, entry, "utf8");
      const result = await build({ configFile: false, logLevel: "error", plugins: [reactPlugin()], build: { write: false, emptyOutDir: false, minify: true, lib: { entry: entryPath, formats: ["es"], fileName: () => "effect.js", cssFileName: "effect" }, rollupOptions: { external: source => source === "react" || source.startsWith("react/") } } });
      const outputs = (Array.isArray(result) ? result : [result]).flatMap(item => item.output);
      const javascript = outputs.filter(item => item.type === "chunk").map(item => item.code).join("\n");
      const css = outputs.filter(item => item.type === "asset" && item.fileName.endsWith(".css")).map(item => typeof item.source === "string" ? item.source : Buffer.from(item.source).toString("utf8")).join("\n");
      assert.ok(javascript.includes("react"), "React should remain an external dependency");
      assert.ok(css.length, "Individual CSS was not emitted");
      for (const other of definitions) {
        if (other.name === definition.name) continue;
        assert.ok(!javascript.includes(`zc-${other.name}`) && !css.includes(`zc-${other.name}`), `${definition.name} includes unused ${other.name}`);
      }
      assert.ok(!javascript.includes("fx-gradient") && !javascript.includes("EFFECT LIBRARY"), "Site or generic preset catalog leaked into a single component");
      const jsGzip = gzipSync(javascript).length; const cssGzip = gzipSync(css).length;
      assert.ok(jsGzip + cssGzip < 12000, `${definition.name} exceeds the 12 KB gzip budget`);
      versions[mode] = { javascriptBytes: Buffer.byteLength(javascript), javascriptGzipBytes: jsGzip, cssBytes: Buffer.byteLength(css), cssGzipBytes: cssGzip, totalGzipBytes: jsGzip + cssGzip };
    }
    assert.ok(versions.barrel.totalGzipBytes <= versions.direct.totalGzipBytes + 256, `${definition.name} retains unnecessary barrel overhead`);
    measurements.push({ name: definition.name, ...versions });
  }
  const report = { reactExternal: true, importsUnusedEffects: false, budgetGzipBytes: 12000, components: measurements };
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(path.join(outputDirectory, "bundle-report.json"), JSON.stringify(report, null, 2) + "\n");
  const rows = measurements.map(item => `| ${item.name} | ${item.direct.javascriptGzipBytes} | ${item.direct.cssGzipBytes} | ${item.direct.totalGzipBytes} | ${item.barrel.totalGzipBytes} |`).join("\n");
  writeFileSync(path.join(outputDirectory, "BUNDLE_REPORT.md"), `# 单组件包体积与按需导入\n\n单位：gzip 字节；React / JSX runtime 为外部依赖，不计入组件体积。直接导入和统一入口均只导入该组件的 CSS。\n\n| 组件 | JS | CSS | 直接导入总计 | 统一入口总计 |\n| --- | ---: | ---: | ---: | ---: |\n${rows}\n\n所有 ${measurements.length} 个组件均未包含其他效果或站点代码，每项低于 12 KB gzip 预算。统一入口额外开销不超过 256 字节。该报告是本地构建结果，不是 npm 包发布记录。\n`);
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const report = await checkBundles(path.resolve(import.meta.dirname, ".."));
  process.stdout.write(`Bundle checks passed for ${report.components.length} independent components\n`);
}
