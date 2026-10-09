# AI 对话组件（本地开发）

参考 [AI Elements Conversation](https://elements.ai-sdk.dev/components/conversation)、[Prompt Input](https://elements.ai-sdk.dev/components/prompt-input)、[Suggestion](https://elements.ai-sdk.dev/components/suggestion) 的组件范围；这里使用独立 React / HTML / CSS 实现，未添加 AI SDK 或联网服务。

| 组件 | 用途 | 自定义 |
| --- | --- | --- |
| Conversation | 完整对话框 | 标题、欢迎/演示回复、消息记录、输入提示、最大记录高度、禁用、主题样式 |
| ChatMessage | 用户/助手气泡 | 角色、作者、文本、头像、配色、圆角、字号、间距 |
| PromptInput | 消息输入 | 输入值、提示文字、发送回调、处理中/禁用、主题样式 |
| ThinkingIndicator | 思考状态 | 文案、主题色、动画速度、暂停 |
| PromptSuggestions | 问题建议 | 列表、选择回调、禁用、主题样式 |
| ReasoningPanel | 过程摘要 | 摘要内容、标题、展开、处理中、主题样式 |

首页 AI 分类包含真实交互。完整对话框默认添加用户消息与固定本地回复；明确标注本地演示。提供 onSend 时，不生成模拟回复，消息可由 messages / onMessagesChange 管理。过程摘要仅展示调用方提供的文本。

## 基本用法

```tsx
import { Conversation } from "./components/ui/conversation/Conversation";
import "./components/ui/conversation/conversation.css";
<Conversation title="写作助手" welcome="告诉我你想写什么。" />
<Conversation title="代码助手" reply="这是本地代码助手的示例回复。" />
```

```tsx
"use client";
import { useState } from "react";
import { Conversation, type ConversationMessage } from "./components/ui/conversation/Conversation";
import "./components/ui/conversation/conversation.css";

export default function Example() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  return <Conversation messages={messages} onMessagesChange={setMessages}
    onSend={text => console.log("交给应用的消息服务：", text)} />;
}
```

onSend 是应用接入点；应用收到实际回复后将 assistant 消息追加到 messages。示例没有调用外部服务。

PromptInput 的 onSubmit 接收裁剪后的文本。Enter 发送，Shift+Enter 留给原生换行；IME 组合输入期间的 Enter 不触发发送。空白、禁用和处理中状态无法发送。组件支持受控与非受控输入。

消息按纯文本渲染，保留换行，长链接不会撑宽气泡。样式通过 CSS 变量自定义，组件只需要同目录 CSS。完整源码直接读取实际文件，并附带当前配置和已有记录的 Example.tsx。

## 详情错位修复

720px 时原两栏网格的最小宽度大于抽屉可用宽度，源码和控件横向溢出。现在按抽屉实际宽度使用容器查询切换单栏；源码只在自身滚动区滚动，预览仍固定可见。

通用预览原先继承文字特效的 nowrap、粗字重与紧字距，导致长说明/消息被裁切；现已独立设置普通排版、换行和垂直滚动。

真实浏览器覆盖 390、720、820、1024、1440px 的正常/减少动画模式，并打开文字与通用组件的完整源码，检查抽屉、预览和参数边界。AI 回归包含本地发送、消息复制、重置、输入法保护、建议选择及减少动画。
