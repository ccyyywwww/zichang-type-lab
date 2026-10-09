import { createElement, type CSSProperties, type ElementType } from "react";
import { splitGraphemes } from "../core/segment-text";

export type SlideTextProps = { children: string; as?: ElementType; direction?: "up" | "down" | "left" | "right"; distance?: number; stagger?: number; duration?: number; delay?: number; initialOpacity?: number; paused?: boolean; className?: string; style?: CSSProperties };
type SlideStyle = CSSProperties & Record<`--zc-slide-${string}`, string | number>;
export const slideTextDefaults = { direction: "up" as const, distance: 34, stagger: .06, initialOpacity: 0 };

export function SlideText({ children, as = "span", direction = "up", distance = 34, stagger = .06, duration = .7, delay = 0, initialOpacity = 0, paused = false, className = "", style }: SlideTextProps) {
  const distanceValue = Math.min(120, Math.max(0, distance));
  const offsets = { up: [0, distanceValue], down: [0, -distanceValue], left: [distanceValue, 0], right: [-distanceValue, 0] }[direction];
  const rootStyle: SlideStyle = { "--zc-slide-x": `${offsets[0]}px`, "--zc-slide-y": `${offsets[1]}px`, "--zc-slide-duration": `${Math.max(.1, duration)}s`, "--zc-slide-stagger": `${Math.max(0, stagger)}s`, "--zc-slide-delay": `${Math.max(0, delay)}s`, "--zc-slide-opacity": Math.min(1, Math.max(0, initialOpacity)), ...style };
  return createElement(as, { className: ["zc-slide-text", paused ? "is-paused" : "", className].filter(Boolean).join(" "), style: rootStyle, "aria-label": children }, splitGraphemes(children).map((char, index) => <span key={`${char}-${index}`} aria-hidden="true" style={{ "--zc-slide-index": index } as SlideStyle}>{char === " " ? "\u00a0" : char}</span>));
}
