import type { InputHTMLAttributes, ReactNode } from "react";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

/** On/off switch — native checkbox for a11y, styled track/thumb. */
export function Toggle({ label, id, className, ...rest }: ToggleProps) {
  const inputId = id ?? `ds-toggle-${String(label).replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <label className={["ds-toggle", className].filter(Boolean).join(" ")} htmlFor={inputId}>
      <input type="checkbox" id={inputId} role="switch" {...rest} />
      <span className="ds-toggle__track" aria-hidden="true">
        <span className="ds-toggle__thumb" />
      </span>
      <span className="ds-toggle__label">{label}</span>
    </label>
  );
}

export default Toggle;
