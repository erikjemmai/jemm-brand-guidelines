#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GH="${GH:-gh}"
if ! command -v "$GH" >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install: https://cli.github.com/"
  exit 1
fi

if ! "$GH" auth status >/dev/null 2>&1; then
  echo "Log in to GitHub first: gh auth login"
  exit 1
fi

REPO="${1:-jemm-brand-guidelines}"
OWNER="$("$GH" api user --jq '.login')"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Git repo already initialized."
else
  git init
  git branch -M main
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote origin already set."
else
  echo "Creating private repo ${OWNER}/${REPO}..."
  "$GH" repo create "$REPO" \
    --private \
    --source=. \
    --remote=origin \
    --push \
    --description "Jemm.ai Brand & Style Guidelines — Emerald design system"
fi

git add -A
if git diff --cached --quiet; then
  echo "Nothing to commit."
else
  git commit -m "$(cat <<'EOF'
Publish Jemm.ai brand guidelines with atomic design system.

Interactive tile framework, spacing tokens, typography scale, and component library.
EOF
)"
fi

git push -u origin main

echo ""
echo "Enabling GitHub Pages..."
"$GH" api "repos/${OWNER}/${REPO}/pages" \
  -X POST \
  -f build_type=legacy \
  -f source[branch]=main \
  -f source[path]=/ 2>/dev/null || \
"$GH" api "repos/${OWNER}/${REPO}/pages" \
  -X PUT \
  -f build_type=legacy \
  -f source[branch]=main \
  -f source[path]=/

echo ""
echo "Done."
echo "Repo:  https://github.com/${OWNER}/${REPO}"
echo "Pages: https://${OWNER}.github.io/${REPO}/"
