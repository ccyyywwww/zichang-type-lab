import { createElement, type CSSProperties, type ElementType } from "react";
import { splitGraphemes } from "../core/segment-text";

export type BlurTextProps = { children: string; as?: ElementType; blur?: number; distance?: number; direction?: "up" | "down"; stagger?: number; duration?: number; delay?: number; initialOpacity?: number; paused?: boolean; className?: string; style?: CSSProperties };
type BlurStyle = CSSProperties & Record<`--zc-blur-${string}`, string | number>;
export const blurTextDefaults = { blur: 12, distance: 18, direction: "up" as const, stagger: .05, initialOpacity: 0 };

export function BlurText({ children, as = "span", blur = 12, distance = 18, direction = "up", stagger = .05, duration = .8, delay = 0, initialOpacity = 0, paused = false, className = "", style }: BlurTextProps) {
  const rootStyle: BlurStyle = { "--zc-blur-radius": `${Math.min(40, Math.max(0, blur))}px`, "--zc-blur-y": `${Math.min(80, Math.max(0, distance)) * (direction === "up" ? 1 : -1)}px`, "--zc-blur-duration": `${Math.max(.1, duration)}s`, "--zc-blur-stagger": `${Math.max(0, stagger)}s`, "--zc-blur-delay": `${Math.max(0, delay)}s`, "--zc-blur-opacity": Math.min(1, Math.max(0, initialOpacity)), ...style };
  return createElement(as, { className: ["zc-blur-text", paused ? "is-paused" : "", className].filter(Boolean).join(" "), style: rootStyle, "aria-label": children }, splitGraphemes(children).map((char, index) => <span key={`${char}-${index}`} aria-hidden="true" style={{ "--zc-blur-index": index } as BlurStyle}>{char === " " ? "\u00a0" : char}</span>));
}
