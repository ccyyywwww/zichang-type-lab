"use client";

import { useState } from "react";
import { GlitchText, glitchTextDefaults } from "@/components/text-effects/glitch-text";
import { MagnetText, magnetTextDefaults } from "@/components/text-effects/magnet-text";
import { getInteractionEffectCode, type InteractionEffectId, type InteractionOptions } from "@/lib/interaction-effect-code";

export type { InteractionEffectId } from "@/lib/interaction-effect-code";
type Props = { effect: InteractionEffectId; text: string; onTextChange: (value: string) => void; fontSize: number; onFontSizeChange: (value: number) => void; duration: number; onDurationChange: (value: number) => void; paused: boolean };
const defaults = { glitch: glitchTextDefaults, magnet: magnetTextDefaults };
const labels = { glitch: "信号故障", magnet: "字距磁吸" };
type Range = [string, string, number, number, number, string];
const ranges: Record<InteractionEffectId, Range[]> = {
  glitch: [["offset", "色差偏移", 0, 16, 1, "px"], ["jitter", "抖动距离", 0, 8, .5, "px"], ["skew", "倾斜角度", 0, 12, .5, "°"]],
  magnet: [["restSpacing", "初始字距", -.1, .5, .01, "em"], ["activeSpacing", "聚拢字距", -.1, .5, .01, "em"], ["lift", "抬升距离", 0, 16, 1, "px"]],
};
const colors = { glitch: [["color", "文字颜色"], ["primaryColor", "左侧色差"], ["secondaryColor", "右侧色差"]], magnet: [["color", "文字颜色"], ["activeColor", "触发颜色"]] };
function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  return <label className="color-control"><span>{label} <b>{value.toUpperCase()}</b></span><span className="color-input-row"><input type="color" value={value} onChange={event => { setDraft(null); onChange(event.target.value); }} /><input aria-label={`${label} HEX`} value={draft ?? value} aria-invalid={!/^#[0-9a-fA-F]{6}$/.test(draft ?? value)} onChange={event => { setDraft(event.target.value); if (/^#[0-9a-fA-F]{6}$/.test(event.target.value)) onChange(event.target.value); }} onBlur={() => setDraft(null)} /></span></label>;
}

export function InteractionEffectWorkbench({ effect, text, onTextChange, fontSize, onFontSizeChange, duration, onDurationChange, paused }: Props) {
  const [values, setValues] = useState<InteractionOptions>({ ...defaults[effect] });
  const [localPaused, setLocalPaused] = useState(false);
  const [active, setActive] = useState(false);
  const [replay, setReplay] = useState(0);
  const [mode, setMode] = useState<"react" | "source" | "html">("react");
  const [copyStatus, setCopyStatus] = useState("");
  const options = { ...values, duration, paused: paused || localPaused, active };
  const code = getInteractionEffectCode(effect, text, options, fontSize)[mode];
  const change = (key: string, value: string | number | boolean) => { setValues(current => ({ ...current, [key]: value })); setCopyStatus(""); };
  const reset = () => { setValues({ ...defaults[effect] }); setActive(false); setLocalPaused(false); setReplay(value => value + 1); onFontSizeChange(36); onDurationChange(defaults[effect].duration); setCopyStatus(""); };
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopyStatus("已复制 ✓"); } catch { setCopyStatus("复制失败，请选择代码手动复制"); } };

  return <div className="highlight-workbench basic-workbench interaction-workbench">
    <div className="workbench-stage">
      <div className="stage-heading"><span>实时预览</span><b>悬停或按 Tab 聚焦文字</b></div>
      <div className="drawer-preview highlight-preview" style={{ fontSize: `${fontSize}px` }}>{effect === "glitch" ? <GlitchText key={replay} {...options}>{text}</GlitchText> : <MagnetText key={replay} {...options}>{text}</MagnetText>}</div>
      <div className="workbench-actions">
        <button aria-pressed={active} onClick={() => setActive(value => !value)}>{active ? "取消锁定" : "锁定效果"}</button>
        <button disabled={paused} onClick={() => setLocalPaused(value => !value)}>{paused ? "全局已暂停" : localPaused ? "恢复互动" : "暂停互动"}</button>
        <button onClick={reset}>恢复默认</button>
      </div>
      <dl className="stage-summary"><div><dt>触发</dt><dd>{values.trigger === "always" ? "持续显示" : "悬停 / 聚焦"}</dd></div><div><dt>字号</dt><dd>{fontSize}px</dd></div><div><dt>输出</dt><dd>3 种代码</dd></div></dl>
    </div>
    <div className="workbench-editor">
      <div className="editor-heading"><div><span>{labels[effect]}参数</span><b>固定预览 · 代码同步更新</b></div><button onClick={reset}>重置参数</button></div>
      <div className="drawer-controls highlight-controls">
        <label className="control-wide"><span>预览文字</span><input value={text} maxLength={60} onChange={event => onTextChange(event.target.value)} /></label>
        <label><span>字号 <b>{fontSize}px</b></span><input type="range" min={24} max={64} value={fontSize} onChange={event => onFontSizeChange(Number(event.target.value))} /></label>
        <label><span>触发方式</span><select value={String(values.trigger)} onChange={event => change("trigger", event.target.value)}><option value="hover">悬停或键盘聚焦</option><option value="always">持续显示</option></select></label>
        {colors[effect].map(([key, label]) => <ColorControl key={key} label={label} value={String(values[key])} onChange={value => change(key, value)} />)}
        {ranges[effect].map(([key, label, min, max, step, unit]) => <label key={key}><span>{label} <b>{values[key]}{unit}</b></span><input type="range" min={min} max={max} step={step} value={Number(values[key])} onChange={event => change(key, Number(event.target.value))} /></label>)}
        <label><span>{effect === "glitch" ? "循环时长" : "过渡时长"} <b>{duration.toFixed(1)}s</b></span><input type="range" min={.2} max={8} step={.1} value={duration} onChange={event => onDurationChange(Number(event.target.value))} /></label>
        <label><span>触发延迟 <b>{Number(values.delay).toFixed(1)}s</b></span><input type="range" min={0} max={3} step={.1} value={Number(values.delay)} onChange={event => change("delay", Number(event.target.value))} /></label>
      </div>
      <p className="basic-effect-help">{effect === "glitch" ? "适合科技感短标题。悬停或聚焦触发错位色差与抖动；减少动态效果时保留静态色差。" : "适合单行短标题。字距变化不改变占用宽度，空间按较大字距预留。减少动态效果时保留初始字距；需要支持 Intl.Segmenter 的现代浏览器才能完整处理 emoji。"} 可锁定效果以便触屏调参，暂停互动恢复静态文字。</p>
      <section className="generated-code">
        <div className="code-tabs">{(["react", "source", "html"] as const).map(value => <button key={value} className={mode === value ? "active" : ""} onClick={() => { setMode(value); setCopyStatus(""); }}>{value === "react" ? "React 用法" : value === "source" ? "完整源码" : "HTML + CSS"}</button>)}</div>
        <div className="code-box workbench-code"><div><span>{mode === "html" ? "HTML + CSS" : "TSX + CSS"}</span><button onClick={copy}>复制当前代码</button></div><pre><code>{code}</code></pre></div>
        <p role="status">{copyStatus}</p>
      </section>
    </div>
  </div>;
}
