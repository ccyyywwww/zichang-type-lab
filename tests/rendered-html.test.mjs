import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished type library home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /字场 ZICHANG/);
  assert.match(html, /让每一个界面/);
  assert.match(html, /让文字动起来/);
  assert.match(html, /COMPONENT LIBRARY/);
  for (const category of ["文字", "按钮", "表单", "反馈"]) assert.ok(html.includes(category));
  assert.match(html, /zc-button--shiny/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("server-renders the component documentation route", async () => {
  const response = await render("/docs");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /使用文档/);
  assert.match(html, /TextEffect API/);
  assert.match(html, /effect=&quot;slide&quot;/);
  assert.match(html, /Intl\.Segmenter/);
  assert.match(html, /aria-label="让文字动起来"/);
  assert.match(html, /aria-hidden="true"/);
});

test("keeps component metadata, public API, and registry aligned", async () => {
  const [catalog, component, index, home, registrySource, highlightComponent, highlightStyles, workbench, visualWorkbench, codeGenerator] = await Promise.all([
    readFile(new URL("components/text-effects/catalog.ts", projectRoot), "utf8"),
    readFile(new URL("components/text-effects/TextEffect.tsx", projectRoot), "utf8"),
    readFile(new URL("components/text-effects/index.ts", projectRoot), "utf8"),
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("registry.json", projectRoot), "utf8"),
    readFile(new URL("components/text-effects/highlight-text/HighlightText.tsx", projectRoot), "utf8"),
    readFile(new URL("components/text-effects/highlight-text/highlight-text.css", projectRoot), "utf8"),
    readFile(new URL("components/site/HighlightWorkbench.tsx", projectRoot), "utf8"),
    readFile(new URL("components/site/VisualEffectWorkbench.tsx", projectRoot), "utf8"),
    readFile(new URL("lib/highlight-code.ts", projectRoot), "utf8"),
  ]);

  const ids = [...catalog.matchAll(/\{ id: "([a-z-]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 48);
  assert.equal(new Set(ids).size, 48);
  assert.match(component, /splitGraphemes/);
  const segmenter = await readFile(new URL("components/text-effects/core/segment-text.ts", projectRoot), "utf8");
  assert.match(segmenter, /Intl\.Segmenter/);
  assert.match(component, /aria-hidden="true"/);
  assert.match(index, /export \{ TextEffect \}/);
  assert.match(home, /from "@\/components\/text-effects"/);
  assert.match(home, /全部效果/);
  assert.match(home, /外观样式/);
  assert.match(home, /出现动画/);
  assert.match(home, /持续动画/);
  assert.match(home, /鼠标互动/);
  assert.match(home, /↻ 重播/);
  assert.doesNotMatch(home, /function AnimatedText/);
  assert.match(highlightComponent, /bandThickness/);
  assert.match(highlightComponent, /bandStart/);
  assert.match(highlightComponent, /bandEnd/);
  assert.match(highlightComponent, /data-direction/);
  assert.match(highlightStyles, /--zc-highlight-color/);
  assert.match(highlightStyles, /prefers-reduced-motion/);
  assert.match(workbench, /条带颜色/);
  assert.match(workbench, /完整源码/);
  assert.match(workbench, /HTML \+ CSS/);
  assert.match(codeGenerator, /getHighlightHtmlCode/);
  assert.match(visualWorkbench, /GradientText/);
  assert.match(visualWorkbench, /OutlineText/);
  assert.match(visualWorkbench, /UnderlineText/);
  assert.match(visualWorkbench, /流动范围/);
  assert.match(visualWorkbench, /描边宽度/);
  assert.match(visualWorkbench, /线条范围/);

  const registry = JSON.parse(registrySource);
  assert.equal(registry.name, "zichang");
  assert.equal(registry.items[0].name, "text-effect");
  assert.equal(registry.items[0].files.length, 5);
  assert.equal(registry.items[1].name, "highlight-text");
  assert.equal(registry.items[1].files.length, 4);
  assert.ok(registry.items[1].files.some((file) => file.path.endsWith("highlight-text.css")));
  assert.deepEqual(registry.items.slice(2, 5).map((item) => item.name), ["gradient-text", "outline-text", "underline-text"]);
  assert.deepEqual(registry.items.slice(5, 8).map((item) => item.name), ["slide-text", "blur-text", "scale-text"]);
});

test("highlight component stays copyable without site-only imports", async () => {
  const component = await readFile(
    new URL("components/text-effects/highlight-text/HighlightText.tsx", projectRoot),
    "utf8",
  );
  const runtimeImports = [...component.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);

  assert.deepEqual(runtimeImports, ["react", "./types"]);
  assert.doesNotMatch(component, /@\/|app\/|globals\.css/);
  assert.match(component, /Math\.min\(max, Math\.max\(min, value\)\)/);
});

test("visual effect components stay independently distributable", async () => {
  const paths = [
    "components/text-effects/gradient-text/GradientText.tsx",
    "components/text-effects/outline-text/OutlineText.tsx",
    "components/text-effects/underline-text/UnderlineText.tsx",
  ];

  for (const path of paths) {
    const source = await readFile(new URL(path, projectRoot), "utf8");
    assert.match(source, /from "react"/);
    assert.doesNotMatch(source, /@\/|app\/|globals\.css/);
  }
});

test("entrance effects expose controls and distributable components", async () => {
  const workbench = await readFile(new URL("components/site/EntranceEffectWorkbench.tsx", projectRoot), "utf8");
  assert.match(workbench, /移动距离/);
  assert.match(workbench, /字符间隔/);
  assert.match(workbench, /模糊半径/);
  assert.match(workbench, /回弹幅度/);
  assert.match(workbench, /HTML \+ CSS/);

  for (const name of ["slide", "blur", "scale"]) {
    const source = await readFile(new URL(`components/text-effects/${name}-text/${name[0].toUpperCase()}${name.slice(1)}Text.tsx`, projectRoot), "utf8");
    assert.match(source, /splitGraphemes/);
    assert.doesNotMatch(source, /@\/|app\/|globals\.css/);
    assert.match(source, /aria-hidden="true"/);
  }
});

test("loop effects expose controls and distributable components", async () => {
  const workbench = await readFile(new URL("components/site/LoopEffectWorkbench.tsx", projectRoot), "utf8");
  assert.match(workbench, /输入速度/); assert.match(workbench, /高光宽度/); assert.match(workbench, /波浪振幅/);
  for (const [folder, file] of [["typewriter-text","TypewriterText"],["shimmer-text","ShimmerText"],["wave-text","WaveText"]]) {
    const source = await readFile(new URL(`components/text-effects/${folder}/${file}.tsx`, projectRoot), "utf8");
    assert.doesNotMatch(source, /@\/|app\/|globals\.css/);
  }
  const registry = JSON.parse(await readFile(new URL("registry.json", projectRoot), "utf8"));
  assert.deepEqual(registry.items.slice(8, 11).map((item) => item.name), ["typewriter-text", "shimmer-text", "wave-text"]);
});
