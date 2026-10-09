import { createElement, type CSSProperties, type ElementType } from "react";

export type OutlineTextProps = {
  children: string;
  as?: ElementType;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  shadowColor?: string;
  shadowX?: number;
  shadowY?: number;
  className?: string;
  style?: CSSProperties;
};

type OutlineStyle = CSSProperties & Record<`--zc-outline-${string}`, string>;

export const outlineTextDefaults = { strokeColor: "#f4f2e9", strokeWidth: 1.5, fillColor: "transparent", shadowColor: "#d9ff57", shadowX: 4, shadowY: 4 } as const;

export function OutlineText({ children, as = "span", strokeColor = outlineTextDefaults.strokeColor, strokeWidth = outlineTextDefaults.strokeWidth, fillColor = outlineTextDefaults.fillColor, shadowColor = outlineTextDefaults.shadowColor, shadowX = outlineTextDefaults.shadowX, shadowY = outlineTextDefaults.shadowY, className = "", style }: OutlineTextProps) {
  const variables: OutlineStyle = {
    "--zc-outline-stroke": strokeColor,
    "--zc-outline-width": `${Math.min(8, Math.max(0, strokeWidth))}px`,
    "--zc-outline-fill": fillColor,
    "--zc-outline-shadow": shadowColor,
    "--zc-outline-shadow-x": `${Math.min(30, Math.max(-30, shadowX))}px`,
    "--zc-outline-shadow-y": `${Math.min(30, Math.max(-30, shadowY))}px`,
    ...style,
  };
  return createElement(as, { className: ["zc-outline-text", className].filter(Boolean).join(" "), style: variables }, children);
}
