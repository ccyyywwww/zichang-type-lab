# 为字场贡献代码

感谢你愿意帮助改进字场。这里记录提交问题、增加文字效果和发送 Pull Request 的基本约定。

## 开始之前

请先检查现有 Issue，避免重复提交。如果计划增加新的公开 API、修改组件结构或引入运行时依赖，建议先创建功能建议 Issue 讨论方案。

适合直接提交 Pull Request 的内容包括：

- 修复可以明确复现的问题
- 改善中文、标点、emoji 或组合字符支持
- 改善键盘操作、对比度或减少动画行为
- 补充测试和文档
- 不改变公开 API 的样式修正

## 本地开发

```bash
npm install
npm run dev
```

效果库运行在 <http://localhost:3000>，文档运行在 <http://localhost:3000/docs>。

Windows PowerShell 可以将 `npm` 替换为 `npm.cmd`。

## 增加新效果

1. 在 `components/text-effects/types.ts` 的 `EffectId` 中增加 ID。
2. 在 `components/text-effects/catalog.ts` 中增加名称、分类和说明。
3. 在 `app/globals.css` 中增加对应的 `.fx-*` 样式与关键帧。
4. 如果效果需要逐字动画，将目录项的 `split` 设置为 `true`。
5. 在首页和 `/docs` 确认真实预览正常。
6. 更新 README 的效果清单。
7. 补充或更新自动化测试。

效果 ID 使用简短的英文小写单词。公开名称应同时提供中文名称和英文名称。

## 组件约定

- 保持 `TextEffect` 的统一 API，避免为单个效果加入只能使用一次的属性。
- 优先使用 CSS 动画；确有必要时才增加运行时动画依赖。
- 不要将文本拆分为 UTF-16 code unit，应继续使用 `Intl.Segmenter` 或兼容回退。
- 视觉字符需要对辅助技术隐藏，并保留完整文本标签。
- 新效果必须定义 `prefers-reduced-motion` 下的可接受行为。
- 不应因动画加载造成明显布局跳动。

## 提交前检查

```bash
npm run lint
npm test
```

同时手动检查：

- 首页与 `/docs` 均能打开
- 深色和浅色主题均可阅读
- 桌面端与手机宽度没有横向溢出
- 暂停动画和系统减少动画设置有效
- 中文、英文、数字、标点和 emoji 均可正常显示

## Commit 建议

推荐使用简洁的 Conventional Commits 风格：

```text
feat: add rotate text effect
fix: preserve emoji grapheme clusters
docs: update local development guide
test: cover reduced motion markup
```

## Pull Request

Pull Request 请聚焦一个主题，并说明：

- 改了什么
- 为什么需要修改
- 如何验证
- 是否影响现有 API
- 如果是视觉修改，提供修改前后截图或录屏

维护者可能会要求调整 API、无障碍表现或测试覆盖后再合并。
