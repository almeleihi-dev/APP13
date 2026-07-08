#!/usr/bin/env bash
# Regenerate public PNG identity assets from official SVG sources.
# Presentation assets only — safe to rerun before release builds.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUB="$ROOT/apps/web/public"
ICONS="$PUB/icons"
OG="$PUB/og"

mkdir -p "$OG" "$ICONS"

render_png() {
  local src="$1"
  local out="$2"
  local size="$3"
  qlmanage -t -s "$size" -o "$(dirname "$out")" "$src" >/dev/null 2>&1
  local generated="$(dirname "$out")/$(basename "$src").png"
  if [[ -f "$generated" && "$generated" != "$out" ]]; then
    mv "$generated" "$out"
  fi
}

echo "==> Open Graph PNG (1200)"
render_png "$OG/an-act-og.svg" "$OG/an-act-og.png" 1200
sips -z 630 1200 "$OG/an-act-og.png" >/dev/null

echo "==> App icons"
render_png "$ICONS/an-act-icon-512.svg" "$ICONS/an-act-icon-512.png" 512
render_png "$ICONS/an-act-icon-512.svg" "$ICONS/an-act-icon-192.png" 192
render_png "$ICONS/an-act-icon-512.svg" "$ICONS/an-act-icon-32.png" 32
render_png "$ICONS/an-act-apple-touch-icon.svg" "$ICONS/an-act-apple-touch-icon.png" 180

echo "==> Maskable icon (512, padded safe zone)"
cp "$ICONS/an-act-icon-512.png" "$ICONS/an-act-icon-512-maskable.png"
sips -Z 384 "$ICONS/an-act-icon-512-maskable.png" >/dev/null
# Pad to 512 canvas with black background using sips pad if available
sips --padToHeightWidth 512 512 --padColor 000000 "$ICONS/an-act-icon-512-maskable.png" >/dev/null 2>&1 || cp "$ICONS/an-act-icon-512.png" "$ICONS/an-act-icon-512-maskable.png"

echo "==> Done"
ls -la "$OG/an-act-og.png" "$ICONS"/*.png
