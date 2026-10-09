"use client";

import { useState } from "react";
import { GradientText, OutlineText, UnderlineText } from "@/components/text-effects";

import { getCopyEffectCode } from "@/lib/copy-effect-code";

export type VisualEffectId = "gradient" | "outline" | "underline";
type CodeMode = "react" | "source" | "html";
type OptionValue = string | number;
type Options = Record<string, OptionValue>;

type Props = {
  effect: VisualEffectId;
  text: string;
  onTextChange: (value: string) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  duration: number;
  onDurationChange: (value: number) => void;
  paused: boolean;
};

const definitions: Record<VisualEffectId, {
  label: string;
  sublabel: string;
  defaults: Options;
  controls: Array<{ key: string; label: string; type: "color" | "range" | "choice"; min?: number; max?: number; step?: number; unit?: string; choices?: Array<[string, string]> }>;
}> = {
  gradient: {
    label: "渐变参数",
    sublabel: "颜色与流动",
    defaults: { colorA: "#ff3f7f", colorB: "#7c5cff", colorC: "#2dddc2", angle: 90, spread: 260, direction: "forward" },
    controls: [
      { key: "colorA", label: "起始颜色", type: "color" },
      { key: "colorB", label: "中间颜色", type: "color" },
      { key: "colorC", label: "结束颜色", type: "color" },
      { key: "angle", label: "渐变角度", type: "range", min: 0, max: 360, unit: "°" },
      { key: "spread", label: "流动范围", type: "range", min: 120, max: 500, unit: "%" },
      { key: "direction", label: "流动方向", type: "choice", choices: [["forward", "正向"], ["reverse", "反向"]] },
    ],
  },
  outline: {
    label: "描边参数",
    sublabel: "轮廓与阴影",
    defaults: { strokeColor: "#f4f2e9", strokeWidth: 1.5, fillColor: "#000000", shadowColor: "#d9ff57", shadowX: 4, shadowY: 4 },
    controls: [
      { key: "strokeColor", label: "描边颜色", type: "color" },
      { key: "fillColor", label: "填充颜色", type: "color" },
      { key: "shadowColor", label: "阴影颜色", type: "color" },
      { key: "strokeWidth", label: "描边宽度", type: "range", min: 0, max: 8, step: .1, unit: "px" },
      { key: "shadowX", label: "水平阴影", type: "range", min: -20, max: 20, unit: "px" },
      { key: "shadowY", label: "垂直阴影", type: "range", min: -20, max: 20, unit: "px" },
    ],
  },
  underline: {
    label: "线条参数",
    sublabel: "范围与位置",
    defaults: { lineColor: "#d9ff57", thickness: 4, width: 100, offset: 8, radius: 5, direction: "center" },
    controls: [
      { key: "lineColor", label: "线条颜色", type: "color" },
      { key: "thickness", label: "线条粗细", type: "range", min: 1, max: 20, unit: "px" },
      { key: "width", label: "线条范围", type: "range", min: 10, max: 120, unit: "%" },
      { key: "offset", label: "文字间距", type: "range", min: -5, max: 30, unit: "px" },
      { key: "radius", label: "线条圆角", type: "range", min: 0, max: 30, unit: "px" },
      { key: "direction", label: "绘制方向", type: "choice", choices: [["left", "从左"], ["center", "从中心"], ["right", "从右"]] },
    ],
  },
};

