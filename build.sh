#!/bin/sh
# 요셉 편 조각을 이어 붙여 js/ep_joseph.js 를 만듭니다 (조각을 고친 뒤 꼭 실행)
cd "$(dirname "$0")" && cat ep_sources/joseph/a_map.js ep_sources/joseph/b_build.js ep_sources/joseph/c_steps.js ep_sources/joseph/d_world.js ep_sources/joseph/e_cine.js ep_sources/joseph/e_cine2.js ep_sources/joseph/e_cine3.js ep_sources/joseph/f_runtime.js > js/ep_joseph.js && echo "js/ep_joseph.js 생성"
