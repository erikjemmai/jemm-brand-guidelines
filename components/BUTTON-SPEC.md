# Jemm Button & Control System — Specification

> **Status:** Live WIP. Draft patterns — the app hasn’t shipped yet.

---

## Brand color (Primary · Secondary · Link)

| Mode | Primary fill | Secondary outline + text | Link text |
|------|--------------|--------------------------|-----------|
| **Light** | Emerald `#059161` · white label | 1 px emerald outline · emerald text | Emerald · underline on hover |
| **Dark** | Neon `#00d58c` · ink label | 1 px neon outline · neon text | Neon · underline on hover |

**Tertiary** stays neutral (dark text on light surfaces, light text on dark) — no brand fill.

**Link** can be a `<button class="ds-btn ds-btn--link">` or an `<a class="ds-btn ds-btn--link">`.

---

## Photo, video & image backgrounds

On busy or multicolor fills (hero photos, video, artwork), **do not use green buttons** — they clash with unpredictable hues.

| Variant | Use |
|---------|-----|
| **`.ds-btn--inverse`** | White solid primary |
| **`.ds-btn--inverse-outline`** | White 1 px outline secondary |

Reserve these for media overlays only — not flat app chrome.

---

## Button labels

Height is **fixed per tier**; width grows with copy.

| Length | Verdict | Example |
|--------|---------|---------|
| **1 word** | Ideal | Submit, Save, Start |
| **2 words** | OK | Log in, View all |
| **3 words** | Push it | Add a device — Large only |
| **4+ words** | Nope | Never — use a headline for context |

---

## Placement & button order

Order depends on **alignment context**, not a single global rule.

### Left-aligned CTAs (hero, cards, marketing sections)

Actions start from the **left**. Primary is **leftmost** — highest emphasis first in reading order.

```
[ Primary ]  [ Secondary ]  [ Tertiary ]
     ↓              ↓              ↓
  Start          Learn           Docs
```

**Use when:** hero blocks, feature cards, empty states, website sections, left-aligned content columns.

**CSS:** `.ds-btn-row.ds-btn-row--start`

### Right-aligned action bars (tables, modals, toolbars)

Actions flush **right**. Primary is **rightmost** — hierarchy decreases moving left.

```
[ Tertiary ]  [ Secondary ]  [ Primary ]
     ↓              ↓              ↓
  Export         Filter           Add
```

**Use when:** table header toolbars, modal/dialog footers, form action rows, filter bars, page headers with utilities on the right.

**CSS:** `.ds-btn-row.ds-btn-row--end`

### DOM order note (right-aligned)

In HTML, list buttons **Tertiary → Secondary → Primary** (low → high emphasis). Flex `justify-content: flex-end` places Primary on the right while keeping tab order logical (utilities first, commit action last).

---

## Design principles

1. **One primary action per view.** Only one Primary button should compete for attention in a given layout region.
2. **Pair secondary with primary.** Cancel / Learn more sit beside Submit / Continue as Secondary.
3. **Tertiary for utilities.** Edit, View all, overflow actions — visible but quiet.
4. **Link for legal / inline nav.** Terms, Forgot password — minimal chrome, underline on hover.
5. **Never shrink touch targets.** Medium and Large are ≥ 44×44 px natively. Wrap Small controls in `.ds-btn-hit.ds-btn-hit--sm` on touch layouts.

---

## Hierarchy

| Variant | Visual | Emphasis | Typical use |
|---------|--------|----------|-------------|
| **Primary** | Solid dark fill, light label | High | Log in, Submit, Save, Get started |
| **Secondary** | 1 px outline, transparent fill, dark label | Medium | Cancel, Learn more, Back |
| **Tertiary** | No border, transparent fill, dark label | Low | Edit, View all, Filter |
| **Link** | Text-only, underline on hover | Minimal | Terms of service, Forgot password |

### Pairing examples

**Right-aligned** (modal footer, table toolbar):

```
[ Cancel ]  [ Submit ]
              ↑ primary · rightmost
```

**Left-aligned** (hero, card, section):

```
[ Start ]  [ Learn ]
   ↑ primary · leftmost
```

Never place two Primary buttons in the same group unless they represent genuinely equal-weight choices (rare).

