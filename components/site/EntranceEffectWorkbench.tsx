"use client";

import { useState } from "react";
import { BlurText, ScaleText, SlideText } from "@/components/text-effects";

import { getCopyEffectCode } from "@/lib/copy-effect-code";

export type EntranceEffectId = "slide" | "blur" | "scale";
type CodeMode = "react" | "source" | "html";
type Values = Record<string, number | string>;
type Props = { effect: EntranceEffectId; text: string; onTextChange: (value: string) => void; fontSize: number; onFontSizeChange: (value: number) => void; duration: number; onDurationChange: (value: number) => void; paused: boolean };

const definitions = {
  slide: { label: "滑入参数", sublabel: "方向、距离与错峰", defaults: { direction: "up", distance: 34, stagger: .06, delay: 0, opacity: 0 }, controls: [["distance", "移动距离", 0, 120, 1, "px"], ["stagger", "字符间隔", 0, .25, .005, "s"], ["delay", "开始延迟", 0, 2, .05, "s"], ["opacity", "初始透明度", 0, 1, .05, ""]] },
  blur: { label: "模糊参数", sublabel: "模糊、位移与错峰", defaults: { direction: "up", blur: 12, distance: 18, stagger: .05, delay: 0, opacity: 0 }, controls: [["blur", "模糊半径", 0, 40, 1, "px"], ["distance", "移动距离", 0, 80, 1, "px"], ["stagger", "字符间隔", 0, .25, .005, "s"], ["delay", "开始延迟", 0, 2, .05, "s"], ["opacity", "初始透明度", 0, 1, .05, ""]] },
  scale: { label: "缩放参数", sublabel: "起始比例与回弹", defaults: { initialScale: .45, overshoot: 1.16, stagger: .055, delay: 0, opacity: 0 }, controls: [["initialScale", "起始比例", 0, 2, .05, "×"], ["overshoot", "回弹幅度", 1, 1.8, .02, "×"], ["stagger", "字符间隔", 0, .25, .005, "s"], ["delay", "开始延迟", 0, 2, .05, "s"], ["opacity", "初始透明度", 0, 1, .05, ""]] },
} as const;

export function EntranceEffectWorkbench({ effect, text, onTextChange, fontSize, onFontSizeChange, duration, onDurationChange, paused }: Props) {
  const definition = definitions[effect]; const [values, setValues] = useState<Values>({ ...definition.defaults }); const [mode, setMode] = useState<CodeMode>("react"); const [copied, setCopied] = useState(false); const [key, setKey] = useState(0);
  const { opacity, ...effectOptions } = values;
  const code = getCopyEffectCode(effect, text, { ...effectOptions, initialOpacity: Number(opacity), duration, paused }, fontSize)[mode];
  const reset = () => { setValues({ ...definition.defaults }); onFontSizeChange(36); onDurationChange(effect === "blur" ? .8 : .7); setKey((v) => v + 1); };
  const shared = { key, duration, delay: Number(values.delay), stagger: Number(values.stagger), initialOpacity: Number(values.opacity), paused, children: text };
  const preview = effect === "slide" ? <SlideText {...shared} direction={values.direction as "up"} distance={Number(values.distance)} /> : effect === "blur" ? <BlurText {...shared} direction={values.direction as "up"} blur={Number(values.blur)} distance={Number(values.distance)} /> : <ScaleText {...shared} initialScale={Number(values.initialScale)} overshoot={Number(values.overshoot)} />;
  const copy = async () => { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return <div className="highlight-workbench visual-workbench"><div className="workbench-stage"><div className="stage-heading"><span>实时预览</span><b>修改参数时自动更新</b></div><div className="drawer-preview highlight-preview" style={{ fontSize: `${fontSize}px` }}>{preview}</div><div className="workbench-actions"><button onClick={() => setKey((v) => v + 1)}>↻ 重播</button><button onClick={reset}>恢复默认</button></div><dl className="stage-summary"><div><dt>效果</dt><dd>{definition.sublabel}</dd></div><div><dt>字号</dt><dd>{fontSize}px</dd></div><div><dt>参数</dt><dd>{definition.controls.length + (effect === "scale" ? 0 : 1)} 项</dd></div><div><dt>输出</dt><dd>3 种代码</dd></div></dl></div>
    <div className="workbench-editor"><div className="editor-heading"><div><span>{definition.label}</span><b>{definition.sublabel}</b></div><button onClick={reset}>重置参数</button></div><div className="drawer-controls highlight-controls"><label className="control-wide"><span>预览文字</span><input value={text} maxLength={24} onChange={(e) => onTextChange(e.target.value || " ")} /></label><label><span>字号 <b>{fontSize}px</b></span><input type="range" min="24" max="64" value={fontSize} onChange={(e) => onFontSizeChange(Number(e.target.value))} /></label><label><span>动画时长 <b>{duration.toFixed(1)}s</b></span><input type="range" min="0.2" max="8" step="0.1" value={duration} onChange={(e) => onDurationChange(Number(e.target.value))} /></label>
      {effect !== "scale" && <fieldset className="direction-control control-wide"><legend>进入方向</legend><div>{(effect === "slide" ? [["up","向上"],["down","向下"],["left","向左"],["right","向右"]] : [["up","向上"],["down","向下"]]).map(([value,label]) => <button key={value} type="button" className={values.direction === value ? "active" : ""} onClick={() => setValues((v) => ({ ...v, direction:value }))}>{label}</button>)}</div></fieldset>}
      {definition.controls.map(([name,label,min,max,step,unit]) => <label key={name}><span>{label} <b>{values[name]}{unit}</b></span><input type="range" min={min} max={max} step={step} value={values[name]} onChange={(e) => setValues((v) => ({ ...v, [name]:Number(e.target.value) }))} /></label>)}</div>
      <section className="generated-code"><div className="code-tabs" role="tablist">{(["react","source","html"] as CodeMode[]).map((item) => <button key={item} role="tab" aria-selected={mode === item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item === "react" ? "React 用法" : item === "source" ? "完整源码" : "HTML + CSS"}</button>)}</div><div className="code-box workbench-code"><div><span>{mode === "html" ? "HTML + CSS" : "TSX"}</span><button onClick={copy}>{copied ? "已复制 ✓" : "复制当前代码"}</button></div><pre><code>{code}</code></pre></div><p className="code-hint">参数与代码实时同步；独立组件不依赖展示站。</p></section></div></div>;
}
