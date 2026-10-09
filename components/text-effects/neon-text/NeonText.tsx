import { createElement, type CSSProperties, type ElementType } from "react";

export const neonTextDefaults = { color: "#ffffff", glowColor: "#fa5b91", glowRadius: 24, intensity: 1, animated: true };
export type NeonTextProps = {
  children: string; as?: ElementType; color?: string; glowColor?: string;
  glowRadius?: number; intensity?: number; animated?: boolean; duration?: number;
  delay?: number; paused?: boolean; className?: string; style?: CSSProperties;
};
export function NeonText({ children, as = "span", color = "#ffffff", glowColor = "#fa5b91", glowRadius = 24, intensity = 1, animated = true, duration = 1.8, delay = 0, paused = false, className = "", style }: NeonTextProps) {
  const radius = Number.isFinite(glowRadius) ? Math.min(64, Math.max(0, glowRadius)) : 24;
  const strength = Number.isFinite(intensity) ? Math.min(2, Math.max(0, intensity)) : 1;
  return createElement(as, {
    className: ["zc-neon-text", animated ? "is-animated" : "", paused ? "is-paused" : "", className].filter(Boolean).join(" "),
    style: { "--zc-neon-color": color, "--zc-neon-glow": glowColor, "--zc-neon-radius": `${radius * strength}px`, "--zc-neon-duration": `${Number.isFinite(duration) ? Math.max(.2, duration) : 1.8}s`, "--zc-neon-delay": `${Number.isFinite(delay) ? Math.max(0, delay) : 0}s`, ...style } as CSSProperties,
  }, children);
}
