#!/bin/bash

ZIP_NAME="layout-fixer.zip"
UUID=$(grep -Po '"uuid": *\K"[^"]*"' metadata.json | sed 's/"//g')

if [ -z "$UUID" ]; then
    exit 1
fi

rm -f "../$ZIP_NAME"
BUILD_DIR="build_temp"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

cp metadata.json extension.js prefs.js LICENSE README.md icon.svg "$BUILD_DIR/"
cp -r schemas "$BUILD_DIR/"
rm -f "$BUILD_DIR/schemas/gschemas.compiled"

cd "$BUILD_DIR"
zip -r "../../$ZIP_NAME" ./*
cd ..
rm -rf "$BUILD_DIR"
