#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPO="${1:-jemm-brand-guidelines}"
GH="${GH:-gh}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
  git branch -M main
fi

git add -A
if ! git diff --cached --quiet; then
  git commit -m "$(cat <<'EOF'
Update Jemm.ai brand guidelines.

EOF
)"
fi

if ! command -v "$GH" >/dev/null 2>&1; then
  echo ""
  echo "GitHub CLI (gh) not found. Repo is committed locally."
  echo ""
  echo "To publish manually:"
  echo "  1. Create a repo at https://github.com/new named: ${REPO}"
  echo "  2. Run:"
  echo "       git remote add origin git@github.com:YOUR_USERNAME/${REPO}.git"
  echo "       git push -u origin main"
  echo "  3. Enable Pages: Settings → Pages → Deploy from branch main / root"
  echo ""
  echo "Or install gh and re-run: https://cli.github.com/"
  exit 0
fi

if ! "$GH" auth status >/dev/null 2>&1; then
  echo "Log in to GitHub first: gh auth login"
  exit 1
fi

OWNER="$("$GH" api user --jq '.login')"

if git remote get-url origin >/dev/null 2>&1; then
  echo "Pushing to existing remote..."
  git push -u origin main
else
  echo "Creating private repo ${OWNER}/${REPO}..."
  "$GH" repo create "$REPO" \
    --private \
    --source=. \
    --remote=origin \
    --push \
    --description "Jemm.ai Brand & Style Guidelines — Emerald design system"
fi

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
