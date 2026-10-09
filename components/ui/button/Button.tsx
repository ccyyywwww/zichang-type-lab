import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "solid" | "outline" | "ghost" | "gradient" | "shiny" | "lift" | "soft" | "danger" | "pill" | "neon" | "border" | "rainbow" | "glass" | "striped" | "dashed" | "minimal" | "spotlight" | "retro";
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "small" | "medium" | "large";
  loading?: boolean;
  paused?: boolean;
};

export function Button({ variant = "solid", size = "medium", loading = false, paused = false, disabled, className = "", children, type = "button", ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} data-paused={paused} className={`zc-button zc-button--${variant} zc-button--${size} ${className}`}>
    {loading && <span className="zc-button-spinner" aria-hidden="true" />}{children}
  </button>;
}
