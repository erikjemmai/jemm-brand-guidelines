import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface TabItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  "aria-label": string;
  /** Pill (default) or underline variant */
  variant?: "pill" | "underline";
  className?: string;
}

/**
 * Accessible tab list. Pair with tab panels in the consuming app.
 */
export function Tabs({
  items,
  value,
  onChange,
  "aria-label": ariaLabel,
  variant = "pill",
  className,
}: TabsProps) {
  const rootClass = [
    "ds-tabs",
    variant === "underline" && "ds-tabs--underline",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const selected = item.id === value;
        const props: ButtonHTMLAttributes<HTMLButtonElement> = {
          type: "button",
          role: "tab",
          id: `tab-${item.id}`,
          className: ["ds-tabs__tab", selected && "is-active"].filter(Boolean).join(" "),
          "aria-selected": selected,
          "aria-controls": `panel-${item.id}`,
          tabIndex: selected ? 0 : -1,
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

export default Tabs;
