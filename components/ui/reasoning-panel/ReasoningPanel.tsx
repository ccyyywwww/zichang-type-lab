import type { DetailsHTMLAttributes } from "react";
export type ReasoningPanelProps = DetailsHTMLAttributes<HTMLDetailsElement> & { label?: string; content?: string; busy?: boolean };
export function ReasoningPanel({ label = "处理过程摘要", content = "已读取问题，正在整理可执行的回答。", busy = false, className = "", ...props }: ReasoningPanelProps) {
  return <details {...props} className={`zc-reasoning-panel ${className}`}><summary><span aria-hidden="true">✦ </span>{label}<span className="zc-reasoning-panel-status">{busy ? "处理中" : "已完成"}</span></summary><p>{content}</p></details>;
}
