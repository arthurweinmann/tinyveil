#!/bin/bash

str="${tag//./_}"

mv tinyveil.js tinyveil_$str.js

gh release create "$tag" tinyveil_$str.js \
  --repo="$GITHUB_REPOSITORY" \
  --title="${GITHUB_REPOSITORY#*/} ${tag#v}" \
  --generate-notes