---

## Size tiers

Maintain **1:2** vertical-to-horizontal padding (Small, Medium) or **1:2** (Large ≈ 1:2).

| Tier | Height | Font | Weight | Padding (V × H) | Radius | Context |
|------|--------|------|--------|-----------------|--------|---------|
| **Small** | **32 px** | 14 px | Medium (500) | 6 × 12 px | 4 px | Dense UI, tables, toolbars |
| **Medium** | **44 px** | 16 px | Medium (500) | 10 × 20 px | 8 px | **Default** — standard pages, forms, dialogs |
| **Large** | **56 px** | 18 px | Bold (700) | 14 × 28 px | 12 px | Hero CTAs, onboarding, conversion paths |

**Height is fixed; width is not.** Label length changes button width, not height.

---

## States (required on every interactive control)

| State | Behavior |
|-------|----------|
| **Default** | Resting appearance |
| **Hover** | Subtle background shift (filled) or wash (ghost/outline) |
| **Active / Pressed** | `transform: scale(0.98)` + darker tint |
| **Focus** | Visible **2 px ring**, **2 px offset** — `:focus-visible` only |
| **Disabled** | `opacity: 0.45`, `cursor: not-allowed`, no pointer events |

Do not rely on hover alone for critical affordances.

---

## Structure

```html
<button type="button" class="ds-btn ds-btn--primary ds-btn--md">
  <span class="ds-btn__icon" aria-hidden="true"><!-- svg --></span>
  <span>Label</span>
</button>
```

- **Layout:** `inline-flex`, `align-items: center`, `justify-content: center`
- **Icon gap:** `8 px` between icon and label
- **Icon slots:** leading (before) or trailing (after) — decorative icons use `aria-hidden="true"`

### Small + touch devices

```html
<span class="ds-btn-hit ds-btn-hit--sm">
  <button type="button" class="ds-btn ds-btn--tertiary ds-btn--sm">Edit</button>
</span>
```

On `(pointer: coarse)`, the hit wrapper expands the tap area to **≥ 44 × 44 px** without changing visual size.

---

## Related controls

| Component | Role | Notes |
|-----------|------|-------|
| **Button group** | Single selection among 2–5 options | Use `role="group"` + `aria-pressed` on segments |
| **Tabs** | Section navigation within a panel | `role="tablist"` / `role="tab"` / `aria-selected` |
| **Toggle** | Immediate on/off | Native checkbox + styled track; label clickable |
| **Checkbox** | Multi-select / consent | 20 px box, 4 px radius, checkmark on select |
| **Radio** | Single select in a set | Same focus/disabled patterns as checkbox |

---

## Skinning

Brand tokens live on `.ds-ui`:

```css
.ds-ui {
  --ds-brand: #059161;           /* light */
  --ds-btn-primary-bg: var(--ds-brand);
  --ds-btn-secondary-border: var(--ds-brand);
  --ds-btn-link-fg: var(--ds-brand);
}

[data-mode="dark"] .ds-ui {
  --ds-brand: #00d58c;
}
```

---

## Tailwind reference (optional)

```html
<!-- Primary · Medium -->
<button class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 text-base font-medium text-white transition hover:bg-neutral-900 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-45">
  Submit
</button>
```

Map `neutral-950` → your primary token when skinning.

---

## File map

| File | Purpose |
|------|---------|
| `components/ds-components.css` | Canonical CSS implementation (scoped `.ds-ui`) |
| `components/Button.tsx` | React button primitive |
| `components/ButtonGroup.tsx` | Segmented control |
| `components/Tabs.tsx` | Tab list |
| `components/Toggle.tsx` | Switch |
| `components/Checkbox.tsx` | Checkbox + label |
| `components/types.ts` | Shared TypeScript types |
| `components/index.ts` | Public exports |

---

## Accessibility checklist

- [ ] Every control is a `<button>` or has an associated `<label>`
- [ ] Icon-only buttons have `aria-label`
- [ ] Tab order matches visual order
- [ ] Focus ring visible on keyboard navigation
- [ ] Disabled state exposed via `disabled` or `aria-disabled="true"`
- [ ] Color is not the only state indicator (position, weight, icon also help)
