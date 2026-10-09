import { createElement, type CSSProperties, type ElementType } from "react";

export const rainbowTextDefaults = { color1: "#ff5e91", color2: "#ffd166", color3: "#46e6d4", color4: "#8b5cf6", angle: 90, spread: 250, direction: "left" as const, animated: true };
export type RainbowTextProps = {
  children: string; as?: ElementType; color1?: string; color2?: string; color3?: string; color4?: string;
  angle?: number; spread?: number; direction?: "left" | "right"; animated?: boolean;
  duration?: number; delay?: number; paused?: boolean; className?: string; style?: CSSProperties;
};
export function RainbowText({ children, as = "span", color1 = "#ff5e91", color2 = "#ffd166", color3 = "#46e6d4", color4 = "#8b5cf6", angle = 90, spread = 250, direction = "left", animated = true, duration = 1.8, delay = 0, paused = false, className = "", style }: RainbowTextProps) {
  return createElement(as, {
    className: ["zc-rainbow-text", animated ? "is-animated" : "", paused ? "is-paused" : "", className].filter(Boolean).join(" "),
    "data-direction": direction,
    style: { "--zc-rainbow-1": color1, "--zc-rainbow-2": color2, "--zc-rainbow-3": color3, "--zc-rainbow-4": color4, "--zc-rainbow-angle": `${Number.isFinite(angle) ? angle : 90}deg`, "--zc-rainbow-spread": `${Number.isFinite(spread) ? Math.min(500, Math.max(100, spread)) : 250}%`, "--zc-rainbow-duration": `${Number.isFinite(duration) ? Math.max(.2, duration) : 1.8}s`, "--zc-rainbow-delay": `${Number.isFinite(delay) ? Math.max(0, delay) : 0}s`, ...style } as CSSProperties,
  }, children);
}
