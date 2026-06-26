# Jemm.ai Brand & Style Guidelines

Official Emerald brand system for [Jemm.ai](https://jemm.ai) — interactive tile-based guidelines with atomic spacing, typography, color, and component specs.

**Live site:** Enable GitHub Pages after publishing (see below).

## Chapters

| # | Section | Contents |
|---|---------|----------|
| 01 | Voice & Tone | Brand personality pillars |
| 02 | Logo | Mark, lockup, treatments |
| 03 | Typography | H1 64–72 · H2 48 · H3 36 · Body 16 · Caption 12 |
| 04 | Spacing | Atomic 4px grid (`--space-1` through `--space-24`) |
| 05 | Color | Emerald palette + support tints |
| 06 | Applications | Business card, app icon, login |
| 07 | Components | Buttons, tabs, toggles, checkboxes, button groups |

## Local preview

```bash
cd jemm-brand-guidelines
python3 -m http.server 8092
```

Open http://localhost:8092

## Publish to GitHub

```bash
cd jemm-brand-guidelines
chmod +x scripts/publish.sh
./scripts/publish.sh
```

## Design tokens

### Spacing (4px base)
`--space-1` 4px · `--space-2` 8px · `--space-3` 12px · `--space-4` 16px · `--space-6` 24px · `--space-8` 32px · `--space-12` 48px · `--space-16` 64px · `--space-24` 96px

### Type
| Token | Size | Use |
|-------|------|-----|
| H1 | 64–72px | Hero headlines |
| H2 | 48px | Section headings |
| H3 | 36px | Page titles |
| Body | 16px | Paragraphs, UI |
| Caption | 12px | Metadata, labels |
| Button SM/MD/LG | 12 / 14 / 16px | Button labels |
