import type { TextareaHTMLAttributes } from "react";
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
export function Textarea({ className = "", rows = 3, ...props }: TextareaProps) {
  return <textarea {...props} rows={rows} className={`zc-textarea ${className}`} />;
}
