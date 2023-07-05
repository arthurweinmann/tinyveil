#!/bin/bash

tag=${{  github.ref_name }}

str="${tag// ./_}"

GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}

mv typesystem.js typesystem_$str.js

gh release create "$tag" typesystem_$str.js \
  --repo="$GITHUB_REPOSITORY" \
  --title="${GITHUB_REPOSITORY#*/} ${tag#v}" \
  --generate-notes