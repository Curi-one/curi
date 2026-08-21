import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type Shared = {
  variant?: ButtonVariant;
  /** Leading icon (ignored when iconOnly). */
  icon?: ReactNode;
  /** Trailing icon (ignored when iconOnly). */
  iconRight?: ReactNode;
  /** Square icon-only control; children become the accessible name. */
  iconOnly?: boolean;
  /** Shows a busy state; keeps the same type recipe. */
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

type ButtonAsButton = Shared &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = Shared & {
  href: string;
  disabled?: boolean;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const SHARED_KEYS = new Set([
  "variant",
  "icon",
  "iconRight",
  "iconOnly",
  "loading",
  "className",
  "children",
  "href",
]);

/**
 * Curi button — all variants share the same UI-sans type recipe.
 * Use `icon` / `iconRight` for labeled buttons; `iconOnly` for square controls.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    icon,
    iconRight,
    iconOnly = false,
    loading = false,
    className = "",
    children,
  } = props;

  const classes = [
    VARIANT_CLASS[variant],
    iconOnly ? "btn-icon" : "",
    "focus-ring",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const label =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined;

  const content = iconOnly ? (
    <>
      {loading ? <span aria-hidden>…</span> : icon}
      {children ? <span className="sr-only">{children}</span> : null}
    </>
  ) : (
    <>
      {loading ? null : icon}
      {loading ? "Loading…" : children}
      {loading ? null : iconRight}
    </>
  );

  if ("href" in props && props.href) {
    const { href, disabled } = props;
    if (disabled || loading) {
      return (
        <span
          className={`${classes} pointer-events-none opacity-40`}
          aria-disabled="true"
          aria-label={iconOnly ? label : undefined}
        >
          {content}
        </span>
      );
    }
    return (
      <Link
        href={href}
        className={classes}
        aria-label={iconOnly ? label : undefined}
      >
        {content}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(buttonProps)) {
    if (!SHARED_KEYS.has(key) && key !== "type" && key !== "disabled") {
      rest[key] = value;
    }
  }

  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classes}
      disabled={buttonProps.disabled || loading}
      aria-busy={loading || undefined}
      aria-label={iconOnly ? label : undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
