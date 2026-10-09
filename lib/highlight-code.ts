import type { HighlightTextOptions } from "@/components/text-effects";
import { copyDefinitions, getCopyEffectCode } from "./copy-effect-code";

export function getHighlightUsageCode(text: string, options: HighlightTextOptions, duration: number) {
  return getCopyEffectCode("highlight", text, { ...options, duration }, 36).react;
}
export function getHighlightComponentSource() { return copyDefinitions.highlight.source; }
export function getHighlightCssSource() { return copyDefinitions.highlight.css; }
export function getHighlightHtmlCode(text: string, options: HighlightTextOptions, duration: number) {
  return getCopyEffectCode("highlight", text, { ...options, duration }, 36).html;
}
