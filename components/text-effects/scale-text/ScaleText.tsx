import { createElement, type CSSProperties, type ElementType } from "react";
import { splitGraphemes } from "../core/segment-text";

export type ScaleTextProps = { children: string; as?: ElementType; initialScale?: number; overshoot?: number; stagger?: number; duration?: number; delay?: number; initialOpacity?: number; paused?: boolean; className?: string; style?: CSSProperties };
type ScaleStyle = CSSProperties & Record<`--zc-scale-${string}`, string | number>;
export const scaleTextDefaults = { initialScale: .45, overshoot: 1.16, stagger: .055, initialOpacity: 0 };

export function ScaleText({ children, as = "span", initialScale = .45, overshoot = 1.16, stagger = .055, duration = .7, delay = 0, initialOpacity = 0, paused = false, className = "", style }: ScaleTextProps) {
  const rootStyle: ScaleStyle = { "--zc-scale-from": Math.min(2, Math.max(0, initialScale)), "--zc-scale-over": Math.min(1.8, Math.max(1, overshoot)), "--zc-scale-duration": `${Math.max(.1, duration)}s`, "--zc-scale-stagger": `${Math.max(0, stagger)}s`, "--zc-scale-delay": `${Math.max(0, delay)}s`, "--zc-scale-opacity": Math.min(1, Math.max(0, initialOpacity)), ...style };
  return createElement(as, { className: ["zc-scale-text", paused ? "is-paused" : "", className].filter(Boolean).join(" "), style: rootStyle, "aria-label": children }, splitGraphemes(children).map((char, index) => <span key={`${char}-${index}`} aria-hidden="true" style={{ "--zc-scale-index": index } as ScaleStyle}>{char === " " ? "\u00a0" : char}</span>));
}
