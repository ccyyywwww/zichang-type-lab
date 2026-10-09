import { createElement, type CSSProperties, type ElementType } from "react";

export const longShadowTextDefaults = { color: "#d9ff57", shadowColor: "#7c5cff", angle: 45, length: 24 };
export type LongShadowTextProps = { children: string; as?: ElementType; color?: string; shadowColor?: string; angle?: number; length?: number; className?: string; style?: CSSProperties };
// Angle follows screen coordinates: 0° right, 90° down. At most 80 layers.
export function getLongShadow(angle: number, length: number, color: string) {
  const distance = Number.isFinite(length) ? Math.min(80, Math.max(0, length)) : 24;
  const radians = (Number.isFinite(angle) ? angle : 45) * Math.PI / 180;
  return Array.from({ length: Math.ceil(distance) }, (_, index) => {
    const step = Math.min(index + 1, distance);
    return `${(Math.cos(radians) * step).toFixed(3)}px ${(Math.sin(radians) * step).toFixed(3)}px 0 ${color}`;
  }).join(", ") || "none";
}
export function LongShadowText({ children, as = "span", color = "#d9ff57", shadowColor = "#7c5cff", angle = 45, length = 24, className = "", style }: LongShadowTextProps) {
  return createElement(as, { className: ["zc-long-shadow-text", className].filter(Boolean).join(" "), style: { color, textShadow: getLongShadow(angle, length, shadowColor), ...style } }, children);
}
