import type { HTMLAttributes } from "react";
export type PromptSuggestionsProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & { suggestions?: string[]; onSelect?: (suggestion: string) => void; disabled?: boolean; label?: string };
export function PromptSuggestions({ suggestions = ["解释这段代码", "帮我整理思路", "写一个项目计划"], onSelect, disabled = false, label = "推荐问题", className = "", ...props }: PromptSuggestionsProps) {
  return <div {...props} role="group" aria-label={label} className={`zc-prompt-suggestions ${className}`}>{suggestions.map((suggestion, index) => <button key={index} type="button" disabled={disabled} onClick={() => onSelect?.(suggestion)}>{suggestion}<span aria-hidden="true"> ↗</span></button>)}</div>;
}
