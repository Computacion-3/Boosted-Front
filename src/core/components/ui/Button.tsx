import type { ButtonHTMLAttributes } from "react";
import { classNames } from "./class-names";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "ghost"
  | "outline"
  | "error"
  | "link";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Muestra un spinner y deshabilita el botón mientras dura una acción. */
  isLoading?: boolean;
  fullWidth?: boolean;
};

// Clases completas (no armadas con plantillas) para que Tailwind las detecte.
const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  neutral: "btn-neutral",
  ghost: "btn-ghost",
  outline: "btn-outline",
  error: "btn-error",
  link: "btn-link",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={classNames(
        "btn",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "btn-block",
        className,
      )}
      {...rest}
    >
      {isLoading && (
        <span className="loading loading-spinner loading-sm" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
