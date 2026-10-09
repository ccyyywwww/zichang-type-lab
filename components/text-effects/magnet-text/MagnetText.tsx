import { createElement, type CSSProperties, type ElementType } from "react";

export const magnetTextDefaults = { color: "#d9ff57", activeColor: "#46e6d4", restSpacing: .16, activeSpacing: -.08, lift: 0, duration: .4, delay: 0, trigger: "hover" as const };
export type MagnetTextProps = {
  children: string; as?: ElementType; color?: string; activeColor?: string;
  restSpacing?: number; activeSpacing?: number; lift?: number; duration?: number; delay?: number;
  trigger?: "hover" | "always"; active?: boolean; paused?: boolean;
  tabIndex?: number; className?: string; style?: CSSProperties;
};
const clamp = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
// Modern browsers preserve emoji families and combining marks as one grapheme.
export function splitMagnetText(text: string): string[] {
  if (typeof Intl.Segmenter === "function") return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), item => item.segment);
  return Array.from(text);
}
export function getMagnetTextStyle({ color = "#d9ff57", activeColor = "#46e6d4", restSpacing = .16, activeSpacing = -.08, lift = 0, duration = .4, delay = 0, style }: Omit<MagnetTextProps, "children">, count: number): CSSProperties {
  const rest = clamp(restSpacing, -.1, .5, .16);
  const active = clamp(activeSpacing, -.1, .5, -.08);
  const gap = Math.max(0, rest, active);
  return {
    "--zc-magnet-color": color, "--zc-magnet-active-color": activeColor,
    "--zc-magnet-gap": `${gap}em`, "--zc-magnet-mid": (count - 1) / 2,
    "--zc-magnet-rest-shift": `${rest - gap}em`, "--zc-magnet-active-shift": `${active - gap}em`,
    "--zc-magnet-lift": `${clamp(lift, 0, 16, 0)}px`,
    "--zc-magnet-duration": `${clamp(duration, .2, 8, .4)}s`, "--zc-magnet-delay": `${clamp(delay, 0, 3, 0)}s`,
    ...style,
  } as CSSProperties;
}
export function MagnetText({ children, as = "span", trigger = "hover", active = false, paused = false, tabIndex, className = "", ...options }: MagnetTextProps) {
  const characters = splitMagnetText(children);
  return createElement(as, {
    className: ["zc-magnet-text", paused ? "is-paused" : "", className].filter(Boolean).join(" "),
    "data-trigger": trigger, "data-active": active ? "true" : "false",
    tabIndex: tabIndex ?? (trigger === "hover" ? 0 : undefined),
    style: getMagnetTextStyle(options, characters.length),
  }, <span className="zc-magnet-readable">{children}</span>, characters.map((character, index) => <span className="zc-magnet-character" key={index} aria-hidden="true" style={{ "--zc-magnet-i": index } as CSSProperties}>{character}</span>));
}
