#!/bin/bash

echo "📊 BUNDLE ANALYSIS REPORT"
echo "================================"
echo ""

echo "📦 Main Assets:"
ls -lh dist/assets/*.js | awk '{print $9, "-", $5}' | head -10

echo ""
echo "📈 Bundle Sizes:"
find dist/assets -name "*.js" -exec du -h {} \; | sort -rh | head -10

echo ""
echo "🔍 Total Size:"
du -sh dist/

echo ""
echo "📋 File Count:"
find dist/assets -type f | wc -l

echo ""
echo "🎯 Gzip Estimates:"
find dist/assets -name "*.js" | head -5 | while read f; do
  size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo "?")
  echo "$f: $size bytes"
done
