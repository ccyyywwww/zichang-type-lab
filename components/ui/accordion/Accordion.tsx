import type { DetailsHTMLAttributes } from "react";
export type AccordionProps = DetailsHTMLAttributes<HTMLDetailsElement> & { heading?: string };
export function Accordion({ heading = "如何开始使用？", children = "打开参数面板，调节样式后复制完整源码。", className = "", ...props }: AccordionProps) {
  return <details {...props} className={`zc-accordion ${className}`}><summary>{heading}</summary><div className="zc-accordion-content">{children}</div></details>;
}
