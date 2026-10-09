import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { inflateRawSync } from "node:zlib";
import ts from "typescript";
import { buildDistribution } from "../scripts/build-distribution.mjs";
import { createSourceZip, crc32 } from "../scripts/source-zip.mjs";
import { checkBundles } from "../scripts/check-bundles.mjs";

const root = path.resolve(import.meta.dirname, "..");
const temp = mkdtempSync(path.join(tmpdir(), "zichang-artifacts-"));
const output = path.join(temp, "distribution");
const manifest = buildDistribution(root, output);
const digest = bytes => createHash("sha256").update(bytes).digest("hex");

function readZip(bytes) {
  const end = bytes.length - 22;
  assert.equal(bytes.readUInt32LE(end), 0x06054b50);
  const count = bytes.readUInt16LE(end + 10);
  let central = bytes.readUInt32LE(end + 16);
  const files = new Map();
  for (let index = 0; index < count; index++) {
    assert.equal(bytes.readUInt32LE(central), 0x02014b50);
    const compressedLength = bytes.readUInt32LE(central + 20);
    const originalLength = bytes.readUInt32LE(central + 24);
    const nameLength = bytes.readUInt16LE(central + 28);
    const name = bytes.subarray(central + 46, central + 46 + nameLength).toString("utf8");
    const offset = bytes.readUInt32LE(central + 42);
    assert.equal(bytes.readUInt32LE(offset), 0x04034b50);
    assert.equal(bytes.readUInt16LE(offset + 8), 8);
    const start = offset + 30 + bytes.readUInt16LE(offset + 26) + bytes.readUInt16LE(offset + 28);
    const data = inflateRawSync(bytes.subarray(start, start + compressedLength));
    assert.equal(data.length, originalLength); assert.equal(crc32(data), bytes.readUInt32LE(central + 16));
    assert.ok(!files.has(name)); files.set(name, data);
    central += 46 + nameLength + bytes.readUInt16LE(central + 30) + bytes.readUInt16LE(central + 32);
  }
  assert.equal(central, end);
  return files;
}

test("all generated JSON and ZIPs contain exact source contents and verified hashes", () => {
  assert.equal(manifest.items.length, 38);
  for (const item of manifest.items) {
    const jsonBytes = readFileSync(path.join(output, item.registry.path));
    const zipBytes = readFileSync(path.join(output, item.archive.path));
    assert.equal(digest(jsonBytes), item.registry.sha256); assert.equal(digest(zipBytes), item.archive.sha256);
    assert.equal(jsonBytes.length, item.registry.bytes); assert.equal(zipBytes.length, item.archive.bytes);
    const payload = JSON.parse(jsonBytes);
    const files = readZip(zipBytes);
    assert.ok(files.get("README.md").toString("utf8").includes("import"));
    for (const file of payload.files) {
      assert.equal(file.content, readFileSync(path.join(root, file.path), "utf8"));
      assert.deepEqual(files.get(file.path), Buffer.from(file.content));
      assert.equal(file.target, file.path.replace(/^components\//, "@components/"));
      const record = item.files.find(entry => entry.path === file.path);
      assert.equal(digest(file.content), record.sha256);
    }
  }
});

test("generation is byte-reproducible and ZIP names cannot escape extraction directories", () => {
  assert.equal(crc32(Buffer.from("123456789")), 0xcbf43926);
  const second = path.join(temp, "second");
  assert.deepEqual(buildDistribution(root, second), manifest);
  for (const item of manifest.items) assert.deepEqual(readFileSync(path.join(output, item.archive.path)), readFileSync(path.join(second, item.archive.path)));
  for (const filename of ["../bad", "/absolute", "C:/bad", "folder\\bad", "folder//bad"]) assert.throws(() => createSourceZip([{ path: filename, content: "" }]));
  assert.throws(() => createSourceZip([{ path: "same", content: "a" }, { path: "same", content: "b" }]));
});

test("install targets preserve dependencies and type-check in an isolated React project", () => {
  const installRoot = path.join(temp, "installed"); const sources = [];
  for (const item of manifest.items) {
    const payload = JSON.parse(readFileSync(path.join(output, item.registry.path), "utf8"));
    for (const file of payload.files) {
      const filename = path.join(installRoot, file.target.replace(/^@components\//, "src/components/"));
      mkdirSync(path.dirname(filename), { recursive: true }); writeFileSync(filename, file.content);
      if (/\.tsx?$/.test(filename)) sources.push(filename);
    }
    const readme = readZip(readFileSync(path.join(output, item.archive.path))).get("README.md").toString("utf8");
    const example = readme.match(/```tsx\n([\s\S]+?)\n```/);
    assert.ok(example, `${item.name} lacks an example`);
    const examplePath = path.join(installRoot, "src", `Example-${item.name}.tsx`);
    writeFileSync(examplePath, example[1]); sources.push(examplePath);
  }
  const program = ts.createProgram(sources, { noEmit: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX, types: [], paths: { react: [path.join(root, "node_modules/@types/react/index.d.ts")], "react/jsx-runtime": [path.join(root, "node_modules/@types/react/jsx-runtime.d.ts")] } });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => installRoot, getCanonicalFileName: filename => filename, getNewLine: () => "\n" }));
});

test("aggregate ZIP extracts correctly with the Windows native extractor", { skip: process.platform !== "win32" }, () => {
  const quote = text => `'${text.replaceAll("'", "''")}'`;
  const target = path.join(temp, "native-extraction");
  const command = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory(${quote(path.join(output, "archives/text-effects.zip"))}, ${quote(target)})`;
  execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(command, "utf16le").toString("base64")], { windowsHide: true, timeout: 20000 });
  for (const file of manifest.items.find(item => item.name === "text-effects").files) assert.equal(digest(readFileSync(path.join(target, file.path))), file.sha256);
});

test("direct and barrel imports retain only selected effects within the bundle budget", async () => {
  const report = await checkBundles(root, path.join(temp, "reports"));
  assert.equal(report.components.length, 36);
  for (const component of report.components) {
    assert.ok(component.direct.totalGzipBytes < report.budgetGzipBytes);
    assert.ok(component.barrel.totalGzipBytes <= component.direct.totalGzipBytes + 256);
  }
});
