import type { CSSProperties, ElementType, ReactNode } from "react";

export type EffectCategory = "基础" | "进入" | "循环" | "互动";

export type EffectId =
  | "gradient"
  | "outline"
  | "highlight"
  | "slide"
  | "blur"
  | "scale"
  | "typewriter"
  | "shimmer"
  | "wave"
  | "glitch"
  | "magnet"
  | "underline"
  | "neon"
  | "rainbow"
  | "longshadow"
  | "cutout"
  | "fade"
  | "flip"
  | "rotate"
  | "mask"
  | "pulse"
  | "flicker"
  | "stretch"
  | "tilt"
  | "duotone" | "chrome" | "fire" | "ice" | "emboss" | "dots"
  | "drop" | "swing" | "unfold" | "focus" | "rise" | "scatter"
  | "float" | "hue" | "heartbeat" | "shake" | "bounce" | "sway"
  | "split-hover" | "glow-hover" | "tracking-hover" | "invert-hover" | "blur-hover" | "lift-hover";

export type EffectDefinition = {
  id: EffectId;
  name: string;
  en: string;
  category: EffectCategory;
  description: string;
  className: `fx-${string}`;
  badge?: string;
  split?: boolean;
};

export type TextEffectProps = {
  children: string;
  effect: EffectId;
  as?: ElementType;
  className?: string;
  duration?: number;
  delay?: number;
  paused?: boolean;
  style?: CSSProperties;
  "aria-label"?: string;
};

export type TextEffectStyle = CSSProperties & {
  "--speed"?: string;
  "--delay"?: string;
  "--i"?: number;
};

export type TextEffectChildren = ReactNode;
