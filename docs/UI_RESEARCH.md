# 通用组件扩展与自定义

调研日期：2026-10-06。仅本地开发，不部署、不发布。

![字场真实运行的按钮与交互组件目录](../public/docs/images/component-gallery.png)

参考来源：

- [wui 组件目录](https://ui.wzx.wang/)：真实交互预览、按钮、表单、展示和反馈分类，源码可复制。
- [shadcn/ui 官方目录](https://ui.shadcn.com/docs/components)：Input、Textarea、Native Select、Checkbox、Slider、Badge、Card、Alert、Spinner、Skeleton、Tabs、Accordion 的组件范围。
- [shadcn/ui Tabs](https://ui.shadcn.com/docs/components/radix/tabs)：内容面板切换及配置示例。
- [shadcn/ui Slider](https://ui.shadcn.com/docs/components/radix/slider)：数值、范围和步长配置。

借鉴分类和交互需求，组件源码由本站独立实现，未复制第三方组件源码、未增加 Radix 或其他 UI 运行时依赖。

## 本批结果

- 6 类：文字、按钮、表单、导航、展示、反馈。
- 74 个目录示例：48 个文字效果、12 种按钮样式、14 个其他通用组件示例。
- 本次新增 12 个独立组件与 6 种按钮样式。通用独立组件合计 15 个，含原有 Button、Switch、Progress。
- 32 个 Registry 条目、30 个独立组件的直接/统一入口体积检查。

## 自定义

工作台按组件提供主题色、渐变第二色、文字色、表面色、边框色、圆角、字号和内间距。复选框与滑块的原生外观只提供可实际应用的控制；成功、警告、危险状态保留语义色。按钮的 size 会设定对应字号和间距，之后可以继续调整。

专属参数包含占位提示、输入类型、多行行数、选项列表、勾选状态、步长、数值、投影、说明、展开状态、占位行数、图形大小和动画时长。选项最多 8 项；骨架屏行数限制为 1–8。自定义值通过 CSS 变量写入示例，CSS 独立导入。

完整源码包含实际组件文件、实际 CSS 和当前配置的 Example.tsx。React 用法保留状态与事件处理，输入内容和选择值同步生成。所有复制示例均在隔离目录中执行并通过严格类型检查，文本通过 JSON JSX 字面量转义。

## 验证

`npm test`：源码精确性、全部自定义示例隔离运行/类型、Registry schema、安装依赖、ZIP 内容及单组件按需构建。

`npm run test:ui`：390px/1440px、正常/减少动画模式下的分类、按钮与开关交互、颜色和圆角同步、输入复制、标签页方向键和焦点、折叠展开、页面溢出。
