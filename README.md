# 약속의 길 · 요셉 편 (꿈꾸는 자, 창세기 37–42장)

모바일 세로 3D 성경 게임. 이 저장소는 **요셉 편만** 담고 있습니다. (야곱 편은 별도 저장소)

## 실행
- GitHub Pages: Settings → Pages → Branch `main` / `(root)` → 주소로 접속 (https여야 배경음악이 재생됩니다)
- 로컬: 폴더에서 `python3 -m http.server` 후 `http://localhost:8000` (`file://`로 열면 음악 대신 절차적 음악이 납니다)

## 구조
- `index.html`, `js/` : 게임 엔진과 요셉 편 (`js/ep_joseph.js`는 아래 조각을 이어 붙인 결과물)
- `music/` : 배경음악 17곡 (mp3)
- `ep_sources/joseph/` : 요셉 편 원본 조각. 수정 후 합치기:
  `sh build.sh` (또는 `cat ep_sources/joseph/{a_map,b_build,c_steps,d_world,e_cine,e_cine2,e_cine3,f_runtime}.js > js/ep_joseph.js`)
- `tools/music/` : 음악 작곡·렌더 도구 (README 참고)
- `tests/` : 자동 플레이/스모크 테스트 (Playwright, 경로는 스크립트 안에서 수정)
- `docs/요셉편_설계.md`, `인수인계_약속의길_v10.md`(최신), `인수인계_약속의길_v9.md` : 설계와 인수인계 문서

한국어 더빙은 v10에서 제거했습니다 (대사는 글자로만 나옵니다).
