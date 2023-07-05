#!/bin/bash

str="${tag//./_}"

mv typesystem.js typesystem_$str.js

gh release create "$tag" typesystem_$str.js \
  --repo="$GITHUB_REPOSITORY" \
  --title="${GITHUB_REPOSITORY#*/} ${tag#v}" \
  --generate-notes