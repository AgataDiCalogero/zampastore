#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Linux" ]]; then
  exit 0
fi

if ! command -v apt >/dev/null 2>&1 || ! command -v dpkg-deb >/dev/null 2>&1; then
  echo "Skipping Cypress Linux libs bootstrap: apt or dpkg-deb not available."
  exit 0
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE_DIR="$ROOT_DIR/.cache/system-libs"
LIB_DIR="$CACHE_DIR/usr/lib/x86_64-linux-gnu"

has_required_libs() {
  [[ -f "$LIB_DIR/libnss3.so" ]] &&
    [[ -f "$LIB_DIR/libnspr4.so" ]] &&
    [[ -f "$LIB_DIR/libasound.so.2" || -f "$LIB_DIR/libasound.so.2.0.0" ]]
}

download_and_extract() {
  local package_name="$1"
  local deb_file

  deb_file="$(ls -t "$CACHE_DIR"/"${package_name}"_*_amd64.deb 2>/dev/null | head -n 1 || true)"
  if [[ -z "$deb_file" ]]; then
    (
      cd "$CACHE_DIR"
      apt download "$package_name" >/dev/null
    )
    deb_file="$(ls -t "$CACHE_DIR"/"${package_name}"_*_amd64.deb 2>/dev/null | head -n 1 || true)"
  fi

  if [[ -z "$deb_file" ]]; then
    return 1
  fi

  dpkg-deb -x "$deb_file" "$CACHE_DIR"
}

if has_required_libs; then
  echo "Cypress Linux runtime libs already available in $LIB_DIR"
  exit 0
fi

mkdir -p "$CACHE_DIR"

download_and_extract libnss3
download_and_extract libnspr4
if ! download_and_extract libasound2t64; then
  download_and_extract libasound2
fi

if ! has_required_libs; then
  echo "Missing one or more Cypress Linux runtime libs in $LIB_DIR after bootstrap." >&2
  exit 1
fi

echo "Cypress Linux runtime libs bootstrapped in $LIB_DIR"
