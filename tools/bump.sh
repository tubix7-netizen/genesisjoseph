#!/bin/sh
# 요셉 편 조각을 다시 합치고, index.html 스크립트 꼬리표(?v=)를 바꿔 브라우저 캐시를 비웁니다 (스크립트를 고친 뒤 실행)
cd "$(dirname "$0")/.." && sh build.sh && v=$(date +%s) && sed -i '' -E "s#\?v=[0-9a-z]+\"#?v=$v\"#g" index.html && echo "?v=$v"
