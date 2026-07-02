import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "link" | "inverse" | "inverse-outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual hierarchy tier. Default: primary */
  variant?: ButtonVariant;
  /** Size tier. Default: md (44 px) */
  size?: ButtonSize;
  /** Icon before label. Gap: 8 px */
  leadingIcon?: ReactNode;
  /** Icon after label */
  trailingIcon?: ReactNode;
  /**
   * Wrap Small buttons in an expanded hit target on touch devices.
   * Only applies when size="sm".
   */
  touchExpand?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "ds-btn--primary",
  secondary: "ds-btn--secondary",
  tertiary: "ds-btn--tertiary",
  link: "ds-btn--link",
  inverse: "ds-btn--inverse",
  "inverse-outline": "ds-btn--inverse-outline",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "ds-btn--sm",
  md: "ds-btn--md",
  lg: "ds-btn--lg",
};

function join(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className">) {
  return join("ds-btn", variantClass[variant], sizeClass[size], className);
}

/**
 * Standard button primitive — Primary / Secondary / Tertiary / Link × SM / MD / LG.
 * Import `components/ds-components.css` and render inside `.ds-ui` for neutral tokens.
 */
export function Button({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  touchExpand = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const btn = (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {leadingIcon ? (
        <span className="ds-btn__icon ds-btn__icon--leading" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {trailingIcon ? (
        <span className="ds-btn__icon ds-btn__icon--trailing" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );

  if (touchExpand && size === "sm") {
    return <span className="ds-btn-hit ds-btn-hit--sm">{btn}</span>;
  }

  return btn;
}

export default Button;
