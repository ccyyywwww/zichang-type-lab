import { createElement } from "react";
import { getEffect } from "./catalog";
import { splitGraphemes } from "./core/segment-text";
import type { TextEffectProps, TextEffectStyle } from "./types";

export function TextEffect({
  children,
  effect,
  as = "span",
  className = "",
  duration = 1.8,
  delay = 0,
  paused = false,
  style,
  "aria-label": ariaLabel,
}: TextEffectProps) {
  const definition = getEffect(effect);

  if (!definition) return createElement(as, { className, style }, children);

  const effectStyle: TextEffectStyle = {
    "--speed": `${duration}s`,
    "--delay": `${delay}s`,
    animationDelay: `${delay}s`,
    ...style,
  };
  const rootClassName = [
    "effect-text",
    definition.split ? "split-text" : "",
    definition.className,
    paused ? "is-paused" : "",
    className,
  ].filter(Boolean).join(" ");

  if (definition.split) {
    return createElement(
      as,
      { className: rootClassName, style: effectStyle, "aria-label": ariaLabel ?? children },
      splitGraphemes(children).map((char, index) => (
        <span key={`${char}-${index}`} aria-hidden="true" style={{ "--i": index } as TextEffectStyle}>
          {char === " " ? "\u00a0" : char}
        </span>
      )),
    );
  }

  return createElement(
    as,
    { className: rootClassName, style: effectStyle, "data-text": children, "aria-label": ariaLabel },
    children,
  );
}
