"use client";

import { useState } from "react";
import { NeonText, neonTextDefaults } from "@/components/text-effects/neon-text";
import { RainbowText, rainbowTextDefaults } from "@/components/text-effects/rainbow-text";
import { LongShadowText, longShadowTextDefaults } from "@/components/text-effects/long-shadow-text";
import { getBasicEffectCode, type BasicEffectId, type BasicOptions } from "@/lib/basic-effect-code";

export type { BasicEffectId } from "@/lib/basic-effect-code";
type Props = { effect: BasicEffectId; text: string; onTextChange: (value: string) => void; fontSize: number; onFontSizeChange: (value: number) => void; duration: number; onDurationChange: (value: number) => void; paused: boolean };
const defaults = { neon: neonTextDefaults, rainbow: rainbowTextDefaults, longshadow: longShadowTextDefaults };
const labels = { neon: "霓虹光晕", rainbow: "彩虹色带", longshadow: "长投影" };
type Range = [string, string, number, number, number, string];
const ranges: Record<BasicEffectId, Range[]> = {
  neon: [["glowRadius", "光晕半径", 0, 64, 1, "px"], ["intensity", "光晕强度", 0, 2, .05, "倍"]],
  rainbow: [["angle", "色带角度", 0, 360, 1, "°"], ["spread", "色带范围", 100, 500, 10, "%"]],
  longshadow: [["angle", "投影角度", 0, 360, 1, "°"], ["length", "投影长度", 0, 80, 1, "px"]],
};
const colors = { neon: [["color", "文字颜色"], ["glowColor", "光晕颜色"]], rainbow: [["color1", "色带 1"], ["color2", "色带 2"], ["color3", "色带 3"], ["color4", "色带 4"]], longshadow: [["color", "文字颜色"], ["shadowColor", "投影颜色"]] };

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  return <label className="color-control"><span>{label} <b>{value.toUpperCase()}</b></span><span className="color-input-row"><input type="color" value={value} onChange={event => { setDraft(null); onChange(event.target.value); }} /><input aria-label={`${label} HEX`} value={draft ?? value} aria-invalid={!/^#[0-9a-fA-F]{6}$/.test(draft ?? value)} onChange={event => { setDraft(event.target.value); if (/^#[0-9a-fA-F]{6}$/.test(event.target.value)) onChange(event.target.value); }} onBlur={() => setDraft(null)} /></span></label>;
}

export function BasicEffectWorkbench({ effect, text, onTextChange, fontSize, onFontSizeChange, duration, onDurationChange, paused }: Props) {
  const [values, setValues] = useState<BasicOptions>({ ...defaults[effect] });
  const [delay, setDelay] = useState(0);
  const [mode, setMode] = useState<"react" | "source" | "html">("react");
  const [replay, setReplay] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const [localPaused, setLocalPaused] = useState(false);
  const options = effect === "longshadow" ? values : { ...values, duration, delay, paused: paused || localPaused };
  const code = getBasicEffectCode(effect, text, options, fontSize)[mode];
  const change = (key: string, value: string | number | boolean) => { setValues(current => ({ ...current, [key]: value })); setCopyStatus(""); };
  const reset = () => { setValues({ ...defaults[effect] }); setDelay(0); setLocalPaused(false); onFontSizeChange(36); onDurationChange(1.8); setReplay(value => value + 1); setCopyStatus(""); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopyStatus("已复制 ✓"); }
    catch { setCopyStatus("复制失败，请选择下方代码手动复制"); }
  };
  const preview = effect === "neon"
    ? <NeonText {...options} key={replay}>{text}</NeonText>
    : effect === "rainbow" ? <RainbowText {...options} key={replay}>{text}</RainbowText>
      : <LongShadowText {...options} key={replay}>{text}</LongShadowText>;

  return <div className="highlight-workbench basic-workbench">
    <div className="workbench-stage">
      <div className="stage-heading"><span>实时预览</span><b>调节参数时预览保持可见</b></div>
      <div className="drawer-preview highlight-preview" style={{ fontSize: `${fontSize}px`, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{preview}</div>
      <div className="workbench-actions">{effect !== "longshadow" && <><button onClick={() => setReplay(value => value + 1)}>↻ 重播</button><button disabled={paused} onClick={() => setLocalPaused(value => !value)}>{paused ? "全局已暂停" : localPaused ? "播放动画" : "暂停动画"}</button></>}<button onClick={reset}>恢复默认</button></div>
      <dl className="stage-summary"><div><dt>效果</dt><dd>{labels[effect]}</dd></div><div><dt>字号</dt><dd>{fontSize}px</dd></div><div><dt>输出</dt><dd>3 种代码</dd></div></dl>
    </div>
    <div className="workbench-editor">
      <div className="editor-heading"><div><span>{labels[effect]}参数</span><b>预览与代码同步更新</b></div><button onClick={reset}>重置参数</button></div>
      <div className="drawer-controls highlight-controls">
        <label className="control-wide"><span>预览文字</span><input value={text} onChange={event => onTextChange(event.target.value)} /></label>
        <label><span>字号 <b>{fontSize}px</b></span><input type="range" min={24} max={64} value={fontSize} onChange={event => onFontSizeChange(Number(event.target.value))} /></label>
        {colors[effect].map(([key, label]) => <ColorControl key={key} label={label} value={String(values[key])} onChange={value => change(key, value)} />)}
        {ranges[effect].map(([key, label, min, max, step, unit]) => <label key={key}><span>{label} <b>{values[key]}{unit}</b></span><input type="range" min={min} max={max} step={step} value={Number(values[key])} onChange={event => change(key, Number(event.target.value))} /></label>)}
        {effect !== "longshadow" && <>
          <label><span>动画时长 <b>{duration.toFixed(1)}s</b></span><input type="range" min={.2} max={8} step={.1} value={duration} onChange={event => onDurationChange(Number(event.target.value))} /></label>
          <label><span>动画延迟 <b>{delay.toFixed(1)}s</b></span><input type="range" min={0} max={3} step={.1} value={delay} onChange={event => setDelay(Number(event.target.value))} /></label>
          <label><span>{effect === "neon" ? "呼吸动画" : "色带流动"}</span><select value={values.animated ? "yes" : "no"} onChange={event => change("animated", event.target.value === "yes")}><option value="yes">开启</option><option value="no">关闭</option></select></label>
        </>}
        {effect === "rainbow" && <label><span>流动方向</span><select value={String(values.direction)} onChange={event => change("direction", event.target.value)}><option value="left">向左</option><option value="right">向右</option></select></label>}
      </div>
      <p className="basic-effect-help">{effect === "longshadow" ? "0° 向右，90° 向下。硬边投影最多 80 层；请为投影预留空间。静态效果无需动画。" : effect === "neon" ? "适合深色背景上的标题和灯牌；减少动态效果时保留静态光晕。" : "适合短标题与海报；浏览器需支持文字背景裁剪，减少动态效果时保留静态色带。"}</p>
      <section className="generated-code">
        <div className="code-tabs">{(["react", "source", "html"] as const).map(value => <button key={value} className={mode === value ? "active" : ""} onClick={() => { setMode(value); setCopyStatus(""); }}>{value === "react" ? "React 用法" : value === "source" ? "完整源码" : "HTML + CSS"}</button>)}</div>
        <div className="code-box workbench-code"><div><span>{mode === "html" ? "HTML + CSS" : "TSX + CSS"}</span><button onClick={copy}>复制当前代码</button></div><pre><code>{code}</code></pre></div>
        <p role="status">{copyStatus}</p>
      </section>
    </div>
  </div>;
}
