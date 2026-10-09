import { createElement, type CSSProperties, type ElementType } from "react";

export type UnderlineTextProps = {
  children: string;
  as?: ElementType;
  lineColor?: string;
  thickness?: number;
  width?: number;
  offset?: number;
  radius?: number;
  direction?: "left" | "center" | "right";
  trigger?: "mount" | "hover";
  duration?: number;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
};

type UnderlineStyle = CSSProperties & Record<`--zc-underline-${string}`, string>;

export const underlineTextDefaults = { lineColor: "#d9ff57", thickness: 4, width: 100, offset: 8, radius: 5, direction: "center" as const, trigger: "hover" as const };

export function UnderlineText({ children, as = "span", lineColor = underlineTextDefaults.lineColor, thickness = 4, width = 100, offset = 8, radius = 5, direction = "center", trigger = "hover", duration = .35, paused = false, className = "", style }: UnderlineTextProps) {
  const variables: UnderlineStyle = {
    "--zc-underline-color": lineColor,
    "--zc-underline-thickness": `${Math.min(20, Math.max(1, thickness))}px`,
    "--zc-underline-width": `${Math.min(120, Math.max(10, width))}%`,
    "--zc-underline-offset": `${Math.min(30, Math.max(-5, offset))}px`,
    "--zc-underline-radius": `${Math.min(30, Math.max(0, radius))}px`,
    "--zc-underline-duration": `${Math.max(.05, duration)}s`,
    ...style,
  };
  return createElement(as, {
    className: ["zc-underline-text", paused ? "is-paused" : "", className].filter(Boolean).join(" "),
    style: variables,
    "data-direction": direction,
    "data-trigger": trigger,
  }, children);
}
