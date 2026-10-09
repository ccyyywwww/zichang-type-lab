"use client";
import { useState } from "react";
import { getUICode, uiDefaults, type UIOptions } from "../../lib/ui-component-code";
import { UIRenderer, type UIInteraction } from "./UIRenderer";
import { uiCatalog, type UIEntry } from "./ui-catalog";
const initialInteraction: UIInteraction = { text: "", selection: "0", clicks: 0 };
export function UIPreview({ entry, paused = false }: { entry: UIEntry; paused?: boolean }) {
  const [options, setOptions] = useState(() => uiDefaults(entry));
  const [interaction, setInteraction] = useState(initialInteraction);
  return <div className="ui-preview-content"><UIRenderer entry={entry} options={{ ...options, paused }} onChange={change => setOptions(current => ({ ...current, ...change }))} interaction={interaction} onInteraction={change => setInteraction(current => ({ ...current, ...change }))} /></div>;
}
const colorFields = [["accent", "主题色"], ["secondary", "渐变第二色"], ["foreground", "文字颜色"], ["surface", "表面颜色"], ["border", "边框颜色"], ["onAccent", "按钮/选中文字"]] as const;
const aiDescriptions: Partial<Record<UIEntry["kind"], string>> = {
  conversation: "title、welcome、reply、placeholder、disabled；initialMessages 或 messages / onMessagesChange 控制记录；onSend 用于外部消息服务。本地默认回复为固定示例。",
  "chat-message": "speaker：user / assistant；author、content、showAvatar；消息按纯文本显示。",
  "prompt-input": "value / defaultValue、onValueChange、onSubmit、placeholder、disabled、busy；Enter 发送，Shift+Enter 换行，输入法组合输入期间不发送。",
  "thinking-indicator": "label、paused；三点 CSS 动画遵循减少动画偏好。",
  "prompt-suggestions": "suggestions：字符串数组；onSelect：选择回调；disabled、label。",
  "reasoning-panel": "label、content、busy，以及原生 details 的 open / onToggle。展示调用方提供的摘要内容。",
};
const descriptions: Partial<Record<UIEntry["kind"], string>> = { button: "variant：18 种样式；size：small / medium / large；loading、disabled、paused；原生按钮属性与事件，默认 type=button。", switch: "checked / defaultChecked、onChange、disabled、name、value；请提供 label 或 aria-label。", progress: "value、max（默认 100）、showValue；限制数值范围并提供无障碍进度属性。", input: "原生 input 属性，支持 type、value、onChange、placeholder、disabled。", textarea: "原生 textarea 属性，rows 指定行数，支持 value、onChange、disabled。", select: "options 为 value / label / disabled 列表；支持原生 select 属性和 children。", checkbox: "原生 checkbox 属性：checked、defaultChecked、onChange、name、disabled。", slider: "原生 range 属性：value、min、max、step、onChange；支持方向键。", badge: "tone：accent / success / warning / danger；children 指定内容。", card: "heading、description、elevated；children 用于组合内容。", alert: "heading、description、tone；静态提示默认不自动播报，动态重要消息可设置 role=alert。", spinner: "label、paused；role=status 提供可读加载文案。", skeleton: "lines 限制为 1–8；label、paused；装饰性占位条对辅助技术隐藏。", accordion: "heading、children，以及原生 details 的 open、onToggle 属性。", tabs: "items：label / content 列表；index / defaultIndex、onIndexChange；支持左右方向键和 Home / End。" };
export function UIWorkbench({ entry, paused }: { entry: UIEntry; paused: boolean }) {
  const [previewKey, setPreviewKey] = useState(0);
  const [options, setOptions] = useState(() => uiDefaults(entry));
  const [interaction, setInteraction] = useState(initialInteraction);
  const [mode, setMode] = useState<"react" | "source">("react");
  const [status, setStatus] = useState("");
  const effective = { ...options, paused: paused || options.paused };
  const code = getUICode(entry, effective, interaction)[mode];
  const change = (values: Partial<UIOptions>) => { setOptions(current => ({ ...current, ...values })); setStatus(""); };
  const reset = () => { setOptions(uiDefaults(entry)); setInteraction(initialInteraction); setPreviewKey(value => value + 1); setStatus(""); };
  const range = (key: "value" | "step" | "rows" | "lines" | "thickness" | "duration" | "radius" | "fontSize" | "padding" | "chatHeight", label: string, min: number, max: number, step = 1) => <label key={key}><span>{label} <b>{options[key]}</b></span><input aria-label={label} type="range" min={min} max={max} step={step} value={options[key]} onChange={event => change({ [key]: Number(event.target.value) })} /></label>;
  const toggle = (key: "loading" | "disabled" | "checked" | "showValue" | "elevated" | "open" | "showAvatar", label: string) => <label key={key}><span>{label}</span><input aria-label={label} type="checkbox" checked={options[key]} onChange={event => change({ [key]: event.target.checked })} /></label>;
  const interactive = ["button", "switch", "input", "textarea", "select", "checkbox", "slider", "conversation", "prompt-input", "prompt-suggestions"].includes(entry.kind);
  const animated = ["button", "spinner", "skeleton", "thinking-indicator"].includes(entry.kind);
  const hasSurface = ["input", "textarea", "select", "card", "alert", "tabs", "accordion", "conversation", "chat-message", "prompt-input", "prompt-suggestions", "reasoning-panel"].includes(entry.kind);
  const applicableColors = colorFields.filter(([key]) => key === "accent" || key === "foreground" && !["button", "badge", "skeleton", "checkbox", "slider"].includes(entry.kind) || key === "secondary" && ["button", "progress"].includes(entry.kind) || key === "surface" && (hasSurface || entry.kind === "button") || key === "border" && hasSurface || key === "onAccent" && ["button", "badge", "tabs", "conversation", "chat-message", "prompt-input"].includes(entry.kind));
  return <div className="highlight-workbench basic-workbench ui-workbench">
    <div className="workbench-stage"><div className="stage-heading"><span>实时预览</span><b>样式与参数同步</b></div><div className="drawer-preview ui-detail-preview"><div className="ui-preview-content"><UIRenderer key={previewKey} entry={entry} options={effective} onChange={change} interaction={interaction} onInteraction={values => setInteraction(current => ({ ...current, ...values }))} /></div></div><div className="workbench-actions"><button onClick={reset}>恢复默认</button>{animated && <button disabled={paused} onClick={() => change({ paused: !options.paused })}>{paused ? "全局已暂停" : options.paused ? "播放动画" : "暂停动画"}</button>}</div><dl className="stage-summary"><div><dt>组件</dt><dd>{entry.en}</dd></div><div><dt>主题色</dt><dd>{options.accent}</dd></div><div><dt>输出</dt><dd>用法与完整源码</dd></div></dl></div>
    <div className="workbench-editor"><div className="editor-heading"><div><span>{entry.name}参数</span><b>自定义后复制到自己的项目</b></div><button onClick={reset}>重置参数</button></div>
      <div className="drawer-controls highlight-controls">
        <label className="control-wide"><span>标签文字 / 无障碍名称</span><input value={options.label} onChange={event => change({ label: event.target.value })} /></label>
        {entry.kind === "button" && <><label><span>按钮样式</span><select value={options.variant} onChange={event => { const variant = event.target.value as UIOptions["variant"]; const palette = uiDefaults({ ...entry, variant }); change({ variant, accent: palette.accent, surface: palette.surface, radius: palette.radius }); }}>{uiCatalog.filter(item => item.kind === "button").map(item => <option key={item.variant} value={item.variant}>{item.name} / {item.en}</option>)}</select></label><label><span>尺寸</span><select value={options.size} onChange={event => { const size = event.target.value as UIOptions["size"]; change({ size, fontSize: size === "small" ? 13 : size === "large" ? 18 : 15, padding: size === "small" ? 8 : size === "large" ? 16 : 12 }); }}><option value="small">小 / Small</option><option value="medium">中 / Medium</option><option value="large">大 / Large</option></select></label>{toggle("loading", "加载状态")}</>}
        {interactive && toggle("disabled", "禁用")}
        {entry.kind === "chat-message" && <><label><span>消息角色</span><select value={options.speaker} onChange={event => change({ speaker: event.target.value as UIOptions["speaker"] })}><option value="assistant">助手 / Assistant</option><option value="user">用户 / User</option></select></label>{toggle("showAvatar", "显示头像")}</>}
        {entry.kind === "conversation" && range("chatHeight", "对话记录最大高度（px）", 100, 400, 10)}
        {["prompt-input", "reasoning-panel"].includes(entry.kind) && toggle("loading", "处理中")}
        {entry.kind === "reasoning-panel" && toggle("open", "展开")}
        {["switch", "checkbox"].includes(entry.kind) && toggle("checked", "开启 / 勾选")}
        {["progress", "slider"].includes(entry.kind) && range("value", "数值", 0, 100)}
        {entry.kind === "progress" && toggle("showValue", "显示数值")}
        {entry.kind === "slider" && range("step", "步长", 1, 20)}
        {["input", "textarea", "prompt-input", "conversation"].includes(entry.kind) && <label className="control-wide"><span>占位提示</span><input value={options.placeholder} onChange={event => change({ placeholder: event.target.value })} /></label>}
        {entry.kind === "input" && <label><span>输入类型</span><select value={options.inputType} onChange={event => change({ inputType: event.target.value as UIOptions["inputType"] })}><option value="text">文字 / Text</option><option value="email">邮箱 / Email</option><option value="password">密码 / Password</option></select></label>}
        {entry.kind === "textarea" && range("rows", "行数", 2, 8)}
        {["select", "tabs", "prompt-suggestions"].includes(entry.kind) && <label className="control-wide"><span>选项，每行一项（最多 8 项）</span><textarea value={options.items} onChange={event => change({ items: event.target.value })} /></label>}
        {["card", "alert", "tabs", "accordion", "conversation", "chat-message", "reasoning-panel"].includes(entry.kind) && <label className="control-wide"><span>说明内容 / 消息文本</span><textarea value={options.description} onChange={event => change({ description: event.target.value })} /></label>}
        {["badge", "alert"].includes(entry.kind) && <label><span>语义样式</span><select value={options.tone} onChange={event => change({ tone: event.target.value as UIOptions["tone"] })}><option value={entry.kind === "alert" ? "info" : "accent"}>主题色 / Accent</option><option value="success">成功 / Success</option><option value="warning">警告 / Warning</option><option value="danger">危险 / Danger</option></select></label>}
        {entry.kind === "card" && toggle("elevated", "投影")}{entry.kind === "accordion" && toggle("open", "展开")}
        {entry.kind === "skeleton" && range("lines", "占位条数量", 1, 8)}
        {["spinner", "skeleton", "progress"].includes(entry.kind) && range("thickness", "图形厚度 / 大小", 2, 40)}
        {animated && range("duration", "动画时长（秒）", .2, 8, .1)}
      </div>
      <h3>自定义外观</h3><div className="drawer-controls highlight-controls">
        {applicableColors.map(([key, label]) => <label className="color-control" key={key}><span>{label} <b>{options[key]}</b></span><input type="color" aria-label={label} value={options[key]} onChange={event => change({ [key]: event.target.value })} /></label>)}
        {!["checkbox", "slider", "switch", "spinner"].includes(entry.kind) && range("radius", "圆角（px）", 0, 99)}
        {!["skeleton", "checkbox", "slider"].includes(entry.kind) && range("fontSize", "字号（px）", 12, 24)}
        {["button", "input", "textarea", "select", "card", "alert", "tabs", "accordion", "badge", "conversation", "chat-message", "prompt-input", "prompt-suggestions", "reasoning-panel"].includes(entry.kind) && range("padding", "内间距（px）", 4, 32)}
      </div><p className="basic-effect-help">自定义值写入 CSS 变量，复制后无需本站主题。语义色（成功、警告、危险）保留固定色。原生复选框和滑块的外观由浏览器部分控制。</p>
      <h3>Props</h3><p className="basic-effect-help">{descriptions[entry.kind] ?? aiDescriptions[entry.kind]} 所有组件均支持 style、className；CSS 变量用于自定义外观。</p>
      <section className="generated-code"><div className="code-tabs"><button className={mode === "react" ? "active" : ""} onClick={() => { setMode("react"); setStatus(""); }}>React 用法</button><button className={mode === "source" ? "active" : ""} onClick={() => { setMode("source"); setStatus(""); }}>完整源码</button></div><div className="code-box workbench-code"><div><span>TSX + CSS</span><button onClick={async () => { try { await navigator.clipboard.writeText(code); setStatus("已复制 ✓"); } catch { setStatus("复制失败，请手动选择代码"); } }}>复制当前代码</button></div><pre><code>{code}</code></pre></div><p role="status">{status}</p></section>
    </div>
  </div>;
}
