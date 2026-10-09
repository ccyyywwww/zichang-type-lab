# 本地源码与 Registry 分发

当前仍是本地开发版，未提供公共 Registry URL 或 npm 包。已完成 36 个独立组件的文件与类型检查，并建立 38 个本地 Registry 条目。通用组件含原有 15 项及 Conversation、ChatMessage、PromptInput、ThinkingIndicator、PromptSuggestions、ReasoningPanel 6 个 AI 组件，源码位于 components/ui，统一导出位于 components/ui/index.ts。

## 复制源码

在效果库打开组件的工作台，选择“完整源码”。按注释中的文件名分别保存组件、CSS、示例，以及出现时的辅助文件。

早期 10 个工作台标注完整项目路径，请保留目录结构。例如逐字滑入：

```text
components/text-effects/
  core/segment-text.ts
  slide-text/SlideText.tsx
  slide-text/slide-text.css
  slide-text/Example.tsx
```

`Example.tsx` 使用同目录相对导入，不要求 `@/` 别名或本站全局 CSS。高亮还需要同目录 `types.ts`；滑入、模糊、缩放、波浪、打字机需要共享 `core/segment-text.ts`。

霓虹、彩虹、长投影、故障和磁吸源码没有共享文件，可以按其注释将组件、CSS 和示例放到同一目录。

所有完整源码均直接读取实际文件。字号、暂停和专属参数随配置输出；文本中的尖括号、引号、花括号、换行和 emoji 会正确处理。

## HTML + CSS 的范围

纯 CSS 效果提供使用实际组件参数、字符分段及实际 CSS 的静态 HTML。更改逐字效果的文字后需要重新生成分段。暂停和系统减少动态效果行为保留。

打字机依赖 React 状态和计时器，不提供纯 HTML + CSS，工作台禁用该选项。其两个 React 输出均包含打字逻辑；完整源码提供所需辅助文件。打字机按 grapheme 输入和删除，预留完整文本宽度，减少动画或暂停时显示全文，后台及卸载时清理计时器。当前复制文件以项目使用的 React 19 和 TypeScript 配置验证。

## Registry 条目

- `text-effect`：通用组件与 48 个预设；仅包含自身依赖，不引入所有独立组件的导出入口。
- 15 个独立条目：highlight、gradient、outline、underline、slide、blur、scale、typewriter、shimmer、wave、neon、rainbow、long-shadow、glitch、magnet，均以 `-text` 结尾。
- `text-effects`：本地聚合条目，含通用组件、全部独立组件、导出入口、CSS 与共享依赖。重复文件只出现一次。
- 15 个通用 UI 条目：button、switch、progress、input、textarea、select、checkbox、slider、badge、card、alert、spinner、skeleton、accordion、tabs，均包含独立 TSX 与 CSS。
- 6 个 AI 条目：conversation、chat-message、prompt-input、thinking-indicator、prompt-suggestions、reasoning-panel，均为独立 TSX/CSS。

`registry.json` 是源文件清单。`npm run build:distribution` 会生成带内容的本地安装 JSON，并按本地保存的官方 schema 校验。文件目标为 `@components/text-effects/...` 或 `@components/ui/...`，配置 components 别名为 `src/components` 时会保留目录结构。已经模拟该目标配置并验证完整类型；尚未运行真实 shadcn CLI 安装，也未上线安装地址。

## 生成本地分发文件

```bash
npm run build:distribution
npm run check:bundles
```

产物位于 `outputs/distribution/`，该目录不提交到 Git：

- `r/*.json`：38 个带完整文件内容、依赖与安装目标的 Registry item。
- `archives/*.zip`：38 个对应源码包，保留目录结构并包含导入示例 README。
- `manifest.json`：版本、每个 JSON / ZIP / 源文件的字节数及 SHA-256。
- `bundle-report.json` 和 `BUNDLE_REPORT.md`：36 个组件直接导入及统一入口导入的 JS / CSS 原始大小和 gzip 大小。

ZIP 使用固定时间戳，重复构建产生相同字节；校验包含内容、依赖、SHA-256 和 Windows .NET ZIP 原生解压。下载源码包后解压到已有 React / TypeScript 项目根目录，按包内 README 单独导入 CSS。

包体积检查将 React / JSX runtime 作为外部依赖，分别构建 36 个直接入口和 36 个统一入口，只导入选中组件的 CSS。检查未使用组件和通用预设目录没有进入最终代码，每个组件 JS + CSS 合计预算为 12 KB gzip，统一入口额外预算为 256 字节。实际大小见生成报告，不计入 React 或应用本身体积。

生成与验收均使用已安装依赖和本地 schema，不请求网络、不部署。schema 来源为 [shadcn 官方 Registry item schema](https://ui.shadcn.com/schema/registry-item.json)，本地副本获取于 2026-10-06。

## 本地验收

```bash
npm run lint
npm run check:registry
npm run build:distribution
npm run check:bundles
npm test
npm run test:interaction-css
npm run test:typewriter
```

`npm test` 会构建站点，并验证服务端页面、复制源码、HTML 一致性及 Registry 依赖闭包。复制文件在独立临时目录运行；全部分发组件和示例在隔离的 React 项目中检查类型。

两个浏览器命令需要本机 Chromium，Windows 自动查找 Chrome / Edge。其他路径可通过 `TEXT_EFFECT_TEST_BROWSER` 指定。测试使用独立临时配置，以隐藏的无界面浏览器验证实际 CSS、React 状态、完整 emoji、布局宽度、暂停、减少动画及计时器清理，不需要部署。

全项目 `tsc --noEmit` 仍会报告已有的 Cloudflare 运行时类型缺失（`cloudflare:workers`、`Fetcher`、`D1Database`）；这与独立组件的隔离类型检查分开报告。

## 下一步

用真实 shadcn CLI 验证本地安装，然后准备 npm 包入口、类型输出及版本策略。公开地址、npm 发布、仓库上传和网站部署不属于本轮本地开发。
