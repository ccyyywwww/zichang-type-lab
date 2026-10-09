import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import Ajv from "ajv";
import { validateRegistry } from "./check-registry.mjs";
import { createSourceZip } from "./source-zip.mjs";

const scriptRoot = path.resolve(import.meta.dirname, "..");
const schema = JSON.parse(readFileSync(path.join(import.meta.dirname, "schemas/registry-item.schema.json"), "utf8"));
const require = createRequire(import.meta.url);
const draft07 = require("ajv/lib/refs/json-schema-draft-07.json");
const validateItem = new Ajv({ allErrors: true }).addMetaSchema({ ...draft07, $id: schema.$schema }).compile(schema);
const digest = data => createHash("sha256").update(data).digest("hex");
const json = data => JSON.stringify(data, null, 2) + "\n";

export function buildDistribution(projectRoot, outputDirectory = path.join(projectRoot, "outputs/distribution")) {
  validateRegistry(projectRoot);
  const registry = JSON.parse(readFileSync(path.join(projectRoot, "registry.json"), "utf8"));
  const packageInfo = JSON.parse(readFileSync(path.join(projectRoot, "package.json"), "utf8"));
  const output = path.resolve(outputDirectory);
  assert.ok(output !== path.parse(output).root && output !== path.resolve(projectRoot), "Output must be a dedicated directory");
  mkdirSync(path.join(output, "r"), { recursive: true });
  mkdirSync(path.join(output, "archives"), { recursive: true });
  const manifest = { name: registry.name, version: packageInfo.version, localOnly: true, schemaSource: "https://ui.shadcn.com/schema/registry-item.json", items: [] };
  for (const item of registry.items) {
    assert.match(item.name, /^[a-z][a-z0-9-]*$/);
    const files = item.files.map(file => ({ ...file, target: file.path.replace(/^components\//, "@components/"), content: readFileSync(path.join(projectRoot, file.path), "utf8") }));
    const primary = item.name === "text-effects" ? "NeonText" : path.basename(files.find(file => file.path.endsWith(".tsx")).path, ".tsx");
    const componentPath = item.name === "text-effects" ? "components/text-effects/index" : files.find(file => file.path.endsWith(`${primary}.tsx`)).path.replace(/\.tsx$/, "");
    const cssPath = item.name === "text-effects" ? "components/text-effects/neon-text/neon-text.css" : files.find(file => file.path.endsWith(".css")).path;
    const docs = `保留文件目录结构，并单独导入 ${cssPath}。React 是外部依赖。当前为本地开发产物，尚未经过远程 CLI 安装验证。`;
    const payload = { $schema: manifest.schemaSource, ...item, dependencies: ["react"], docs, files };
    assert.ok(validateItem(payload), `${item.name}: ${JSON.stringify(validateItem.errors)}`);
    assert.ok(files.every(file => /^@components\/(text-effects|ui)\//.test(file.target)), "Unexpected install target");
    const voidExample = ["Switch", "Progress", "Input", "Textarea", "Select", "Checkbox", "Slider", "Card", "Alert", "Spinner", "Skeleton", "Tabs", "Conversation", "ChatMessage", "PromptInput", "ThinkingIndicator", "PromptSuggestions", "ReasoningPanel"].includes(primary);
    const nativeLabel = ["Switch", "Progress", "Input", "Textarea", "Select", "Checkbox", "Slider"].includes(primary) ? ' aria-label="组件示例"' : "";
    const example = `<${primary}${primary === "TextEffect" ? ' effect="slide"' : nativeLabel}${voidExample ? " />" : ">中文 ABC 2026 ✨</" + primary + ">"}`;
    const readme = `# ${item.title}\n\n字场 ${packageInfo.version} 本地源码包。\n\n${docs}\n\n在已有 React / TypeScript 项目根目录解压。文件不依赖本站 @/ 别名或全局 CSS。\n\n\`\`\`tsx\nimport { ${primary} } from "./${componentPath}";\nimport "./${cssPath}";\n\nexport default function Example() {\n  return ${example};\n}\n\`\`\`\n\n逐字组件保留 core/segment-text.ts；高亮保留同目录 types.ts。聚合包支持从 index 导入，并按组件单独导入 CSS。\n`;
    const archiveFiles = files.map(file => ({ path: file.path, content: file.content }));
    archiveFiles.push({ path: "README.md", content: readme });
    if (existsSync(path.join(projectRoot, "LICENSE"))) archiveFiles.push({ path: "LICENSE", content: readFileSync(path.join(projectRoot, "LICENSE"), "utf8") });
    const payloadBytes = Buffer.from(json(payload));
    const archiveBytes = createSourceZip(archiveFiles);
    const registryPath = `r/${item.name}.json`; const archivePath = `archives/${item.name}.zip`;
    writeFileSync(path.join(output, registryPath), payloadBytes);
    writeFileSync(path.join(output, archivePath), archiveBytes);
    manifest.items.push({ name: item.name, registry: { path: registryPath, bytes: payloadBytes.length, sha256: digest(payloadBytes) }, archive: { path: archivePath, bytes: archiveBytes.length, sha256: digest(archiveBytes) }, files: files.map(file => ({ path: file.path, target: file.target, bytes: Buffer.byteLength(file.content), sha256: digest(file.content) })) });
  }
  writeFileSync(path.join(output, "manifest.json"), json(manifest));
  writeFileSync(path.join(output, "README.md"), `# 字场本地分发产物\n\n版本 ${packageInfo.version}。包含 ${manifest.items.length} 个 Registry JSON 和源码 ZIP。\n\n- r/：含实际源码与 @components 安装目标的 Registry item JSON\n- archives/：含完整目录、样式及使用示例的源码包\n- manifest.json：文件大小与 SHA-256 校验值\n\n仅本地生成，未部署或发布。源码 ZIP 已验证内容和依赖；Registry JSON 已按离线官方 schema 校验，未运行远程 shadcn CLI 安装。\n`);
  return manifest;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const manifest = buildDistribution(scriptRoot);
  process.stdout.write(`Built ${manifest.items.length} Registry JSON files and source ZIPs in outputs/distribution\n`);
}
