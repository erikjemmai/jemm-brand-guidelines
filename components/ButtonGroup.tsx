import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonGroupItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  items: ButtonGroupItem[];
  value: string;
  onChange: (id: string) => void;
  "aria-label": string;
  className?: string;
}

/**
 * Segmented single-select control. Uses ds-btn-group BEM classes.
 */
export function ButtonGroup({
  items,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: ButtonGroupProps) {
  return (
    <div className={["ds-btn-group", className].filter(Boolean).join(" ")} role="group" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.id === value;
        const props: ButtonHTMLAttributes<HTMLButtonElement> = {
          type: "button",
          className: ["ds-btn-group__btn", isActive && "is-active"].filter(Boolean).join(" "),
          "aria-pressed": isActive,
          disabled: item.disabled,
          onClick: () => onChange(item.id),
        };
        return (
          <button key={item.id} {...props}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default ButtonGroup;
