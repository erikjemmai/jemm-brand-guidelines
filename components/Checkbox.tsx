import type { InputHTMLAttributes, ReactNode } from "react";

const CheckIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path
      d="M2 6l3 3 5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Checkbox({ label, id, className, ...rest }: CheckboxProps) {
  const inputId = id ?? `ds-check-${String(label).replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <label className={["ds-checkbox", className].filter(Boolean).join(" ")} htmlFor={inputId}>
      <input type="checkbox" id={inputId} {...rest} />
      <span className="ds-checkbox__box" aria-hidden="true">
        <CheckIcon />
      </span>
      <span className="ds-checkbox__label">{label}</span>
    </label>
  );
}

export default Checkbox;
