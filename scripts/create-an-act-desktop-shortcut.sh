#!/usr/bin/env bash
# Creates ~/Desktop/AN ACT.app — opens http://localhost:5173/
# Presentation/tooling only. Does not modify product code.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSET_DIR="$ROOT/scripts/desktop-shortcut"
SVG="$ROOT/apps/web/public/icons/an-act-icon-512.svg"
PNG="$ASSET_DIR/an-act-icon-512.png"
ICNS="$ASSET_DIR/an-act-icon.icns"
APP="$HOME/Desktop/AN ACT.app"
ICONSET="$ASSET_DIR/an-act-icon.iconset"

mkdir -p "$ASSET_DIR"

if [[ ! -f "$PNG" ]]; then
  echo "==> Converting SVG to PNG"
  qlmanage -t -s 1024 -o "$ASSET_DIR" "$SVG" >/dev/null 2>&1
  if [[ -f "$ASSET_DIR/an-act-icon-512.svg.png" ]]; then
    mv "$ASSET_DIR/an-act-icon-512.svg.png" "$PNG"
  fi
fi

if [[ ! -f "$PNG" ]]; then
  echo "ERROR: Could not create PNG from $SVG" >&2
  exit 1
fi

if [[ ! -f "$ICNS" ]]; then
  echo "==> Building ICNS"
  rm -rf "$ICONSET"
  mkdir -p "$ICONSET"
  sips -z 16 16     "$PNG" --out "$ICONSET/icon_16x16.png"      >/dev/null
  sips -z 32 32     "$PNG" --out "$ICONSET/icon_16x16@2x.png"   >/dev/null
  sips -z 32 32     "$PNG" --out "$ICONSET/icon_32x32.png"     >/dev/null
  sips -z 64 64     "$PNG" --out "$ICONSET/icon_32x32@2x.png"  >/dev/null
  sips -z 128 128   "$PNG" --out "$ICONSET/icon_128x128.png"    >/dev/null
  sips -z 256 256   "$PNG" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
  sips -z 256 256   "$PNG" --out "$ICONSET/icon_256x256.png"    >/dev/null
  sips -z 512 512   "$PNG" --out "$ICONSET/icon_256x256@2x.png" >/dev/null
  sips -z 512 512   "$PNG" --out "$ICONSET/icon_512x512.png"    >/dev/null
  sips -z 1024 1024 "$PNG" --out "$ICONSET/icon_512x512@2x.png" >/dev/null
  iconutil -c icns "$ICONSET" -o "$ICNS"
  rm -rf "$ICONSET"
fi

echo "==> Creating $APP"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

cat > "$APP/Contents/MacOS/launcher" <<'EOF'
#!/bin/bash
open "http://localhost:5173/"
EOF
chmod +x "$APP/Contents/MacOS/launcher"

cp "$ICNS" "$APP/Contents/Resources/AppIcon.icns"

cat > "$APP/Contents/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleExecutable</key>
  <string>launcher</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleIdentifier</key>
  <string>local.an-act.launcher</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>AN ACT</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSMinimumSystemVersion</key>
  <string>10.13</string>
</dict>
</plist>
EOF

# Refresh Finder icon cache for the new app
touch "$APP"

echo "==> Done"
echo "Shortcut: $APP"
echo "Opens:    http://localhost:5173/"
echo "Icon:     $ICNS (from $SVG)"
