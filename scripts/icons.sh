#!/usr/bin/env bash
# Favicons and the Open Graph image from the app's single logo source.
set -euo pipefail
MARK="${SAYSO_MARK:-../sayso/src/assets/sayso-mark.svg}"
cp "$MARK" public/mark.svg
rsvg-convert -w 256 -h 256 "$MARK" -o public/icon-256.png
rsvg-convert -w 180 -h 180 "$MARK" -o public/apple-touch-icon.png
rsvg-convert -w 64 -h 64 "$MARK" -o public/favicon.png
rsvg-convert -w 48 -h 48 "$MARK" -o /tmp/sayso-fav48.png
magick /tmp/sayso-fav48.png public/favicon.ico
rsvg-convert -w 1200 -h 630 scripts/og.svg -o public/og.png
