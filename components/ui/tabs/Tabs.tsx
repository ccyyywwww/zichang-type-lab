"use client";
import { useId, useState, type HTMLAttributes, type ReactNode } from "react";
export type TabsItem = { label: string; content: ReactNode };
export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & { items?: TabsItem[]; defaultIndex?: number; index?: number; onIndexChange?: (index: number) => void };
export function Tabs({ items = [{ label: "概览", content: "查看当前项目与最近动态。" }, { label: "设置", content: "调整项目的通知与显示偏好。" }], defaultIndex = 0, index, onIndexChange, className = "", ...props }: TabsProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultIndex);
  const requested = index ?? internal;
  const current = Math.max(0, Math.min(items.length - 1, Number.isFinite(requested) ? Math.floor(requested) : 0));
  const change = (next: number) => { setInternal(next); onIndexChange?.(next); };
  return <div {...props} className={`zc-tabs ${className}`}><div role="tablist" aria-label={props["aria-label"] ?? "内容分类"} className="zc-tabs-list">{items.map((item, position) => <button key={position} type="button" role="tab" id={`${id}-tab-${position}`} aria-controls={`${id}-panel-${position}`} aria-selected={current === position} tabIndex={current === position ? 0 : -1} onClick={() => change(position)} onKeyDown={event => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (position + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    change(next);
    const button = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next];
    button?.focus();
  }}>{item.label}</button>)}</div>{items.map((item, position) => <div key={position} role="tabpanel" id={`${id}-panel-${position}`} aria-labelledby={`${id}-tab-${position}`} hidden={current !== position} tabIndex={0} className="zc-tabs-panel">{item.content}</div>)}</div>;
}
