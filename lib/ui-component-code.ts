import type { CSSProperties } from "react";
import type { ButtonVariant } from "../components/ui/button/Button";
import type { UIEntry } from "../components/site/ui-catalog";
import { uiSources } from "./ui-source-map";
import type { ConversationMessage } from "../components/ui/conversation/Conversation";

export type UIOptions = {
  label: string; description: string; placeholder: string; items: string;
  size: "small" | "medium" | "large"; variant: ButtonVariant;
  disabled: boolean; loading: boolean; checked: boolean; showValue: boolean; elevated: boolean; open: boolean; paused: boolean;
  value: number; step: number; rows: number; lines: number; thickness: number; duration: number;
  tone: "accent" | "info" | "success" | "warning" | "danger"; inputType: "text" | "email" | "password";
  accent: string; secondary: string; foreground: string; surface: string; border: string; onAccent: string;
  radius: number; fontSize: number; padding: number;
  speaker: "user" | "assistant"; showAvatar: boolean; chatHeight: number;
};
export function uiDefaults(entry: UIEntry): UIOptions {
  const darkButton = ["shiny", "neon", "border"].includes(entry.variant ?? "");
  return { speaker: "assistant", showAvatar: true, chatHeight: 220, label: entry.category === "AI" ? (["conversation", "chat-message"].includes(entry.kind) ? "AI 助手" : entry.kind === "thinking-indicator" ? "正在思考…" : entry.name) : entry.kind === "button" ? "立即体验" : entry.kind === "switch" || entry.kind === "checkbox" ? "启用通知" : entry.kind === "spinner" ? "加载中" : entry.kind === "accordion" ? "如何开始使用？" : entry.kind === "badge" ? "新版本" : entry.kind === "alert" ? "设置已保存" : "项目空间", description: entry.category === "AI" ? "你好，我可以帮你整理想法。这是本地示例内容，可在参数面板自由编辑。" : "打开参数面板，调节样式后复制完整源码。", placeholder: "请输入内容…", items: entry.category === "AI" ? "帮我整理思路\n解释这段代码\n写一个项目计划" : "概览\n动态\n设置", size: "medium", variant: entry.variant ?? "solid", disabled: false, loading: false, checked: true, showValue: true, elevated: false, open: false, paused: false, value: 68, step: 1, rows: 3, lines: 3, thickness: 10, duration: 2.5, tone: entry.kind === "alert" ? "info" : "accent", inputType: "text", accent: entry.variant === "danger" ? "#b42c45" : entry.variant === "neon" ? "#69dec0" : "#7758d8", secondary: "#b83c86", foreground: "#252333", surface: darkButton ? "#202131" : "#ffffff", border: "#b3aebb", onAccent: "#ffffff", radius: entry.variant === "pill" || entry.kind === "badge" ? 99 : 12, fontSize: 15, padding: 12 };
}
export function uiTheme(options: UIOptions): CSSProperties {
  return { "--zc-accent": options.accent, "--zc-secondary": options.secondary, "--zc-text": options.foreground, "--zc-on-accent": options.onAccent, "--zc-surface": options.surface, "--zc-border": options.border, "--zc-radius": `${options.radius}px`, "--zc-font-size": `${options.fontSize}px`, "--zc-padding": `${options.padding}px`, "--zc-duration": `${options.duration}s`, "--zc-track-height": `${options.thickness}px`, "--zc-spinner-size": `${options.thickness + 14}px`, "--zc-skeleton-height": `${options.thickness + 8}px`, "--zc-chat-height": `${options.chatHeight}px` } as CSSProperties;
}
export function uiItems(text: string) {
  return text.split("\n").map(value => value.trim()).filter(Boolean).slice(0, 8);
}
const literal = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
export function getUICode(entry: UIEntry, options: UIOptions, interaction: { text: string; selection: string; clicks: number; messages?: ConversationMessage[] } = { text: "", selection: "0", clicks: 0 }) {
  const definition = uiSources[entry.kind];
  const theme = ` style={${literal(uiTheme(options))} as CSSProperties}`;
  const disabled = ` disabled={${options.disabled}}`;
  const label = `{${literal(options.label)}}`;
  const items = uiItems(options.items);
  const props: Record<UIEntry["kind"], string> = {
    button: `variant="${options.variant}" size="${options.size}" loading={${options.loading}} paused={${options.paused}}${disabled} onClick={() => setCount(count => count + 1)}`,
    switch: `checked={checked} onChange={event => setChecked(event.target.checked)}${disabled}`,
    checkbox: `checked={checked} onChange={event => setChecked(event.target.checked)}${disabled}`,
    progress: `value={${options.value}} showValue={${options.showValue}} aria-label={${literal(options.label)}}`,
    input: `value={text} onChange={event => setText(event.target.value)} type="${options.inputType}" placeholder={${literal(options.placeholder)}} aria-label={${literal(options.label)}}${disabled}`,
    textarea: `value={text} onChange={event => setText(event.target.value)} rows={${options.rows}} placeholder={${literal(options.placeholder)}} aria-label={${literal(options.label)}}${disabled}`,
    select: `value={selection} onChange={event => setSelection(event.target.value)} options={${literal(items.map((label, index) => ({ value: String(index), label })))}} aria-label={${literal(options.label)}}${disabled}`,
    slider: `value={value} onChange={event => setValue(Number(event.target.value))} step={${options.step}} aria-label={${literal(options.label)}}${disabled}`,
    badge: `tone="${options.tone === "info" ? "accent" : options.tone}"`,
    card: `heading={${literal(options.label)}} description={${literal(options.description)}} elevated={${options.elevated}}`,
    alert: `heading={${literal(options.label)}} description={${literal(options.description)}} tone="${options.tone === "accent" ? "info" : options.tone}"`,
    spinner: `label={${literal(options.label)}} paused={${options.paused}}`,
    skeleton: `lines={${options.lines}} paused={${options.paused}} label={${literal(options.label)}}`,
    accordion: `heading={${literal(options.label)}} open={open} onToggle={event => setOpen(event.currentTarget.open)}`,
    tabs: `items={${literal(items.map(label => ({ label, content: `${label}：${options.description}` })))}} aria-label={${literal(options.label)}}`,
    "chat-message": `speaker="${options.speaker}" author={${literal(options.label)}} content={${literal(options.description)}} showAvatar={${options.showAvatar}}`,
    "prompt-input": `value={text} onValueChange={setText} onSubmit={setSent} label={${literal(options.label)}} placeholder={${literal(options.placeholder)}} disabled={${options.disabled}} busy={${options.loading}}`,
    "thinking-indicator": `label={${literal(options.label)}} paused={${options.paused}}`,
    "prompt-suggestions": `suggestions={${literal(items)}} label={${literal(options.label)}} disabled={${options.disabled}} onSelect={setSelected}`,
    "reasoning-panel": `label={${literal(options.label)}} content={${literal(options.description)}} busy={${options.loading}} open={open} onToggle={event => setOpen(event.currentTarget.open)}`,
    conversation: `title={${literal(options.label)}} welcome={${literal(options.description)}} reply={${literal(options.description)}} placeholder={${literal(options.placeholder)}} disabled={${options.disabled}} initialMessages={${literal(interaction.messages ?? [])}}`,
  };
  const name = definition.name;
  let jsx = `<${name} ${props[entry.kind]}${theme}${["button", "badge", "accordion"].includes(entry.kind) ? `>${entry.kind === "accordion" ? `{${literal(options.description)}}` : label}</${name}>` : " />"}`;
  let state = "";
  if (entry.kind === "button") { state = `  const [count, setCount] = useState(${interaction.clicks});\n`; jsx = `<>${jsx}<p role="status">已触发 {count} 次操作</p></>`; }
  if (["switch", "checkbox"].includes(entry.kind)) { state = `  const [checked, setChecked] = useState(${options.checked});\n`; jsx = `<label style={{ color: ${literal(options.foreground)}, fontSize: ${options.fontSize} }}>${jsx}${label}</label>`; }
  if (["input", "textarea"].includes(entry.kind)) state = `  const [text, setText] = useState(${literal(interaction.text)});\n`;
  if (entry.kind === "select") state = `  const [selection, setSelection] = useState(${literal(interaction.selection)});\n`;
  if (entry.kind === "slider") state = `  const [value, setValue] = useState(${options.value});\n`;
  if (entry.kind === "accordion") state = `  const [open, setOpen] = useState(${options.open});\n`;
  if (entry.kind === "reasoning-panel") state = `  const [open, setOpen] = useState(${options.open});\n`;
  if (entry.kind === "prompt-input") { state = `  const [text, setText] = useState(${literal(interaction.text)});\n  const [sent, setSent] = useState(${literal(interaction.selection === "0" ? "" : interaction.selection)});\n`; jsx = `<>${jsx}<p role="status">{sent ? "已提交：" + sent : "等待输入"}</p></>`; }
  if (entry.kind === "prompt-suggestions") { state = `  const [selected, setSelected] = useState(${literal(interaction.selection === "0" ? "" : interaction.selection)});\n`; jsx = `<>${jsx}<p role="status">{selected ? "已选择：" + selected : "选择一个问题"}</p></>`; }
  const react = `"use client";\nimport { ${state ? "useState, " : ""}type CSSProperties } from "react";\nimport { ${name} } from "./components/ui/${entry.kind}/${name}";\nimport "./components/ui/${entry.kind}/${entry.kind}.css";\n\nexport default function Example() {\n${state}  return (${jsx});\n}\n`;
  const source = `// components/ui/${entry.kind}/${name}.tsx\n${definition.source}\n\n/* components/ui/${entry.kind}/${entry.kind}.css */\n${definition.css}\n\n// Example.tsx\n${react}`;
  return { react, source, files: [{ path: `components/ui/${entry.kind}/${name}.tsx`, content: definition.source }, { path: `components/ui/${entry.kind}/${entry.kind}.css`, content: definition.css }, { path: "Example.tsx", content: react }] };
}
