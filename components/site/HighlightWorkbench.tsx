"use client";

import { useMemo, useState } from "react";
import {
  HighlightText,
  highlightTextDefaults,
  type HighlightDirection,
  type HighlightTextOptions,
} from "@/components/text-effects";
import { getCopyEffectCode } from "@/lib/copy-effect-code";

type HighlightWorkbenchProps = {
  text: string;
  onTextChange: (value: string) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  duration: number;
  onDurationChange: (value: number) => void;
  paused: boolean;
};

type CodeMode = "react" | "source" | "html";

const defaultOptions: HighlightTextOptions = { ...highlightTextDefaults };

const rangeControls: Array<{
  key: Exclude<keyof HighlightTextOptions, "bandColor" | "direction">;
  label: string;
  min: number;
  max: number;
  unit: string;
}> = [
  { key: "bandThickness", label: "条带厚度", min: 5, max: 110, unit: "%" },
  { key: "bandStart", label: "左侧范围", min: 0, max: 45, unit: "%" },
  { key: "bandEnd", label: "右侧范围", min: 0, max: 45, unit: "%" },
  { key: "bandOffset", label: "垂直位置", min: -30, max: 60, unit: "%" },
  { key: "bandAngle", label: "倾斜角度", min: -25, max: 25, unit: "°" },
  { key: "bandRadius", label: "边缘圆角", min: 0, max: 30, unit: "px" },
];

export function HighlightWorkbench({
  text,
  onTextChange,
  fontSize,
  onFontSizeChange,
  duration,
  onDurationChange,
  paused,
}: HighlightWorkbenchProps) {
  const [options, setOptions] = useState<HighlightTextOptions>(defaultOptions);
  const [codeMode, setCodeMode] = useState<CodeMode>("react");
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const code = useMemo(() => getCopyEffectCode("highlight", text, { ...options, duration, paused }, fontSize)[codeMode], [codeMode, duration, options, text, fontSize, paused]);

  const updateOption = <Key extends keyof HighlightTextOptions>(key: Key, value: HighlightTextOptions[Key]) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const reset = () => {
    setOptions({ ...defaultOptions });
    onDurationChange(1.8);
    onFontSizeChange(36);
    setPreviewKey((key) => key + 1);
  };

  return (
    <div className="highlight-workbench">
      <div className="workbench-stage">
        <div className="stage-heading">
          <span>实时预览</span>
          <b>修改参数时自动更新</b>
        </div>
        <div className="drawer-preview highlight-preview" style={{ fontSize: `${fontSize}px` }}>
          <HighlightText key={previewKey} {...options} duration={duration} paused={paused}>{text}</HighlightText>
        </div>

        <div className="workbench-actions">
          <button onClick={() => setPreviewKey((key) => key + 1)}>↻ 重播</button>
          <button onClick={reset}>恢复默认</button>
        </div>

        <dl className="stage-summary" aria-label="当前参数摘要">
          <div><dt>颜色</dt><dd><i style={{ background: options.bandColor }} />{options.bandColor.toUpperCase()}</dd></div>
          <div><dt>厚度</dt><dd>{options.bandThickness}%</dd></div>
          <div><dt>范围</dt><dd>{100 - options.bandStart - options.bandEnd}%</dd></div>
          <div><dt>方向</dt><dd>{options.direction === "left" ? "从左" : options.direction === "right" ? "从右" : "从中心"}</dd></div>
        </dl>
      </div>

      <div className="workbench-editor">
        <div className="editor-heading">
          <div><span>外观参数</span><b>高亮条带</b></div>
          <button onClick={reset}>重置参数</button>
        </div>

        <div className="drawer-controls highlight-controls">
          <label className="control-wide">
            <span>预览文字</span>
            <input value={text} maxLength={24} onChange={(event) => onTextChange(event.target.value || " ")} />
          </label>

          <label className="color-control control-wide">
            <span>条带颜色 <b>{options.bandColor.toUpperCase()}</b></span>
            <span className="color-input-row">
              <input type="color" value={options.bandColor} onChange={(event) => updateOption("bandColor", event.target.value)} aria-label="条带颜色" />
              <input value={options.bandColor} onChange={(event) => updateOption("bandColor", event.target.value)} aria-label="条带颜色值" />
            </span>
          </label>

          <label>
            <span>字号 <b>{fontSize}px</b></span>
            <input type="range" min="24" max="64" value={fontSize} onChange={(event) => onFontSizeChange(Number(event.target.value))} />
          </label>

          <label>
            <span>动画时长 <b>{duration.toFixed(1)}s</b></span>
            <input type="range" min="0.2" max="8" step="0.1" value={duration} onChange={(event) => onDurationChange(Number(event.target.value))} />
          </label>

          {rangeControls.map((control) => (
            <label key={control.key}>
              <span>{control.label} <b>{options[control.key]}{control.unit}</b></span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                value={options[control.key]}
                onChange={(event) => updateOption(control.key, Number(event.target.value))}
              />
            </label>
          ))}

          <fieldset className="direction-control control-wide">
            <legend>绘制方向</legend>
            <div>
              {(["left", "center", "right"] as HighlightDirection[]).map((direction) => (
                <button
                  key={direction}
                  className={options.direction === direction ? "active" : ""}
                  onClick={() => updateOption("direction", direction)}
                  type="button"
                >
                  {direction === "left" ? "从左" : direction === "right" ? "从右" : "从中心"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <section className="generated-code" aria-label="可复制代码">
          <div className="code-tabs" role="tablist" aria-label="代码类型">
            <button role="tab" aria-selected={codeMode === "react"} className={codeMode === "react" ? "active" : ""} onClick={() => setCodeMode("react")}>React 用法</button>
            <button role="tab" aria-selected={codeMode === "source"} className={codeMode === "source" ? "active" : ""} onClick={() => setCodeMode("source")}>完整源码</button>
            <button role="tab" aria-selected={codeMode === "html"} className={codeMode === "html" ? "active" : ""} onClick={() => setCodeMode("html")}>HTML + CSS</button>
          </div>
          <div className="code-box workbench-code">
            <div><span>{codeMode === "react" ? "TSX" : codeMode === "source" ? "TSX + CSS" : "HTML + CSS"}</span><button onClick={copyCode}>{copied ? "已复制 ✓" : "复制当前代码"}</button></div>
            <pre><code>{code}</code></pre>
          </div>
          <p className="code-hint">代码会随上方参数实时更新。完整源码模式包含组件和样式，HTML + CSS 模式无需 React。</p>
        </section>
      </div>
    </div>
  );
}
