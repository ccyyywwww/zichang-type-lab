import type { SelectHTMLAttributes } from "react";
export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { options?: { value: string; label: string; disabled?: boolean }[] };
export function Select({ className = "", options = [{ value: "design", label: "设计" }, { value: "development", label: "开发" }, { value: "review", label: "评审" }], children, ...props }: SelectProps) {
  return <select {...props} className={`zc-select ${className}`}>{children ?? options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</select>;
}
