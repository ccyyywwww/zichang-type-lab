"use client";
import { useState, type HTMLAttributes } from "react";
export type PromptInputProps = Omit<HTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange" | "children"> & { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; onSubmit?: (value: string) => void; placeholder?: string; label?: string; disabled?: boolean; busy?: boolean; submitLabel?: string; maxLength?: number };
export function PromptInput({ value, defaultValue = "", onValueChange, onSubmit, placeholder = "输入你的问题…", label = "消息内容", disabled = false, busy = false, submitLabel = "发送", maxLength = 2000, className = "", ...props }: PromptInputProps) {
  const [draft, setDraft] = useState(defaultValue);
  const text = value ?? draft;
  const update = (next: string) => { setDraft(next); onValueChange?.(next); };
  const send = () => { if (!text.trim() || disabled || busy) return; onSubmit?.(text.trim()); update(""); };
  return <form {...props} className={`zc-prompt-input ${className}`} onSubmit={event => { event.preventDefault(); send(); }}>
    <textarea aria-label={label} value={text} onChange={event => update(event.target.value)} placeholder={placeholder} disabled={disabled || busy} rows={2} maxLength={maxLength} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && !event.defaultPrevented) { event.preventDefault(); send(); } }} />
    <div className="zc-prompt-input-toolbar"><span>{busy ? "正在处理…" : "Enter 发送 · Shift+Enter 换行"}</span><button type="submit" disabled={disabled || busy || !text.trim()}>{busy ? "处理中" : submitLabel}</button></div>
  </form>;
}