export function VisualEffectWorkbench({ effect, text, onTextChange, fontSize, onFontSizeChange, duration, onDurationChange, paused }: Props) {
  const definition = definitions[effect];
  const [options, setOptions] = useState<Options>({ ...definition.defaults });
  const [codeMode, setCodeMode] = useState<CodeMode>("react");
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const effectOptions = effect === "gradient"
    ? { colors: [String(options.colorA), String(options.colorB), String(options.colorC)], angle: Number(options.angle), spread: Number(options.spread), direction: options.direction, duration, paused }
    : effect === "outline" ? options : { ...options, trigger: "mount", duration, paused };
  const code = getCopyEffectCode(effect, text, effectOptions, fontSize)[codeMode];

  const setOption = (key: string, value: OptionValue) => setOptions((current) => ({ ...current, [key]: value }));
  const reset = () => { setOptions({ ...definition.defaults }); onFontSizeChange(36); onDurationChange(effect === "underline" ? .35 : 2.4); setPreviewKey((key) => key + 1); };
  const copy = async () => { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };

  const preview = effect === "gradient"
    ? <GradientText key={previewKey} colors={[String(options.colorA), String(options.colorB), String(options.colorC)]} angle={Number(options.angle)} spread={Number(options.spread)} direction={options.direction as "forward" | "reverse"} duration={duration} paused={paused}>{text}</GradientText>
    : effect === "outline"
      ? <OutlineText key={previewKey} strokeColor={String(options.strokeColor)} strokeWidth={Number(options.strokeWidth)} fillColor={String(options.fillColor)} shadowColor={String(options.shadowColor)} shadowX={Number(options.shadowX)} shadowY={Number(options.shadowY)}>{text}</OutlineText>
      : <UnderlineText key={previewKey} lineColor={String(options.lineColor)} thickness={Number(options.thickness)} width={Number(options.width)} offset={Number(options.offset)} radius={Number(options.radius)} direction={options.direction as "left" | "center" | "right"} trigger="mount" duration={duration} paused={paused}>{text}</UnderlineText>;

  return (
    <div className="highlight-workbench visual-workbench">
      <div className="workbench-stage">
        <div className="stage-heading"><span>实时预览</span><b>修改参数时自动更新</b></div>
        <div className="drawer-preview highlight-preview" style={{ fontSize: `${fontSize}px` }}>{preview}</div>
        <div className="workbench-actions"><button onClick={() => setPreviewKey((key) => key + 1)}>↻ 重播</button><button onClick={reset}>恢复默认</button></div>
        <dl className="stage-summary">
          <div><dt>效果</dt><dd>{definition.sublabel}</dd></div>
          <div><dt>字号</dt><dd>{fontSize}px</dd></div>
          <div><dt>参数</dt><dd>{definition.controls.length} 项</dd></div>
          <div><dt>输出</dt><dd>3 种代码</dd></div>
        </dl>
      </div>

      <div className="workbench-editor">
        <div className="editor-heading"><div><span>{definition.label}</span><b>{definition.sublabel}</b></div><button onClick={reset}>重置参数</button></div>
        <div className="drawer-controls highlight-controls">
          <label className="control-wide"><span>预览文字</span><input value={text} maxLength={24} onChange={(event) => onTextChange(event.target.value || " ")} /></label>
          <label><span>字号 <b>{fontSize}px</b></span><input type="range" min="24" max="64" value={fontSize} onChange={(event) => onFontSizeChange(Number(event.target.value))} /></label>
          {effect !== "outline" && <label><span>动画时长 <b>{duration.toFixed(1)}s</b></span><input type="range" min="0.2" max="8" step="0.1" value={duration} onChange={(event) => onDurationChange(Number(event.target.value))} /></label>}
          {definition.controls.map((control) => control.type === "color" ? (
            <label key={control.key} className="color-control"><span>{control.label} <b>{String(options[control.key]).toUpperCase()}</b></span><span className="color-input-row"><input type="color" value={String(options[control.key])} onChange={(event) => setOption(control.key, event.target.value)} aria-label={control.label} /><input value={options[control.key]} onChange={(event) => setOption(control.key, event.target.value)} aria-label={`${control.label}值`} /></span></label>
          ) : control.type === "choice" ? (
            <fieldset key={control.key} className="direction-control control-wide"><legend>{control.label}</legend><div>{control.choices?.map(([value, label]) => <button key={value} type="button" className={options[control.key] === value ? "active" : ""} onClick={() => setOption(control.key, value)}>{label}</button>)}</div></fieldset>
          ) : (
            <label key={control.key}><span>{control.label} <b>{options[control.key]}{control.unit}</b></span><input type="range" min={control.min} max={control.max} step={control.step ?? 1} value={options[control.key]} onChange={(event) => setOption(control.key, Number(event.target.value))} /></label>
          ))}
        </div>

        <section className="generated-code" aria-label="可复制代码">
          <div className="code-tabs" role="tablist" aria-label="代码类型">
            {(["react", "source", "html"] as CodeMode[]).map((mode) => <button key={mode} role="tab" aria-selected={codeMode === mode} className={codeMode === mode ? "active" : ""} onClick={() => setCodeMode(mode)}>{mode === "react" ? "React 用法" : mode === "source" ? "完整源码" : "HTML + CSS"}</button>)}
          </div>
          <div className="code-box workbench-code"><div><span>{codeMode === "html" ? "HTML + CSS" : "TSX"}</span><button onClick={copy}>{copied ? "已复制 ✓" : "复制当前代码"}</button></div><pre><code>{code}</code></pre></div>
          <p className="code-hint">代码会随参数实时更新，可直接复制到其他项目继续调整。</p>
        </section>
      </div>
    </div>
  );
}
