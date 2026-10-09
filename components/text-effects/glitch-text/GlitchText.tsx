import { createElement, type CSSProperties, type ElementType } from "react";

export const glitchTextDefaults = { color: "#ffffff", primaryColor: "#fa5b91", secondaryColor: "#46e6d4", offset: 4, jitter: 2, skew: 3, duration: .6, delay: 0, trigger: "hover" as const };
export type GlitchTextProps = {
  children: string; as?: ElementType; color?: string; primaryColor?: string; secondaryColor?: string;
  offset?: number; jitter?: number; skew?: number; duration?: number; delay?: number;
  trigger?: "hover" | "always"; active?: boolean; paused?: boolean;
  tabIndex?: number; className?: string; style?: CSSProperties;
};
const clamp = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
export function getGlitchTextStyle({ color = "#ffffff", primaryColor = "#fa5b91", secondaryColor = "#46e6d4", offset = 4, jitter = 2, skew = 3, duration = .6, delay = 0, style }: Omit<GlitchTextProps, "children">): CSSProperties {
  return {
    "--zc-glitch-color": color,
    "--zc-glitch-primary": primaryColor,
    "--zc-glitch-secondary": secondaryColor,
    "--zc-glitch-offset": `${clamp(offset, 0, 16, 4)}px`,
    "--zc-glitch-jitter": `${clamp(jitter, 0, 8, 2)}px`,
    "--zc-glitch-skew": `${clamp(skew, 0, 12, 3)}deg`,
    "--zc-glitch-duration": `${clamp(duration, .2, 8, .6)}s`,
    "--zc-glitch-delay": `${clamp(delay, 0, 3, 0)}s`,
    ...style,
  } as CSSProperties;
}
export function GlitchText({ children, as = "span", trigger = "hover", active = false, paused = false, tabIndex, className = "", ...options }: GlitchTextProps) {
  return createElement(as, {
    className: ["zc-glitch-text", paused ? "is-paused" : "", className].filter(Boolean).join(" "),
    "data-trigger": trigger, "data-active": active ? "true" : "false",
    tabIndex: tabIndex ?? (trigger === "hover" ? 0 : undefined),
    style: getGlitchTextStyle(options),
  }, children);
}
