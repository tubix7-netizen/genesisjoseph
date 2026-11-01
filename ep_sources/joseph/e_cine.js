
// ------------------------------------------------------------------ POSES for this episode (player & NPCs)
const MP = GG.Motion.POSES, B = GG.HBI;
const sst = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const bset = (rig, b, x, y, z) => rig.set(b, x, y || 0, z || 0);
function addPose(name, up, fn, holdIK) { MP[name] = fn; fn.up = !!up; if (holdIK && GG.Motion.HOLD_IK_OFF) GG.Motion.HOLD_IK_OFF.add(name); }
addPose('bound', true, (rig, p, t) => { // wrists tied in front, head low (the rope / the fetters)
  bset(rig, B.uArmL, -0.45, 0, -0.36); bset(rig, B.uArmR, -0.45, 0, 0.36); bset(rig, B.fArmL, -1.0, 0.35); bset(rig, B.fArmR, -1.0, -0.35);
  bset(rig, B.chest, 0.14); bset(rig, B.head, 0.3 + Math.sin(t * 0.7) * 0.03); rig.faceE = 0.55; });
addPose('fallen', false, (rig, p, t) => { // thrown down: on the back, knees drawn up, an arm over the face
  rig.off[1] = -0.74; bset(rig, B.pelvis, -Math.PI / 2 + 0.05); bset(rig, B.chest, 0.28 + Math.sin(t * 1.6) * 0.02); bset(rig, B.head, 0.3, 0.25, 0);
  bset(rig, B.uArmR, -2.2, 0, 0.5); bset(rig, B.fArmR, -2.2); bset(rig, B.uArmL, -0.3, 0, -0.2); bset(rig, B.fArmL, -0.5);
  bset(rig, B.thighL, -0.4, 0, -0.32); bset(rig, B.shinL, 0.7); bset(rig, B.thighR, -0.3, 0, -0.38); bset(rig, B.shinR, 0.55); rig.faceE = 0.2; }, true); // v13: knees together and fallen to one side, not drawn up
addPose('reach', true, (rig, p, t) => { const s = Math.sin(t * 3) * 0.08; // reaching up the wall
  bset(rig, B.uArmL, -2.95 + s, 0, -0.12); bset(rig, B.uArmR, -2.9 - s, 0, 0.12); bset(rig, B.fArmL, -0.15); bset(rig, B.fArmR, -0.15); bset(rig, B.chest, -0.18); bset(rig, B.head, -0.5); });
addPose('mourn', false, (rig, p, t) => { const sob = Math.sin(t * 5.2) * 0.045 * (0.6 + 0.4 * Math.sin(t * 1.1)); // on the knees, hands on the head
  rig.off[1] = -0.66; bset(rig, B.thighL, -1.42, 0, 0.1); bset(rig, B.thighR, -1.42, 0, -0.1); bset(rig, B.shinL, 2.85); bset(rig, B.shinR, 2.85);
  bset(rig, B.pelvis, 0.18); bset(rig, B.chest, 0.42 + sob); bset(rig, B.head, 0.38); bset(rig, B.uArmL, -0.95, 0, -0.42 + sob); bset(rig, B.uArmR, -0.95, 0, 0.42 - sob); bset(rig, B.fArmL, -2.3, 0.25); bset(rig, B.fArmR, -2.3, -0.25); rig.faceE = 0.1; }, true); // v12: hands over the face, elbows in (it used to throw the arms over the head)
addPose('tearClothes', false, (rig, p, t) => { const rip = sst(0.25, 0.42, p) * (1 - sst(0.8, 1, p)); // rend the garment at the neck
  rig.off[1] = -0.36; bset(rig, B.thighL, -1.1, 0, 0.12); bset(rig, B.shinL, 1.6); bset(rig, B.thighR, 0.05, 0, -0.08); bset(rig, B.shinR, 1.2);
  bset(rig, B.chest, 0.2 + 0.15 * rip); bset(rig, B.head, -0.25 + 0.4 * rip); bset(rig, B.uArmL, -1.35, 0, -0.35 + 0.75 * rip); bset(rig, B.uArmR, -1.35, 0, 0.35 - 0.75 * rip);
  bset(rig, B.fArmL, -1.5 + 0.6 * rip); bset(rig, B.fArmR, -1.5 + 0.6 * rip); rig.faceE = 0.2; }, true);
addPose('beg', false, (rig, p, t) => { const s = Math.sin(t * 2.2) * 0.07; // kneeling, hands held out
  rig.off[1] = -0.62; bset(rig, B.thighL, -1.3, 0, 0.12); bset(rig, B.thighR, -1.3, 0, -0.12); bset(rig, B.shinL, 2.6); bset(rig, B.shinR, 2.6);
  bset(rig, B.chest, 0.12 + s * 0.5); bset(rig, B.head, -0.22); bset(rig, B.uArmL, -1.45 + s, 0, -0.12); bset(rig, B.uArmR, -1.45 - s, 0, 0.12); bset(rig, B.fArmL, -0.45); bset(rig, B.fArmR, -0.45); rig.faceE = 0.4; }, true);
addPose('grabCloth', true, (rig, p, t) => { bset(rig, B.uArmR, -1.55, 0, 0.12); bset(rig, B.fArmR, -0.35); bset(rig, B.uArmL, -1.2, 0, -0.1); bset(rig, B.fArmL, -0.7); bset(rig, B.chest, 0.2); bset(rig, B.head, -0.05); });
addPose('present', true, (rig, p, t) => { bset(rig, B.uArmL, -1.2, 0, -0.28); bset(rig, B.uArmR, -1.2, 0, 0.28); bset(rig, B.fArmL, -0.65, 0.2); bset(rig, B.fArmR, -0.65, -0.2); bset(rig, B.chest, 0.18); bset(rig, B.head, 0.22); });
addPose('charioteer', false, (rig, p, t) => { const b = Math.sin(t * 9) * 0.015; // standing in the chariot, reins in the hands
  rig.off[1] = -0.07 + b; bset(rig, B.thighL, -0.28, 0, 0.1); bset(rig, B.shinL, 0.45); bset(rig, B.thighR, -0.12, 0, -0.1); bset(rig, B.shinR, 0.3);
  bset(rig, B.chest, 0.16); bset(rig, B.head, -0.05); bset(rig, B.uArmL, -0.85, 0, -0.18); bset(rig, B.uArmR, -0.85, 0, 0.18); bset(rig, B.fArmL, -0.95); bset(rig, B.fArmR, -0.95); }, true);
addPose('shave', true, (rig, p, t) => { const s = Math.sin(t * 6) * 0.15; bset(rig, B.uArmR, -0.6, 0, 0.42); bset(rig, B.fArmR, -2.3 + s, -0.3); bset(rig, B.uArmL, -0.4, 0, -0.3); bset(rig, B.fArmL, -1.2); bset(rig, B.head, -0.15, 0.2, 0); });
addPose('scratchWall', true, (rig, p, t) => { const s = Math.sin(t * 7) * 0.18; bset(rig, B.uArmR, -1.75, 0, 0.1); bset(rig, B.fArmR, -0.35 + s); bset(rig, B.uArmL, -0.3, 0, -0.1); bset(rig, B.fArmL, -0.5); bset(rig, B.head, 0.12); });
addPose('kneelPray', false, (rig, p, t) => { const br = Math.sin(t * 1.3) * 0.02; // on the knees, hands folded, face lifted
  rig.off[1] = -0.66; bset(rig, B.thighL, -1.42, 0, 0.1); bset(rig, B.thighR, -1.42, 0, -0.1); bset(rig, B.shinL, 2.85); bset(rig, B.shinR, 2.85);
  bset(rig, B.chest, 0.06 + br); bset(rig, B.head, -0.32); bset(rig, B.uArmL, -0.75, 0, -0.42); bset(rig, B.uArmR, -0.75, 0, 0.42); bset(rig, B.fArmL, -1.75, 0.3); bset(rig, B.fArmR, -1.75, -0.3); rig.faceE = 0.25; }, true);

// ------------------------------------------------------------------ HELPERS
const hAt = (x, z) => { const h = Gm().W().heightAt(x, z), f = pitFloor(x, z); return f !== null ? Math.max(h, f) : h; };
const at = (x, z, dy) => [x, hAt(x, z) + (dy || 0), z];
const P_ = () => Gm().P;
const cpose = (k, dur, hold) => { P_().cpose = k ? { k, t: 0, dur: dur || 0, hold: !!hold } : null; };
function npcSet(id, props) { const n = Gm().npc(id); if (!n) return null; n.d = Object.assign({}, n.d, props); if (props.look) n.meshes = null; return n; }
function place(id, x, z, face, o) { const Gx = Gm(), n = Gx.npc(id); if (!n) return null; Gx.npcTo(id, x, z, face, false); n.walk = null; n.sit = !!(o && o.sit); n.act = (o && o.act) || null; n.emote = null; if (o && o.vis !== undefined) n.forceVis = o.vis; return n; }
function walkTo(id, x, z, sp, cb) { const n = Gm().npc(id); if (!n) return; n.sit = false; n.act = null; Gm().npcWalk(id, x, z, () => { cb && cb(n); }, sp || 2); if (n.walk) n.walk.solid = false; }
function emote(id, k, dur) { const n = Gm().npc(id); if (n) n.emote = { k, t: 0, dur: dur || 2.5 }; }
function face(id, x, z) { const n = Gm().npc(id); if (n) { n.face = n.homeFace = Math.atan2(x - n.x, z - n.z); } }
const bubble = (id, t, d) => GG.Life && GG.Life.bubble(id, t, d || 3);
const cine = (shots, done, o) => GG.Cine.play(shots, done, o);
const fade = (mid, after) => GG.UI.fade(mid, after);
const RT = { crumbs: [], car: null, cows: [], tw: [], t: 0, grace: 0 };
const OUTFIT_AT = [['p_wake', 'josephCoat'], ['c1_pit', 'josephPlain'], ['c2_arrive', 'josephSlave'], ['c2_manage', 'josephSteward'], ['c2_flee', 'josephFled'], ['c3_cell', 'josephFettered'],
  ['c3_charge', 'josephPrisoner'], ['c4_court', 'josephShaved'], ['c5_patrol', 'josephVizier']];
function outfitFor(S) { let o = 'josephCoat'; for (const [k, v] of OUTFIT_AT) if (!before(S, k)) o = v; const wd = S.flags && S.flags.ward; if (o === 'josephVizier' && wd && wd.sel && WARD[wd.sel]) o = wd.sel; return o; }
// ------------------------------------------------------------------ v16 옷장: once Joseph is vizier he can have clothes made and change into them
const WARD = {
  josephVizier: { n: '총리 예복', d: '바로가 입혀 준 세마포 옷과 금 사슬', need: null },
  wLinen: { n: '세마포 평상복', d: '가벼운 아마 치마와 청록 목걸이. 더운 날 들판 순찰에 좋아요.', need: { linen: 1 } },
  wLapis: { n: '청금석 예복', d: '푸른 물을 들인 긴 옷에 금띠. 궁에 들어갈 때 입어요.', need: { cloth: 2 }, silver: 40 },
  wFeast: { n: '잔치 예복', d: '흰 겉옷에 금 테두리. 손님을 맞을 때 입어요.', need: { linen: 2 }, silver: 60 },
  wRed: { n: '붉은 겉옷', d: '붉게 물들인 양털 겉옷. 밤바람이 찬 날에 좋아요.', need: { wool: 2, cloth: 1 } },
  wField: { n: '들판 차림', d: '수수한 겉옷과 가죽 띠. 사냥하고 낚시할 때 편해요.', need: { wool: 2, thread: 1 } },
  wCoat: { n: '채색옷 (그리움)', d: '아버지가 지어 주신 채색옷을 떠올리며 새로 지었어요.', need: { cloth: 3, thread: 2 } },
  josephShaved: { n: '겉옷 벗기', d: '겉옷을 벗고 아마 치마만 입어요.', need: null } };
const WARD_LOOKS = {
  wLinen: Object.assign({}, JO, { skin: 0xd09868, bare: true, kilt: true, kiltLong: true, bottom: LINEN, collar: TURQ, collar2: GOLD, hairStyle: 'wig', hair: 0x15100c, build: 0.95, jaw: 0.05, sandal: 0x8a6a40 }),
  wLapis: Object.assign({}, LOOK.josephVizier, { top: LAPIS, under: LINEN, trim: GOLD, trim2: LINEN, sash: GOLD }),
  wFeast: Object.assign({}, LOOK.josephVizier, { mantle: LINEN, mantleTrim: GOLD, collar: GOLD, collar2: TURQ }),
  wRed: Object.assign({}, LOOK.josephVizier, { mantle: 0x9a2a22, mantleTrim: GOLD }),
  wField: Object.assign({}, JO, { skin: 0xd09868, top: 0xc8a878, trim: 0x6a4a30, belt: 0x5a3a22, mantle: 0x6a5a48, hairStyle: 'short', build: 0.95, jaw: 0.05 }),
  wCoat: Object.assign({}, LOOK.josephCoat, { skin: 0xd09868, build: 0.95, jaw: 0.05 }) };
function wardState(S) { const w = S.flags.ward = S.flags.ward || { own: { josephVizier: 1, josephShaved: 1 }, sel: null }; return w; }
function openWardrobe(S, G2) { const UI = GG.UI, w = wardState(S); let el = document.getElementById('wardUI');
  if (!el) { el = document.createElement('div'); el.className = 'overlay sheet'; el.id = 'wardUI'; el.hidden = true; document.body.appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (e.target.closest('#wardX') || e.target === el) { el.hidden = true; UI.setBusy('ward', false); return; } if (!b) return; const k = b.dataset.w, it = WARD[k], st = wardState(Gm().S());
      if (!st.own[k]) { const S2 = Gm().S(); for (const i in it.need || {}) if (!Gm().have(i, it.need[i])) { UI.toast(`${Gm().ITEMS[i].n}이(가) 모자라요`); return; } if (it.silver && S2.silver < it.silver) { UI.toast('은이 부족해요'); return; }
        for (const i in it.need || {}) Gm().take(i, it.need[i]); if (it.silver) Gm().silver(-it.silver); st.own[k] = 1; GG.Audio && GG.Audio.sfx('craft'); UI.toast(`${it.n}을(를) 지었어요`); }
      st.sel = k === 'josephVizier' ? null : k; Gm().setOutfit(outfitFor(Gm().S())); const P = Gm().P; GG.FX.burst(P.x, P.y + 1.1, P.z, 18, { c: [1, 0.9, 0.6], sp: 1.2, up: 1.2 }); GG.Audio && GG.Audio.sfx('whoosh'); draw(); }); }
  const draw = () => { const st = wardState(Gm().S()), cur = st.sel || 'josephVizier', I = Gm().ITEMS;
    el.innerHTML = `<div class="panel"><div class="p-head"><h3>옷장 · 총리의 옷</h3><button class="p-x" id="wardX">닫기</button></div><div class="p-body"><p class="muted" style="margin:0 0 8px">옷을 지어 두면 언제든 갈아입을 수 있어요.</p><div class="ward">${Object.keys(WARD).map(k => { const it = WARD[k], own = st.own[k], need = Object.keys(it.need || {}).map(i => `${I[i].n} ${it.need[i]}`).concat(it.silver ? [`은 ${it.silver}`] : []).join(' · ');
      return `<button class="wcard${cur === k ? ' on' : ''}" data-w="${k}"><b>${it.n}</b><span>${it.d}</span><em>${cur === k ? '입는 중' : own ? '입기' : '짓기 · ' + need}</em></button>`; }).join('')}</div></div></div>`; };
  draw(); el.hidden = false; UI.setBusy('ward', true); }


// where everyone stands, step by step (also restores the scene after loading a save)
const DOTHAN = { x: 158, z: -150 };
const broRing = (i, r) => { const a = i / BRO.length * Math.PI * 2 + 0.3; return [DOTHAN.x + Math.cos(a) * (r || 3.4), DOTHAN.z + Math.sin(a) * (r || 3.4), Math.atan2(-Math.cos(a), -Math.sin(a))]; };
function stage(S, G) {
  if (!G || !G.npc) return; GG.UI.hint(null); G.P.sleeping = false; G.P.sit = false; G.P.kneel = false;
  const want = outfitFor(S); if (S.outfit !== want) G.setOutfit(want);
  if (between(S, 'p_dothan', 'c1_pit') && !S.q.broShow) BRO.forEach((id, i) => { const [x, z, f] = broRing(i); place(id, x, z, f, { sit: i % 4 !== 0, act: S.step === 'c1_pit' && i % 3 === 1 ? 'eat' : null }); });
  if (S.step === 'c1_market') { place('potiphar', -3.6, 121, -2.6); }
  else if (between(S, 'c2_arrive', 'c2_flee')) {
    if (S.step === 'c2_store') { place('potiphar', -13.4, 60.6, -1.4); place('scribe', -14.2, 62.4, -1.6); }
    else { place('potiphar', -28, 39.4, 0, { sit: true }); place('scribe', -23.6, 41.2, 0, { sit: true }); }
    if (S.step === 'c2_tempt3' || S.step === 'c2_flee') place('wife', -30.5, 39.6, 0.5); else place('wife', -20.6, 61.6, Math.PI);
  }
  if (between(S, 'c3_officers', 'c3_dreams')) { place('cupbearer', CELL[3][0] - 1.1, CELL[3][1] - 0.2, 0); place('baker', CELL[3][0] + 1.1, CELL[3][1] - 0.4, 0); }
  if (between(S, 'c5_patrol')) { place('pharaoh', -30, -177.2, 0, { sit: true }); }
  if (S.step === 'c6_sell' || S.step === 'j_end') { const n = G.npc('overseerW'); if (n) n.forceVis = false; }
  ['pg1', 'pg2'].forEach(id => G.npcShow(id, undefined)); if (between(S, 'c3_cell', 'c4_shave')) { place('pg1', -32.6, 16, 0); place('pg2', -27.4, 16, 0); }
}
// every step's enter re-stages the world
for (const k in steps) { const st = steps[k], en = st.enter; st.enter = function (S, G, re) { stage(S, G); if (en) en.call(this, S, G, re); }; }
const talk = {};

// ------------------------------------------------------------------ PROLOGUE · the errand (tutorial)
function cinNight(S, G) {
  const bx = SPOTS.restBed[0], bz = SPOTS.restBed[1], h = hAt(bx, bz);
  // v15: the big oak stands north-east of the straw bed (190, 29), so every shot stays on the open south-west side and the upward
  // looks point away from its crown. The scene ends on Joseph asleep, then cuts (no flying camera) to the stars above him.
  const ox = 190 - bx, oz = 29 - bz, ol = Math.hypot(ox, oz), ux = -ox / ol, uz = -oz / ol; // unit vector pointing away from the oak
  const sky = (k, up) => [bx + ux * k, h + up, bz + uz * k];
  fade(() => { G.teleport(bx, bz, 2.6); G.P.sleeping = true; if (G.hour() < 22) S.time = Math.floor(S.time / 24) * 24 + 22.2; GG.UI.hint(null); }, () => cine([
    { cam: [bx + ux * 3.2 + uz * 1.4, h + 1.35, bz + uz * 3.2 - ux * 1.4], cam2: [bx + ux * 2.6 + uz * 1.1, h + 1.1, bz + uz * 2.6 - ux * 1.1], look: [bx, h + 0.3, bz], dur: 5, fov: 0.85, t: '모닥불이 사위어 갈 무렵, 요셉은 짚자리에 누워 하늘을 올려다보았습니다.', music: 'j_night' },
    { cam: [bx + ux * 0.3, h + 0.55, bz + uz * 0.3], look: sky(16, 26), look2: sky(18, 26), dur: 7, fov: 1.05, n: '요셉', t: '해와 달과 열한 별이 내게 절을 했지… 형들은 그 꿈 이야기에 더 화를 냈고.', ref: '창세기 37:9–11', e: 'tender' },
    { cam: [bx + ux * 1.7 - uz * 0.9, h + 1.05, bz + uz * 1.7 + ux * 0.9], look: [bx, h + 0.4, bz], dur: 6, fov: 0.7, n: '요셉', t: '아버지는 그 말을 마음에 두셨는데… 형들은 왜 나를 미워할까. 이번엔 형들이 반가워해 주면 좋겠다.', ref: '창세기 37:4, 11', e: 'sad' },
    { cam: [bx + ux * 3.4 + uz * 0.6, h + 2.3, bz + uz * 3.4 - ux * 0.6], cam2: [bx + ux * 3.1 + uz * 0.5, h + 2.15, bz + uz * 3.1 - ux * 0.5], look: [bx, h + 0.25, bz], dur: 4.5, fov: 0.8, t: '모닥불이 꺼지고, 소년은 스르르 잠이 들었습니다.' },
    { cam: [bx + ux * 1.2, h + 0.5, bz + uz * 1.2], look: sky(14, 30), look2: sky(14.5, 30.5), dur: 6, fov: 1.15, fadeIn: 0.6, t: '그날 밤, 별들은 말없이 소년을 내려다보았습니다.', fadeOut: 1.8 },
  ], () => { G.P.sleeping = false; GG.Game.musicOverride = null; G.newDay('세겜 들판으로'); G.teleport(bx - 1.5, bz - 1.5, Math.PI); G.go('p_shechem'); }));
}
const CLUE_T = [
  [J('모닥불 자리… 재가 식었어. 형들이 떠난 지 며칠은 된 것 같아.', '', 'calm'), T('곁에는 빈 자루와 깨진 물동이가 굴러다녔습니다.')],
  [J('양 떼 발자국이야. 많기도 해라… 북쪽으로 이어져 있어.', '', 'calm')],
  [J('르우벤 형이 쌓는 방식의 돌무더기다. 길이 여기서 갈라지네… 어느 쪽일까?', '', 'calm'), T('요셉은 한참을 두리번거렸습니다. 넓은 들판에서, 혼자였습니다.', '창세기 37:15')]];
function clue(S, G, k, i) {
  (S.q.cl = S.q.cl || {})[k] = 1; S.q.clues = Object.keys(S.q.cl).length; pick(); G.FX.burst(SPOTS[k][0], hAt(SPOTS[k][0], SPOTS[k][1]) + 0.5, SPOTS[k][1], 12, { c: [1, 0.9, 0.55], sp: 1, up: 1.5 });
  say(CLUE_T[i], () => { G.UI.quest(); G.checkStep(); });
}
// p_dothan: from the brothers' side of the valley (창 37:18–22)
function cinPlot(S, G, next) {
  const P = G.P, px = P.x, pz = P.z, ph = hAt(px, pz), fx = DOTHAN.x, fz = DOTHAN.z, fh = hAt(fx, fz);
  stage(S, G); GG.UI.hint(null);
  cine([
    { cam: [fx - 1.2, fh + 1.9, fz - 6.4], cam2: [fx - 0.8, fh + 1.8, fz - 5.8], look: [px, ph + 1.2, pz], dur: 5, fov: 0.55, t: '도단 들판. 형들이 저 멀리 언덕길을 내려오는 한 사람을 보았습니다. 햇빛에 무지갯빛 옷자락이 반짝였습니다.', music: 'j_dread' },
    { cam: [fx + 2.4, fh + 1.3, fz - 1.4], look: [fx - 1, fh + 1.0, fz + 1.5], dur: 5, n: '시므온', t: '저기 꿈꾸는 자가 오는도다.', ref: '창세기 37:19', e: 'cold', fn: () => { emote('simeon', 'point', 3); } },
    { cam: [fx - 2.2, fh + 1.2, fz + 2.6], look: [fx + 1, fh + 1.0, fz - 1], dur: 7, n: '레위', t: '자, 그를 죽여 한 구덩이에 던지고, 악한 짐승이 그를 잡아먹었다 하자. 그의 꿈이 어떻게 되는지 우리가 볼 것이니라.', ref: '창세기 37:20', e: 'cold' },
    { cam: [fx + 3.2, fh + 1.4, fz + 2.4], cam2: [fx + 2.6, fh + 1.3, fz + 1.8], look: [fx + 1.6, fh + 1.2, fz + 2.6], dur: 6, n: '르우벤', t: '우리가 그의 생명은 해치지 말자. 피를 흘리지 말라. 그를 광야 그 구덩이에 던지고 손을 그에게 대지 말라.', ref: '창세기 37:21–22', e: 'urgent', fn: () => emote('reuben', 'think', 6) },
    { cam: [PIT.x + 6, PIT.rim + 2.4, PIT.z + 6], cam2: [PIT.x + 4, PIT.rim + 3, PIT.z + 4], look: [PIT.x, PIT.floor + 1, PIT.z], dur: 6, t: '이는 르우벤이 요셉을 그들의 손에서 구출하여 그의 아버지에게로 돌려보내려 함이었더라.', ref: '창세기 37:22' },
  ], next);
}
// p_approach → the pit (창 37:23–24)
function cinPit(S, G, next) {
  const P = G.P, px = P.x, pz = P.z, ph = hAt(px, pz), fx = DOTHAN.x, fz = DOTHAN.z, fh = hAt(fx, fz);
  const fr = Math.atan2(fx - px, fz - pz); P.face = fr;
  const rim = (a, r) => [PIT.x + Math.cos(a) * (r || PIT.wall + 0.85), PIT.z + Math.sin(a) * (r || PIT.wall + 0.85)]; // v16.9 at the very edge, looking down (they stood back out of sight)
  cine([
    { fn: () => { cpose(null); }, shot: { type: 'MS', a: 'hero', b: 'simeon' }, dur: 4.5, n: '요셉', t: '형들! 드디어 찾았다! 아버지께서 형들이 잘 있는지 보고 오라고 하셨어요!', e: 'happy' },
    { fn: () => { ['simeon', 'levi', 'judah', 'dan', 'gad'].forEach((id, i) => walkTo(id, px + Math.sin(fr + 2.2 + i * 0.45) * 1.7, pz + Math.cos(fr + 2.2 + i * 0.45) * 1.7, 2.2, n => face(id, px, pz))); },
      shot: { type: 'OTS', a: 'simeon', b: 'hero' }, dur: 5, n: '시므온', t: '꿈꾸는 자야. 아버지 심부름까지 와서 우리를 감시하느냐.', e: 'cold' },
    { shot: { type: 'CU', a: 'hero', b: 'simeon', lens: 'tele', move: 'pushIn' }, dur: 4.5, n: '요셉', t: '형들… 왜 그런 눈으로 보세요…?', e: 'fear', fn: () => cpose('think', 4) },
    { fn: () => { emote('simeon', 'grab', 2); emote('levi', 'grab', 2); G.sfx('rip'); G.setOutfit('josephPlain'); cpose('fallen', 0, true); }, cam: [px + 2.4, ph + 1.2, pz + 1.8], look: [px, ph + 0.8, pz], dur: 5, shake: 0.6, shakeDecay: 1.4,
      t: '요셉이 형들에게 이르매, 그들이 요셉의 옷 곧 그가 입은 채색옷을 벗기고', ref: '창세기 37:23' },
    { shot: { type: 'LOW', a: 'levi', b: 'hero' }, dur: 4.5, n: '레위', t: '이 옷이 그리도 자랑스러웠느냐! 아버지가 너만 사랑하신다고!', e: 'angry', fn: () => emote('levi', 'swing', 1.2) },
    // dragged to the edge: the two brothers walk Joseph to the rim between them, then it goes dark as he falls
    { fn: () => { const ax = px - PIT.x, az = pz - PIT.z, al = Math.hypot(ax, az) || 1, ux = ax / al, uz = az / al, sx = -uz, sz = ux;
        RT.drag = { x0: PIT.x + ux * (PIT.r + 7.5), z0: PIT.z + uz * (PIT.r + 7.5), x1: PIT.x + ux * (PIT.r + 1.1), z1: PIT.z + uz * (PIT.r + 1.1), sx, sz, f: Math.atan2(-ux, -uz) };
        const D = RT.drag; G.teleport(D.x0, D.z0, D.f); cpose('bound', 0, true);
        place('simeon', D.x0 + sx * 0.75, D.z0 + sz * 0.75, D.f); place('levi', D.x0 - sx * 0.75, D.z0 - sz * 0.75, D.f);
        walkTo('simeon', D.x1 + sx * 0.75 + ux * 0.3, D.z1 + sz * 0.75 + uz * 0.3, 1.75); walkTo('levi', D.x1 - sx * 0.75 + ux * 0.3, D.z1 - sz * 0.75 + uz * 0.3, 1.75);
        ['judah', 'dan', 'gad'].forEach((id, i) => { const a = Math.atan2(uz, ux) + 0.9 + i * 0.5; place(id, PIT.x + Math.cos(a) * (PIT.r + 2.4), PIT.z + Math.sin(a) * (PIT.r + 2.4), Math.atan2(-Math.cos(a), -Math.sin(a))); }); },
      cam: () => { const D = RT.drag; return [D.x1 + D.sx * 6.5 + (D.x0 - D.x1) * 0.25, hAt(D.x1, D.z1) + 2.2, D.z1 + D.sz * 6.5 + (D.z0 - D.z1) * 0.25]; },
      look: () => { const P = G.P; return [P.x, P.y + 1.1, P.z]; }, dur: 4.6, t: '형들은 요셉의 두 팔을 잡아 끌고 들판의 빈 구덩이로 갔습니다.', ref: '창세기 37:24',
      each: t => { const D = RT.drag, P = G.P, k = Math.min(1, t / 4); P.x = D.x0 + (D.x1 - D.x0) * k; P.z = D.z0 + (D.z1 - D.z0) * k; P.y = hAt(P.x, P.z); P.face = D.f; P.spd = k < 1 ? 1.6 : 0; } },
    { black: true, cam: [px, ph + 2, pz + 3], look: [px, ph, pz], dur: 2.4, t: '그를 잡아 구덩이에 던지니', ref: '창세기 37:24', sfx: 'thud',
      fn: () => { S.q.inPit = 1; G.teleport(PIT.x + 0.4, PIT.z + 0.3, 0.6); P.y = PIT.floor; cpose('fallen', 0, true);
        [['simeon', 0.6], ['levi', 1.4], ['judah', 2.4], ['reuben', 3.6], ['dan', 4.6]].forEach(([id, a]) => { const [x, z] = rim(a); place(id, x, z, Math.atan2(PIT.x - x, PIT.z - z)); }); } },
    { cam: [PIT.x - 0.6, PIT.floor + 0.7, PIT.z - 0.8], look: [PIT.x + 0.8, PIT.rim + 1.6, PIT.z + 1.6], dur: 6, fov: 1.05, shake: 0.4, shakeDecay: 1, t: '그 구덩이는 빈 것이라. 그 속에 물이 없었더라.', ref: '창세기 37:24', music: 'j_pit' },
    { shot: { type: 'LOW', a: 'simeon', b: 'hero', lens: 'wide' }, dur: 5, n: '시므온', t: '네 꿈이 어떻게 되는지 보자! 해와 달과 별들이 너를 꺼내 주겠지!', e: 'cold', fn: () => emote('levi', 'laugh', 4) },
    { cam: [rim(3.6, 6)[0], PIT.rim + 1.7, rim(3.6, 6)[1]], look: [rim(3.6)[0], PIT.rim + 1.4, rim(3.6)[1]], dur: 6, t: '르우벤은 아무 말도 하지 못했습니다. 그는 밤이 되면 몰래 돌아와 동생을 건져 내리라 마음먹었습니다.', ref: '창세기 37:22, 29' },
    { fn: () => { cpose(null); BRO.forEach((id, i) => { const [x, z, f] = broRing(i); walkTo(id, x, z, 1.8, n => { n.face = n.homeFace = f; n.sit = i % 4 !== 0; if (i % 3 === 1) n.act = 'eat'; }); }); },
      cam: [PIT.x, PIT.rim + 1.5, PIT.z + 1], cam2: [PIT.x, PIT.rim + 6, PIT.z + 1.5], look: [PIT.x + 0.4, PIT.floor + 0.6, PIT.z + 0.3], dur: 7, title: '1장 · 구덩이', sub: '창세기 37:23–36' },
  ], () => { stage(S, G); next(); }, { noSkip: false });
}
// c1_pit: jumping, calling, praying
function pitShout(S, G) {
  cpose('reach', 2.4);
  say([J('르우벤 형! 유다 형! 여기서 꺼내 주세요! 형들!', '', 'cry'), T('위에서 형들이 음식을 먹으며 웃는 소리가 들렸습니다. 아무도 대답하지 않았습니다.', '창세기 37:25'),
    J('…제발요. 잘못했어요. 꿈 이야기 다시는 안 할게요…', '', 'cry'),
    T('훗날 형들은 이 날을 이렇게 기억했습니다. "그가 우리에게 애걸할 때에 그 마음의 괴로움을 보고도 듣지 아니하였으므로…"', '창세기 42:21')], () => tick(S, 'shout'));
}
function pitPray(S, G) {
  cpose('kneelPray', 0, true);
  cine([{ cam: [PIT.x + 1.6, PIT.floor + 1.0, PIT.z + 1.2], look: [PIT.x + 0.6, PIT.floor + 0.8, PIT.z - 0.6], dur: 6, n: '요셉', t: '하나님… 아브라함과 이삭과, 우리 아버지 야곱의 하나님.', e: 'pray' },
    { cam: [PIT.x - 0.5, PIT.floor + 0.6, PIT.z - 1.4], look: [PIT.x + 0.6, PIT.floor + 1.1, PIT.z - 0.6], dur: 7, n: '요셉', t: '아버지에게 돌아가겠다고… 베냐민에게 금방 간다고 약속했어요. 저를 여기서 꺼내 주세요.', e: 'cry' },
    { cam: [PIT.x + 0.6, PIT.floor + 0.5, PIT.z - 0.4], look: [PIT.x + 0.6, PIT.rim + 30, PIT.z - 0.6], dur: 7, t: '동그랗게 뚫린 하늘로 구름이 천천히 흘러갔습니다. 요셉의 기도를 듣는 이는 아무도 없는 것 같았습니다. 그러나 하나님은 듣고 계셨습니다.' }],
  () => { cpose(null); tick(S, 'pitPray'); });
}
// c1_pit done → sold for twenty pieces of silver (창 37:25–28), Reuben, Jacob's grief (37:29–35)
function cinSold(S, G, next) {
  const fx = DOTHAN.x, fz = DOTHAN.z, fh = hAt(fx, fz), heb = SPOTS.jacobTent, hh = hAt(heb[0], heb[1] + 4);
  const top = [PIT.x + 4.6, PIT.z + 1.2];
  const CAR = ['ishmael', 'camel1', 'camel2', 'camel3', 'midian', 'ishBoy'];
  cine([
    { fn: () => { S.q.caravanOn = 1; CAR.forEach((id, i) => { place(id, 214 + i * 3.4, -155.5 + (i % 2) * 0.6, -1.55); walkTo(id, 184 + i * 3.4, -152 + (i % 2) * 0.6, id.startsWith('camel') ? 2.2 : 2.3); }); },
      cam: [fx - 2, fh + 1.8, fz - 2.6], cam2: [fx - 1, fh + 2.2, fz - 2], look: [fx, fh + 1, fz], look2: [200, hAt(200, -154) + 2, -154], dur: 8, music: 'j_dread',
      t: '그들이 앉아 음식을 먹다가 눈을 들어 본즉, 한 무리의 이스마엘 사람들이 길르앗에서 오는데, 그 낙타들에 향품과 유향과 몰약을 싣고 애굽으로 내려가는지라.', ref: '창세기 37:25' },
    { fn: () => { const n = G.npc('judah'); if (n) { n.sit = false; n.act = null; } }, cam: [fx + 1.6, fh + 1.5, fz + 3.6], look: [fx + 0.4, fh + 1.3, fz + 1.4], dur: 6, n: '유다', t: '우리가 우리 동생을 죽이고 그의 피를 덮어둔들 무엇이 유익할까.', ref: '창세기 37:26', e: 'solemn' },
    { cam: [fx - 1.4, fh + 1.6, fz + 4.4], look: [fx + 0.6, fh + 1.3, fz + 1.6], dur: 7, n: '유다', t: '자, 그를 이스마엘 사람들에게 팔고 그에게 우리 손을 대지 말자. 그는 우리의 동생이요 우리의 혈육이니라.', ref: '창세기 37:27' },
    { fn: () => { ['judah', 'simeon', 'levi'].forEach((id, i) => walkTo(id, top[0] - 1 + i * 1.3, top[1] + 1.8 - i * 0.6, 2.4)); CAR.forEach((id, i) => walkTo(id, PIT.x + 9 + i * 3, PIT.z - 4.5 - (i % 2), 2.2)); },
      cam: [PIT.x - 0.3, PIT.floor + 0.8, PIT.z - 0.6], look: [PIT.x + 1, PIT.rim + 1.4, PIT.z + 1.6], dur: 5, t: '그 형제들이 청종하였더라.', ref: '창세기 37:27', sfx: 'rope' },
    { fn: () => { S.q.inPit = 0; S.q.bound = 1; G.teleport(top[0], top[1], -1.2); cpose('bound', 0, true); },
      cam: [top[0] - 3.4, hAt(top[0], top[1]) + 1.6, top[1] + 1.6], look: [top[0], hAt(top[0], top[1]) + 1.1, top[1]], dur: 6, shake: 0.25, shakeDecay: 1,
      t: '그 때에 미디안 사람 상인들이 지나가고, 형제들이 요셉을 구덩이에서 끌어올렸습니다.', ref: '창세기 37:28', sfx: 'rope' },
    { fn: () => { place('midian', top[0] + 2.4, top[1] - 1.6, -0.8); place('judah', top[0] + 1.2, top[1] + 0.2, 2.2); },
      cam: [top[0] + 4.4, hAt(top[0], top[1]) + 1.5, top[1] + 0.6], look: [top[0] + 1.8, hAt(top[0], top[1]) + 1.3, top[1] - 0.6], dur: 4, n: '미디안 상인', t: '열다섯.', e: 'cold' },
    { cam: [top[0] + 0.2, hAt(top[0], top[1]) + 1.5, top[1] + 2.4], look: [top[0] + 1.4, hAt(top[0], top[1]) + 1.4, top[1]], dur: 4, n: '유다', t: '스물. 젊고 튼튼하오.', e: 'cold' },
    { cam: [top[0] + 3.4, hAt(top[0], top[1]) + 1.3, top[1] - 0.2], look: [top[0] + 1.8, hAt(top[0], top[1]) + 1.0, top[1] - 0.8], dur: 5.5, sfx: 'coins', n: '미디안 상인', t: '…좋소. 은 스물.', e: 'cold', fn: () => emote('midian', 'pick', 2) },
    { cam: [top[0] - 1.8, hAt(top[0], top[1]) + 1.4, top[1] - 1.2], look: [top[0], hAt(top[0], top[1]) + 1.4, top[1]], dur: 7, fov: 0.62, n: '요셉', t: '유다 형! 시므온 형! 제발요… 아버지가 기다리세요! 베냐민한테 금방 간다고 약속했단 말이에요!', e: 'cry', fn: () => cpose('beg', 0, true) },
    { cam: [top[0] + 1.2, hAt(top[0], top[1]) + 1.6, top[1] + 3.2], look: [top[0] + 1.2, hAt(top[0], top[1]) + 1.2, top[1] + 0.2], dur: 6, t: '형들은 고개를 돌렸습니다. 은 이십 세겔에, 요셉은 이스마엘 사람들에게 팔렸습니다.', ref: '창세기 37:28' },
    { fn: () => { cpose('bound', 0, true); const L = [[150, -138], [146, -134], [142, -131], [138, -128], [134, -126], [130, -124]]; CAR.forEach((id, i) => { place(id, PIT.x + 6 - i * 3, PIT.z - 7.5 - i * 0.4, -2.2); walkTo(id, L[i][0], L[i][1], 2.1); }); G.teleport(PIT.x - 14, PIT.z - 5.8, -2.2); walkTo('ishBoy', PIT.x - 15, PIT.z - 7.5, 2); },
      cam: [PIT.x + 14, PIT.rim + 9, PIT.z + 14], cam2: [PIT.x + 6, PIT.rim + 14, PIT.z + 10], look: [PIT.x - 10, PIT.rim, PIT.z - 6], look2: [PIT.x - 22, PIT.rim, PIT.z - 2], dur: 8, t: '상인들은 요셉을 데리고 애굽으로 갔습니다.', ref: '창세기 37:28', music: 'j_mourn',
      each: t => { const P = G.P; P.x = PIT.x - 14 - t * 1.6; P.z = PIT.z - 5.8 + t * 0.9; P.y = hAt(P.x, P.z); P.spd = 1.6; } },
    { hour: 18.4, fn: () => { S.q.caravanOn = 0; const [x, z] = [PIT.x + 6.4, PIT.z - 1.4]; place('reuben', x, z, Math.atan2(PIT.x - x, PIT.z - z), { act: 'tearClothes' }); G.teleport(DOTHAN.x - 30, DOTHAN.z + 20, 0); },
      cam: [PIT.x - 2, PIT.floor + 1, PIT.z - 2], look: [PIT.x + 6.4, PIT.rim + 1.4, PIT.z - 1.4], dur: 6, t: '르우벤이 돌아와 구덩이에 이르러 본즉 거기 요셉이 없는지라. 옷을 찢고', ref: '창세기 37:29' },
    { cam: [PIT.x + 9.4, PIT.rim + 1.7, PIT.z - 3.2], look: [PIT.x + 6.4, PIT.rim + 1.3, PIT.z - 1.4], dur: 6, n: '르우벤', t: '아이가 없도다! 나는 어디로 갈까!', ref: '창세기 37:30', e: 'cry' },
    { hour: 21, fn: () => { const n = G.npc('reuben'); if (n) n.act = null; stage(S, G); }, cam: [fx + 6, fh + 3, fz + 6], cam2: [fx + 4, fh + 2.2, fz + 4], look: [fx, fh + 0.8, fz], dur: 6, t: '그들이 요셉의 옷을 가져다가 숫염소를 죽여 그 옷을 피에 적시고, 그의 채색옷을 보내어 아버지에게로 가지고 가서', ref: '창세기 37:31–32' },
    { hour: 10, fn: () => { S.q.heb = 1; S.q.broShow = 1; ['judah', 'reuben', 'simeon', 'levi', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun'].forEach((id, i) => place(id, heb[0] - 3 + (i % 5) * 1.5, heb[1] + 5 + Math.floor(i / 5) * 1.6, Math.PI));
        place('jacob', heb[0], heb[1] + 2.6, 0); place('benjamin', heb[0] + 2.4, heb[1] + 2.2, -0.6); },
      cam: [heb[0] + 4, hh + 1.7, heb[1] + 9], cam2: [heb[0] + 2.4, hh + 1.6, heb[1] + 7.2], look: [heb[0], hh + 1.2, heb[1] + 3], dur: 7, n: '유다', t: '아버지… 우리가 이것을 발견하였으니, 아버지의 아들의 옷인가 보소서.', ref: '창세기 37:32', e: 'solemn' },
    { cam: [heb[0] - 1.2, hh + 1.6, heb[1] + 4.8], look: [heb[0], hh + 1.5, heb[1] + 2.6], dur: 7, fov: 0.62, n: '야곱', t: '내 아들의 옷이라. 악한 짐승이 그를 잡아먹었도다. 요셉이 분명히 찢겼도다!', ref: '창세기 37:33', e: 'cry', fn: () => { const n = G.npc('jacob'); if (n) n.act = 'tearClothes'; } },
    { fn: () => { const n = npcSet('jacob', { look: LOOK.jacobMourn }); if (n) n.act = 'mourn'; }, cam: [heb[0] + 3, hh + 1.2, heb[1] + 4], look: [heb[0], hh + 0.9, heb[1] + 2.6], dur: 7,
      t: '야곱이 자기 옷을 찢고 굵은 베로 허리를 묶고 오랫동안 그의 아들을 위하여 애통하니', ref: '창세기 37:34' },
    { cam: [heb[0] + 3.6, hh + 0.9, heb[1] + 1.4], look: [heb[0] + 2.4, hh + 0.8, heb[1] + 2.2], dur: 6, n: '베냐민', t: '아버지… 요셉 형은요? 형이 금방 온다고… 약속했는데…', e: 'cry', fn: () => { const n = G.npc('benjamin'); if (n) n.act = 'weep'; } },
    { cam: [heb[0] - 2.4, hh + 1.3, heb[1] + 4.6], look: [heb[0], hh + 0.9, heb[1] + 2.6], dur: 8, n: '야곱', t: '내가 슬퍼하며 스올로 내려가 아들에게로 가리라.', ref: '창세기 37:35', e: 'cry' },
    { cam: [heb[0] + 10, hh + 7, heb[1] + 14], cam2: [heb[0] + 14, hh + 12, heb[1] + 20], look: [heb[0], hh + 1, heb[1] + 2], dur: 8, t: '그의 모든 자녀가 위로하되 그가 그 위로를 받지 아니하였으며, 그의 아버지가 그를 위하여 울었더라.', ref: '창세기 37:35', fadeOut: 1.5 },
    { hour: 17.6, fn: () => { S.q.heb = 0; S.q.broShow = 0; const n = npcSet('jacob', { look: LOOK.jacob }); if (n) n.act = null; const b = G.npc('benjamin'); if (b) b.act = null; caravanStart(S, G, false); },
      fadeIn: 1.4, cam: () => { const P = G.P; return [P.x + 5, P.y + 2.2, P.z + 4]; }, look: () => { const P = G.P; return [P.x, P.y + 1.2, P.z]; }, dur: 7, music: 'j_caravan',
      t: '그 시각, 요셉은 아버지가 자기를 위해 울고 있는 줄도 모른 채, 낯선 이들의 낙타 뒤를 따라 걷고 있었습니다.' },
  ], () => { next(); });
}

// ------------------------------------------------------------------ c1_caravan · bound behind the camels
const CAR_IDS = ['ishmael', 'midian', 'camel1', 'camel2', 'camel3', 'ishBoy']; const CAR_GAP = { ishmael: 0, midian: 5, camel1: 10, camel2: 15, camel3: 20, ishBoy: 35 }; const CAR_ME = 27;
const LEG1 = [[150, -138], [130, -124], [112, -104], [96, -84], [80, -60], [64, -34], [60, -28]];
const LEG2 = [[34, 62], [30, 76], [20, 92], [10, 108], [-2, 115], [-6, 118]];
function caravanStart(S, G, resume) {
  S.q.caravanOn = 1; S.q.bound = 1; const leg = S.q.night ? LEG2 : LEG1;
  let i0 = 0; if (resume && RT.car && RT.car.leg === leg) i0 = RT.car.i; else if (resume) { let bd = 1e9; leg.forEach((p, i) => { const d = Math.hypot(p[0] - G.P.x, p[1] - G.P.z); if (d < bd) { bd = d; i0 = i; } }); }
  const p0 = leg[i0], p1 = leg[Math.min(leg.length - 1, i0 + 1)], a = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
  RT.car = { leg, i: i0 + 1, done: false, wait: 0 }; RT.crumbs = [];
  for (let k = 0; k < 40; k++) RT.crumbs.push({ x: p0[0] - Math.sin(a) * k * 0.6, z: p0[1] - Math.cos(a) * k * 0.6 });
  CAR_IDS.forEach(id => { const c = RT.crumbs[Math.min(RT.crumbs.length - 1, CAR_GAP[id])]; place(id, c.x, c.z, a); });
  const tail = RT.crumbs[CAR_ME];
  if (!resume || Math.hypot(G.P.x - tail.x, G.P.z - tail.z) > 9) G.teleport(tail.x, tail.z, a);
  cpose('bound', 0, true);
}
// the guide points at Joseph's own place on the rope (behind the last camel), not at the leader: walking up to the leader
// used to leave the boy ahead of the camels, the leader waiting for him behind and the rope holding him in front — a dead end
function carSlot() { const c = RT.crumbs[Math.min(RT.crumbs.length - 1, CAR_ME)]; return c ? { x: c.x, z: c.z } : null; }
function caravanTarget(S) { return carSlot() || (n => n ? { x: n.x, z: n.z } : null)(Gm().npc('ishmael')); }
function caravanUpdate(dt, S, G) {
  const C = RT.car; if (!C || S.step !== 'c1_caravan') return;
  const lead = G.npc('ishmael'); if (!lead) return; const P = G.P;
  const tailN = G.npc('camel3'), dTail = tailN ? Math.hypot(P.x - tailN.x, P.z - tailN.z) : 0;
  const busy = GG.UI.busy() || GG.Cine.on;
  // the leader walks the road and waits for the boy on the rope
  if (!C.done) {
    // wait only for a boy who lags behind his place on the rope (one who has walked ahead is no reason to stop)
    const wp = C.leg[C.i], slot = carSlot(), dSlot = slot ? Math.hypot(P.x - slot.x, P.z - slot.z) : dTail;
    const behind = !slot || Math.hypot(P.x - lead.x, P.z - lead.z) > Math.hypot(slot.x - lead.x, slot.z - lead.z);
    const wait = busy || (dTail > 6.2 && dSlot > 4 && behind);
    if (wait) { lead.walk = null; }
    else if (!lead.walk) { G.npcWalk('ishmael', wp[0], wp[1], () => { C.i++; if (C.i >= C.leg.length) C.done = true; }, 2.45); if (lead.walk) lead.walk.solid = false; }
  }
  // breadcrumb train
  const last = RT.crumbs[0]; if (!last || Math.hypot(lead.x - last.x, lead.z - last.z) > 0.6) { RT.crumbs.unshift({ x: lead.x, z: lead.z }); if (RT.crumbs.length > 60) RT.crumbs.pop(); }
  CAR_IDS.forEach((id, k) => { if (!k) return; const n = G.npc(id); if (!n) return; const c = RT.crumbs[Math.min(RT.crumbs.length - 1, CAR_GAP[id])]; const d = Math.hypot(c.x - n.x, c.z - n.z);
    if (d > 0.35) { G.npcWalk(id, c.x, c.z, null, clamp(d * 1.6, 0.6, 4.2)); if (n.walk) n.walk.solid = false; } });
  // talk along the road
  RT.carT = (RT.carT || 0) - dt; if (RT.carT <= 0 && !busy) { RT.carT = 16 + Math.random() * 10; const L = S.q.night ? ['저기 초록 땅이 보이지? 애굽이다.', '나일 강 물은 꿀처럼 달단다.', '장터에 서면 고개를 들어라. 그래야 값을 잘 받지.'] : ['걸어라, 히브리 아이. 해 지기 전에 우물까지 가야 한다.', '향품 자루를 떨어뜨리지 마라!', '물은 아껴 마셔라. 광야는 길다.'];
    bubble(Math.random() < 0.6 ? 'ishmael' : 'midian', L[Math.floor(Math.random() * L.length)], 3.6); }
  if (!S.q.night && !RT.lookBack && P.z > -110 && P.x < 120) { RT.lookBack = 1; setTimeout(() => { if (S.step === 'c1_caravan' && !GG.UI.busy()) say([J('(뒤를 돌아본다) …저 산 너머가 헤브론인데. 아버지…', '', 'sad'), N('ishBoy', '…', ''), T('대상의 아이가 말없이 요셉을 바라보았습니다.')]); }, 400); }
  // arrivals
  if (C.done && !S.q.night && Math.hypot(P.x - SPOTS.caravanNight[0], P.z - SPOTS.caravanNight[1]) < 26 && !busy) { C.done = false; cinCaravanNight(S, G); }
  if (S.q.night && !S.q.reveal && Math.hypot(P.x - SPOTS.egyptGate[0], P.z - SPOTS.egyptGate[1]) < 13 && !busy) cinReveal(S, G);
}
// v16.1: the road to Egypt is a cutscene now (walking two long legs behind the camels was the slowest part of the game):
// leaving Dothan on the rope → the long road south, looking back toward Hebron → the night by the fire (as before) → crossing
// the desert → Egypt revealed → the slave market.
function stageCar(x, z, a, bound) { CAR_IDS.forEach(id => { const g = CAR_GAP[id] * 0.6; place(id, x - Math.sin(a) * g, z - Math.cos(a) * g, a); });
  const g = CAR_ME * 0.6; Gm().teleport(x - Math.sin(a) * g, z - Math.cos(a) * g, a); if (bound) cpose('bound', 0, true); }
function cinJourney(S, G) {
  if (S.q.reveal || GG.Cine.on) return; RT.car = null; S.q.caravanOn = 1; S.q.bound = 1; GG.UI.hint(null); GG.Cine.hold = true; // one long cutscene to the market
  const a1 = Math.atan2(LEG1[1][0] - LEG1[0][0], LEG1[1][1] - LEG1[0][1]), m = LEG1[3], a2 = Math.atan2(LEG1[4][0] - m[0], LEG1[4][1] - m[1]);
  const p0 = LEG1[0], h0 = hAt(p0[0], p0[1]), hm = hAt(m[0], m[1]);
  const jx = () => Gm().P.x, jz = () => Gm().P.z;
  if (S.q.night) { afterNight(S, G); return; }
  cine([
    { fn: () => stageCar(p0[0], p0[1], a1, true), cam: [p0[0] + 9, h0 + 5, p0[1] - 8], cam2: [p0[0] + 6, h0 + 3.6, p0[1] - 5], look: [p0[0] - 4, h0 + 1, p0[1] + 4], dur: 6, music: 'j_caravan',
      t: '요셉은 줄에 묶인 채, 이스마엘 대상을 따라 남쪽으로 끌려갔습니다.', ref: '창세기 37:28' },
    { cam: () => [jx() + 1.8, hAt(jx(), jz()) + 1.4, jz() + 2.2], look: () => [jx(), hAt(jx(), jz()) + 1.3, jz()], dur: 4.5, fov: 0.62, n: '이스마엘 상인', t: '걸어라, 히브리 아이. 해 지기 전에 우물에 닿아야 한다.' },
    { fn: () => stageCar(m[0], m[1], a2, true), cam: [m[0] - 30, hm + 14, m[1] - 10], cam2: [m[0] - 22, hm + 10, m[1] - 4], look: [m[0], hm + 1, m[1]], dur: 6, t: '헤브론의 푸른 언덕은 멀어지고, 끝없는 광야가 펼쳐졌습니다.' },
    { fn: () => { const P = Gm().P; P.face = a2 + Math.PI * 0.85; }, cam: () => [jx() - Math.sin(a2) * 2.2 + 0.6, hAt(jx(), jz()) + 1.5, jz() - Math.cos(a2) * 2.2], look: () => [jx(), hAt(jx(), jz()) + 1.45, jz()], dur: 5.5, fov: 0.6,
      n: '요셉', t: '(뒤를 돌아본다) …저 산 너머가 헤브론인데. 아버지…', e: 'sad' },
  ], () => cinCaravanNight(S, G, () => afterNight(S, G)), { noSkip: false });
}
function afterNight(S, G) {
  const a = LEG2[0], b = LEG2[1], ang = Math.atan2(b[0] - a[0], b[1] - a[1]), h = hAt(a[0], a[1]);
  cine([{ fn: () => stageCar(a[0], a[1], ang, true), cam: [a[0] + 14, h + 6, a[1] - 6], cam2: [a[0] + 8, h + 4, a[1] - 2], look: [a[0] - 2, h + 1, a[1] + 3], dur: 5.5, music: 'j_caravan', t: '여러 날을 걸어 광야를 건넜습니다. 모래 너머로 초록빛이 비치기 시작했습니다.' }],
    () => { const g = SPOTS.egyptGate; stageCar(g[0] + 1, g[1] - 4, ang, true); cinReveal(S, G, () => { stageCar(SPOTS.market[0] + 6, SPOTS.market[1] - 9, -0.4, true); S.q.reveal = 1; Gm().checkStep(); }); });
}
function cinCaravanNight(S, G, then) {
  const [cx, cz] = SPOTS.caravanNight, h = hAt(cx, cz);
  RT.car = null; fade(() => { S.time = Math.floor(S.time / 24) * 24 + 20.6; place('ishmael', cx + 2, cz + 1.4, -2.2, { sit: true }); place('midian', cx - 1.8, cz + 1.8, 2.4, { sit: true }); place('ishBoy', cx + 1.6, cz - 2.2, -0.6);
    ['camel1', 'camel2', 'camel3'].forEach((id, i) => place(id, cx + 6 + i * 2.6, cz - 3 + i, -1.2)); G.teleport(cx - 0.4, cz - 2.6, 0.2); cpose(null); G.P.sit = true; },
  () => cine([
    { cam: [cx - 9, h + 3.6, cz - 7], cam2: [cx - 6, h + 2.4, cz - 4.6], look: [cx, h + 0.8, cz], dur: 6, t: '광야의 밤. 대상은 길가에 불을 피우고 쉬었습니다.', music: 'j_night' },
    { fn: () => walkTo('ishBoy', cx + 0.6, cz - 2.8, 1.2, n => { face('ishBoy', G.P.x, G.P.z); n.act = 'present'; }), cam: [cx + 2.4, h + 1.1, cz - 4.4], look: [cx - 0.2, h + 0.8, cz - 2.4], dur: 5, n: '대상의 아이', t: '…물. 마셔.', e: 'tender' },
    { cam: [cx - 2.6, h + 1.0, cz - 3.4], look: [cx + 0.2, h + 0.9, cz - 2.6], dur: 4, n: '요셉', t: '…고마워.', e: 'weary' },
    { fn: () => { const n = G.npc('ishBoy'); if (n) { n.act = null; n.sit = true; } }, cam: [cx + 1.8, h + 1.0, cz - 1.0], look: [cx - 0.2, h + 0.7, cz - 2.6], dur: 5, n: '대상의 아이', t: '너 어디서 왔어?' },
    { cam: [cx - 1.6, h + 0.9, cz - 4.0], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 6, n: '요셉', t: '헤브론. 저 산 너머에… 아버지가 계셔. 동생도.', e: 'sad' },
    { cam: [cx + 2.0, h + 0.9, cz - 3.6], look: [cx + 0.6, h + 0.7, cz - 2.8], dur: 7, n: '대상의 아이', t: '애굽에 가면 팔린대. 아빠가 그러는데, 너는 은 스물 줬으니까 애굽에서는 더 받을 거래.' },
    { cam: [cx - 0.8, h + 0.6, cz - 3.6], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 4.5, t: '요셉은 대답하지 못했습니다.' },
    { cam: [cx - 0.2, h + 0.5, cz - 3.2], look: [cx - 6, h + 30, cz + 14], dur: 8, n: '요셉', t: '하나님… 아버지가 들려주셨던 벧엘 이야기를 기억해요. 형을 피해 도망치던 밤, 돌을 베고 누운 아버지에게 하나님이 말씀하셨다고.', e: 'pray' },
    { cam: [cx + 0.6, h + 0.7, cz - 4.2], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 8, n: '요셉', t: '「내가 너와 함께 있어 네가 어디로 가든지 너를 지키며…」', ref: '창세기 28:15', e: 'pray' },
    { cam: [cx - 1.2, h + 0.8, cz - 3.4], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 6, fov: 0.6, n: '요셉', t: '저도… 지켜 주실 거죠? 이렇게 멀리 가도요.', e: 'cry' },
    { cam: [cx, h + 2, cz], cam2: [cx, h + 3, cz], look: [cx + 10, h + 40, cz - 30], look2: [cx - 10, h + 44, cz - 30], dur: 8, t: '그날 밤 광야의 하늘에도, 헤브론에서 보던 그 별들이 떠 있었습니다.', fadeOut: 2 },
    { black: true, title: '여러 날 후', sub: '광야를 건너 애굽으로', cam: [cx, h + 2, cz], look: [cx, h, cz - 3], dur: 3.6,
      fn: () => { G.P.sit = false; S.q.night = 1; S.day += 4; S.time = Math.floor(S.time / 24) * 24 + 8.4; if (!then) caravanStart(S, G, false); } },
  ], () => { GG.Game.musicOverride = null; G.UI.quest(); if (then) then(); }));
}
function cinReveal(S, G, then) {
  S.q.reveal = 1; const P = G.P, h = P.y;
  cine([
    { cam: [P.x - 1.5, h + 2.4, P.z + 3.5], cam2: [P.x - 20, h + 32, P.z + 12], look: [P.x - 10, h + 1, P.z - 3], look2: [-92, 0, 80], dur: 8, music: 'j_egypt', title: '애굽', sub: '나일 강의 땅',
      t: '광야가 끝나는 곳에, 끝없이 푸른 땅이 펼쳐졌습니다.' },
    { cam: [-20, 30, 120], cam2: [-60, 26, 70], look: [-110, 4, 20], look2: [-180, 20, -140], dur: 9, t: '강을 따라 늘어선 종려나무와 푸른 밭, 흰 벽의 집들. 그리고 저 멀리, 하늘을 찌르는 거대한 돌산이 서 있었습니다.' },
    { cam: [P.x - 1.6, h + 1.6, P.z - 2.4], look: [P.x, h + 1.5, P.z], dur: 5, fov: 0.65, n: '요셉', t: '여기가… 애굽.', e: 'awe' },
  ], () => { G.UI.quest(); if (then) then(); });
}
// c1_market · sold again (창 37:36; 39:1)
function cinMarket(S, G) {
  if (GG.Cine.hold) setTimeout(() => { GG.Cine.hold = false; }, 0); // the market scene ends the road-to-Egypt chain
  const bx = SPOTS.block[0], bz = SPOTS.block[1] - 2, bh = hAt(bx, bz) + 0.9, mx = SPOTS.market[0], mz = SPOTS.market[1];
  const crowd = [];
  cine([
    { fn: () => { S.q.caravanOn = 0; S.q.bound = 1; RT.car = null; G.teleport(bx + 0.6, bz + 0.5, 0); G.P.y = bh; cpose('bound', 0, true); place('auctioneer', bx - 1.3, bz + 0.2, 0.4);
        place('ishmael', bx + 3.2, bz + 2.2, -0.6); for (let i = 0; i < 7; i++) { const id = 'mkC' + i; if (!G.npc(id)) G.spawnNPC({ id, name: '구경꾼', look: [LOOK.farmer, LOOK.woman, LOOK.official, LOOK.elder, LOOK.farmerThin, LOOK.maid, LOOK.priest][i], x: bx - 4 + i * 1.4, z: bz + 4 + (i % 3) * 0.9, face: Math.PI + (i - 3) * 0.12, noTalk: true, noTag: true, show: s => s.step === 'c1_market' }); crowd.push(id); } },
      cam: [bx + 2, bh + 2, bz + 11], cam2: [bx + 1, bh + 1.4, bz + 8], look: [bx, bh + 1.2, bz], dur: 7, sfx: 'crowd', music: 'j_egypt',
      t: '애굽의 장터. 이스마엘 상인들은 요셉을 노예 상인에게 넘겼습니다.' },
    { cam: [bx - 3, bh + 0.8, bz + 3], look: [bx - 1.3, bh + 1.6, bz + 0.2], dur: 6, fn: () => emote('auctioneer', 'wave', 4), ...EG('auctioneer', '헴! 헴 네페르! 가나안의 젊은 종이오!', '종이오! 좋은 종! 가나안에서 온 젊은 종이오!', 'shout') },
    { cam: [bx + 2.6, bh + 0.6, bz + 2.2], look: [bx + 0.6, bh + 1.3, bz + 0.5], dur: 6, fov: 0.62, t: '사람들이 요셉의 팔을 만져 보고, 이를 들여다보고, 값을 불렀습니다. 요셉은 땅만 내려다보았습니다.' },
    { fn: () => { place('potiphar', mx + 5, mz + 4.5, -2.2); walkTo('potiphar', bx + 1.2, bz + 3.4, 1.9, n => face('potiphar', bx, bz)); G.sfx('crowd'); },
      cam: [bx - 2, bh + 1.4, bz + 1], look: [mx + 8, hAt(mx, mz) + 1.4, mz + 5], dur: 6, n: '애굽 상인', t: '(속삭이며) 비켜라, 비켜! 친위대장 보디발 나리시다!', e: 'whisper' },
    { cam: [bx + 2.8, bh + 0.4, bz + 4.2], look: [bx + 1.2, hAt(bx, bz) + 1.6, bz + 3.4], dur: 6, n: '보디발', t: '…눈빛이 맑구나. 종의 눈이 아니야. 이름이 무엇이냐.', e: 'calm' },
    { cam: [bx + 1.2, bh + 0.6, bz + 3.2], look: [bx + 0.6, bh + 1.4, bz + 0.5], dur: 5, n: '요셉', t: '요셉… 히브리 사람 요셉입니다.', e: 'weary' },
    { cam: [bx - 0.4, bh + 0.4, bz + 4.4], look: [bx + 1.2, hAt(bx, bz) + 1.6, bz + 3.4], dur: 5, n: '보디발', t: '가나안 말을 하는구나. 좋다. 내가 사겠다.', fn: () => G.sfx('coins') },
    { cam: [bx + 8, bh + 5, bz + 12], cam2: [bx + 6, bh + 9, bz + 16], look: [bx, bh, bz], dur: 8, t: '요셉이 이끌려 애굽에 내려가매, 바로의 신하 친위대장 애굽 사람 보디발이 그를 거기로 데려간 이스마엘 사람의 손에서 그를 사니라.', ref: '창세기 39:1', fadeOut: 1.6 },
    { black: true, title: '2장 · 보디발의 집', sub: '창세기 39:1–20', cam: [bx, bh + 2, bz + 4], look: [bx, bh, bz], dur: 4,
      fn: () => { crowd.forEach(id => G.removeNPC(id)); S.q.bound = 0; cpose(null); } },
  ], () => fade(() => { G.teleport(SPOTS.pGate[0], SPOTS.pGate[1] - 5, Math.PI); S.time = Math.floor(S.time / 24) * 24 + 16.4; G.go('c2_arrive'); }, () => { GG.Game.musicOverride = null; }));
}

// ------------------------------------------------------------------ 2장 · Potiphar's house
WORDS.irp = ['이르프 · 포도주', '포도주. 잔칫상에 빠지지 않는 말이에요.', 'stew']; WORDS.dab = ['데브 · 무화과', '무화과. 보디발 나리가 제일 좋아하는 과일이에요.', 'berry'];
function ledgerPuzzle(S, G) {
  const sh = S.q.shelf || {};
  say([N('scribe', '내 장부에는 이렇게 적혀 있네. 포도주 열넷, 기름 열둘, 곡식 스물둘, 무화과 아홉.', '', 'weary'),
    { n: '요셉', t: `내가 센 것과 다른 것은? (포도주 ${sh.wine} · 기름 ${sh.oil} · 곡식 ${sh.grain} · 무화과 ${sh.figs})`, choices: [
      { t: '포도주', ok: false, fb: '포도주는 열넷. 장부와 같아요.' }, { t: '기름과 무화과', ok: true }, { t: '곡식', ok: false, fb: '곡식 자루는 스물둘. 장부와 같아요.' }, { t: '모두 맞아요', ok: false, fb: '다시 한 번 장부와 선반의 수를 견주어 보세요.' }] },
    N('scribe', '기름이 셋, 무화과가 셋 모자란다고…? 그럼 누가 훔쳐 갔단 말인가!', '', 'fear'),
    { n: '요셉', t: '모자란 기름 셋과 무화과 셋은 어디로 갔을까?', choices: [
      { t: '"지난 잔치 때 부엌으로 내간 것을 장부에 적지 않으셨어요. 부엌에서 기름병 셋과 무화과 바구니 셋을 보았어요."', ok: true },
      { t: '"누군가 훔쳐 간 게 틀림없어요."', ok: false, fb: '증거 없이 사람을 의심하면 안 돼요. 요셉은 오늘 부엌에서 일하며 본 것을 떠올렸습니다.' }] },
    N('scribe', '아이고! 맞다, 지난번 잔치 때…! 내 정신 좀 봐. 히브리 청년, 자네는 눈이 밝기도 하구먼.', '', 'laugh'),
    N('potiphar', '…장부가 맞았다고? 저 종이 셈을 했단 말이냐.', '', 'awe')], () => tick(S, 'ledger'));
}
function cinPotiphar(S, G, next) {
  const hx = -28, hz = 41.6, hh = hAt(hx, hz);
  fade(() => { S.time = Math.floor(S.time / 24) * 24 + 17.6; place('potiphar', -28, 39.4, 0, { sit: true }); G.teleport(-28, 43.4, Math.PI); }, () => cine([
    { cam: [hx + 4, hh + 2, hz + 6], cam2: [hx + 2.6, hh + 1.6, hz + 4.4], look: [hx, hh + 1.1, hz - 1], dur: 6, music: 'j_house', t: '여호와께서 요셉과 함께 하시므로 그가 형통한 자가 되어 그의 주인 애굽 사람의 집에 있으니', ref: '창세기 39:2' },
    { cam: [hx - 1.8, hh + 1.2, hz + 1.4], look: [hx, hh + 1.0, hz - 2.2], dur: 6, n: '보디발', t: '히브리 청년. 네가 손대는 일마다 잘된다고 집안이 떠들썩하더구나. 우물물이 맑아지고, 소가 살찌고, 이제는 장부까지.' },
    { cam: [hx + 1.6, hh + 1.3, hz - 0.4], look: [-28, hh + 1.3, 43.4], dur: 6, n: '요셉', t: '나리, 제가 한 것이 아닙니다. 제 하나님 여호와께서 함께 하셔서 그렇습니다.', e: 'calm', fn: () => cpose('bow', 1.6) },
    { cam: [hx - 1.4, hh + 1.1, hz + 1.8], look: [hx, hh + 1.0, hz - 2.2], dur: 7, t: '그의 주인이 여호와께서 그와 함께 하심을 보며, 또 여호와께서 그의 범사에 형통하게 하심을 보았더라.', ref: '창세기 39:3' },
    { cam: [hx + 2, hh + 1.4, hz + 2.8], look: [hx, hh + 1.1, hz - 1.6], dur: 7, n: '보디발', t: '이레 뒤에 바로의 궁에서 손님들이 온다. 잔치 시중은 네가 들어라. 애굽 말로 주문을 받아야 할 게다.' },
  ], next));
}
const WANT = { guest1: { eg: '이르프!', ko: '포도주!', item: '포도주 항아리', prop: 'jar', arms: true }, guest2: { eg: '무… 무 네페르.', ko: '물… 좋은 물.', item: '물동이', prop: 'jarHead' },
  guest3: { eg: '타! 타 네페르!', ko: '빵! 좋은 빵!', item: '빵 바구니', prop: 'basket' }, potiphar: { eg: '데브.', ko: '무화과.', item: '무화과 쟁반', prop: 'basket' } };
const WANT_ORDER = ['guest1', 'guest2', 'guest3', 'potiphar'];
function banquetStart(S, G, re) {
  const go = () => { S.q.served = S.q.served || 0; S.q.want = WANT_ORDER[S.q.served]; S.q.carry = null; G.P.carry = null; askNext(S); };
  if (re) { go(); return; }
  fade(() => { S.time = Math.floor(S.time / 24) * 24 + 19.3; G.teleport(-37.2, 45.4, 2.6); }, () => say([N('ameni', '요셉, 잘 들어라. 손님들은 애굽 말로만 주문할 게다. 「이르프」는 포도주, 「데브」는 무화과란다.', '', 'whisper'),
    N('ameni', '무와 타는 알지? 시중 상에서 알맞은 것을 들고 가서 손님께 드려라.', '', 'tender')], () => { learn('irp'); learn('dab'); go(); }));
}
// v16.6: the order stays above the guest's head until it is served, and the table shows each dish with its Egyptian word —
// you read the order and pick the matching dish instead of guessing
function askNext(S) { const w = WANT[S.q.want]; if (!w) return; const id = S.q.want; const keep = () => { if (Gm().S().step === 'c2_banquet' && Gm().S().q.want === id && !GG.UI.busy()) bubble(id, w.eg, 6); }; setTimeout(keep, 600); clearInterval(RT.ordT); RT.ordT = setInterval(() => { if (Gm().S().step !== 'c2_banquet' || Gm().S().q.want !== id) { clearInterval(RT.ordT); return; } keep(); }, 5500); GG.UI.quest(); }
function serveTable(S, G) {
  const keys = WANT_ORDER.map(k => WANT[k].item); keys.sort();
  const w0 = WANT[S.q.want], EGW = { '포도주 항아리': '이르프', '물동이': '무', '빵 바구니': '타', '무화과 쟁반': '데브' };
  GG.UI.choose(`무엇을 들고 갈까? · 지금 주문: 「${w0 ? w0.eg : '…'}」`, keys.map(k => `${k} · 「${EGW[k]}」`), i => { const it = keys[i]; const w = Object.values(WANT).find(x => x.item === it);
    S.q.carry = it; G.P.carry = w.prop; G.P.carryArms = !!w.arms; G.sfx('pickup'); G.UI.quest(); });
}
for (const id of WANT_ORDER) steps.c2_banquet.talk = Object.assign(steps.c2_banquet.talk || {}, { [id]: (S, G) => serveGuest(S, G, id) });
function serveGuest(S, G, id) {
  const w = WANT[id];
  if (id !== S.q.want) { say([N(id === 'potiphar' ? 'potiphar' : id, id === 'potiphar' ? '손님들부터 모셔라.' : '…나는 아직 괜찮다.')]); return; }
  if (!S.q.carry) { say([EG(id, w.eg, '', 'calm'), T('무엇을 원하는 걸까? 시중 상으로 가서 알맞은 것을 들고 오세요.')]); return; }
  if (S.q.carry !== w.item) { const had = S.q.carry; S.q.carry = null; G.P.carry = null; G.UI.quest(); say([EG(id, '이아! ' + w.eg, '아니! ' + w.ko, 'angry'), T(`가져온 것은 ${had}. 손님은 다른 것을 원해요. 시중 상으로 돌아가 다시 골라 보세요.`)]); return; }
  G.P.carry = null; S.q.carry = null; G.sfx(w.prop === 'jar' || w.prop === 'jarHead' ? 'pour' : 'pickup'); act('pick', 0.8); S.q.served++;
  const praise = { guest1: [EG('guest1', '네페르! 이르프 네페르!', '좋다! 좋은 포도주로군!', 'happy')], guest2: [N('guest2', '…히브리 사람이 따른 물이라. 그래도 정성스럽군.', '', 'cold')],
    guest3: [EG('guest3', '타 네페르! 하하!', '좋은 빵이다! 하하!', 'laugh')], potiphar: [N('potiphar', '…데브. 내가 무화과를 좋아하는 걸 어찌 알았느냐.', '', 'tender')] }[id];
  say(praise, () => { if (S.q.served < 4) { S.q.want = WANT_ORDER[S.q.served]; askNext(S); } else { S.q.want = null; G.UI.quest(); G.checkStep(); } });
}
function banquetEnd(S, G, next) {
  say([N('guest1', '보디발, 이 종은 어디서 구했소? 애굽 말도 서툰 이방인이 손님 마음을 이리 잘 읽다니. 바로의 궁에도 이런 자는 드물 거요.', '', 'happy'),
    N('potiphar', '…요셉. 앞으로 나오너라.'),
    N('potiphar', '오늘부터 너는 내 집의 총무다. 내 집과 내 모든 소유를 네 손에 맡긴다.', '창세기 39:4'),
    T('요셉이 그의 주인에게 은혜를 입어 섬기매, 그가 요셉을 가정 총무로 삼고 자기의 소유를 다 그의 손에 위탁하니', '창세기 39:4'),
    N('ameni', '(눈시울을 붉히며) …네 하나님이 정말 너와 함께 계시는구나.', '', 'tender')], () => { G.setOutfit('josephSteward'); G.sfx('fanfare'); S.q.carry = null; next(); });
}
// c2_manage
function assignPuzzle(S, G) {
  GG.UI.puzzle({ title: '일꾼들에게 일 맡기기', hint: '왼쪽의 일꾼을 고르고, 그 사람에게 가장 잘 맞는 일(오른쪽)을 고르세요',
    syms: [{ id: 'cook', t: '요리사 헤누 · 혀가 예민해 맛을 잘 본다', m: 'feast', h: '헤누는 맛을 잘 봐요. 음식과 관계된 일이 좋겠지요?' },
      { id: 'gard', t: '정원지기 세티 · 물길을 손금 보듯 안다', m: 'water', h: '세티는 물길을 잘 알아요.' },
      { id: 'boy', t: '소 치는 아이 파이 · 소들이 졸졸 따른다', m: 'cattle', h: '소들이 따르는 아이에게는…' },
      { id: 'weave', t: '베 짜는 여인 타뮈 · 손끝이 섬세하다', m: 'linen', h: '섬세한 손끝은 무엇을 짜는 데 쓰일까요?' },
      { id: 'scr', t: '서기관 이피 · 글과 셈을 안다 (눈은 침침하다)', m: 'ledger', h: '글과 셈을 아는 사람에게는 기록을 맡겨요. 대신 곳간은 함께 세어 주면 되지요.' }],
    means: [{ id: 'water', t: '밭과 정원 물대기' }, { id: 'feast', t: '잔치 음식 준비' }, { id: 'ledger', t: '곳간 기록 (요셉이 함께 셈)' }, { id: 'cattle', t: '외양간 돌보기' }, { id: 'linen', t: '세마포 짜기' }] },
  () => { say([T('일꾼들은 저마다 잘하는 일을 맡자 신이 나서 일했습니다. 보디발의 집이 하루가 다르게 달라졌습니다.')], () => tick(S, 'assign')); });
}
function quarrel(S, G) {
  place('cook', -16, 56.8, -1.2); place('gardener', -18.6, 56.2, 1.2);
  say([N('cook', '연못 물을 부엌에 써야겠소! 잔치가 코앞인데 우물만으로는 모자라!', '', 'angry'), N('gardener', '안 되오! 연못 물을 퍼 가면 연꽃이 다 말라 죽소! 마님이 아끼시는 연꽃이란 말이오!', '', 'angry'),
    { n: '요셉', t: '어떻게 해결할까?', choices: [
      { t: '"아침에는 부엌이 우물물을 먼저 쓰고, 연못은 세티가 돌보세요. 그리고 샤두프로 수로 물을 길어 올려 연못을 채웁시다."', ok: true },
      { t: '"헤누, 요리가 더 중요하니 연못 물을 쓰세요."', ok: false, fb: '세티의 얼굴이 굳었습니다. 한쪽 편만 들면 다툼은 끝나지 않아요.' },
      { t: '"둘 다 그만! 오늘은 아무도 물을 쓰지 마시오."', ok: false, fb: '그러면 잔치도 정원도 망가져요. 둘 다 살리는 길은 없을까요?' }] },
    N('gardener', '샤두프로…? 아, 동쪽 담 곁의 그 두레박 장대 말이오? 그거면 수로 물을 금방 퍼 올리겠군!', '', 'happy'), N('cook', '흠… 아침에 우물을 먼저 쓴다면야. 좋소, 총무.', '', 'calm')],
  () => { const c = G.npc('cook'), g = G.npc('gardener'); if (c) { G.npcTo('cook', -10.8, 43.8, Math.PI, false); c.act = 'gather'; } if (g) { G.npcTo('gardener', -15.4, 60.6, -1.6, false); g.act = 'water'; } tick(S, 'quarrel'); });
}
steps.c2_manage.talk.gardener = steps.c2_manage.talk.gardener || ((S, G) => { if (S.q.quarrel) return false; quarrel(S, G); });
function cinBless(S, G, next) {
  cine([
    { cam: [16, hAt(6, 44) + 6, 52], cam2: [12, hAt(6, 44) + 4, 50], look: [6, hAt(6, 44) + 0.6, 44], dur: 7, music: 'j_house', hour: 9.5, t: '그가 요셉에게 자기의 집과 그의 모든 소유물을 주관하게 한 때부터, 여호와께서 요셉을 위하여 그 애굽 사람의 집에 복을 내리시므로', ref: '창세기 39:5',
      fn: () => { const pl = S.plots; for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) pl['pflax:' + i + ',' + j] = { s: 2, c: 'flax', st: 3, g: 0, w: 1 }; G.ENT.plotsDirty = true; } },
    { cam: [16, hAt(9, 76) + 3, 84], look: [9, hAt(9, 76) + 0.8, 76], dur: 6, t: '여호와의 복이 그의 집과 밭에 있는 모든 소유에 미친지라.', ref: '창세기 39:5' },
    { cam: [-20, hAt(-28, 41) + 2.4, 48], look: [-28, hAt(-28, 41) + 1.2, 40], dur: 7, t: '주인이 그의 소유를 다 요셉의 손에 위탁하고, 자기가 먹는 음식 외에는 간섭하지 아니하였더라.', ref: '창세기 39:6' },
    { fn: () => place('wife', -20.6, 61.6, Math.PI), cam: [-23, hAt(-20, 60) + 1.5, 64.5], look: [-20.6, hAt(-20, 60) + 1.5, 61.6], dur: 6, fov: 0.6, t: '요셉은 용모가 빼어나고 아름다웠더라.', ref: '창세기 39:6' },
    { cam: [-19.6, hAt(-20, 60) + 1.6, 63.4], look: [-28, hAt(-28, 44) + 1.2, 44], dur: 6, fov: 0.55, t: '그리고 그 모습을, 연못가에서 한 여인이 오래도록 바라보고 있었습니다.' },
  ], next);
}
// c2_tempt3 → the garment (창 39:11–12)
function cinGrab(S, G) {
  const tx = -22.5, tz = 41.6, th = hAt(tx, tz);
  cine([
    { fn: () => { G.teleport(tx, tz, Math.PI); cpose('pick', 0, true); place('wife', -31, 39.6, 1.2); }, cam: [tx + 3.6, th + 1.7, tz + 3.2], look: [tx, th + 1, tz - 0.6], dur: 6, music: 'j_dread',
      t: '집 안은 고요했습니다. 요셉은 대청의 장부를 정리하고 있었습니다.' },
    { fn: () => walkTo('wife', tx - 1.1, tz + 0.5, 1.1, () => face('wife', tx, tz)), cam: [tx - 4, th + 1.5, tz + 2.6], look: [tx - 2.4, th + 1.3, tz + 0.2], dur: 6, n: '보디발의 아내', t: '요셉… 아무도 없어. 오늘은 아무도.', e: 'whisper' },
    { fn: () => { cpose(null); G.P.face = -1.5; }, cam: [tx + 1.6, th + 1.5, tz + 1.8], look: [tx - 1, th + 1.4, tz + 0.4], dur: 5, fov: 0.62, n: '보디발의 아내', t: '나와 동침하자.', ref: '창세기 39:12', e: 'whisper' },
    { fn: () => { emote('wife', 'grabCloth', 3); }, cam: [tx - 0.4, th + 1.3, tz + 2.6], look: [tx - 0.6, th + 1.2, tz + 0.4], dur: 3.5, n: '요셉', t: '안 됩니다!', e: 'shout', shake: 0.3, shakeDecay: 0.8 },
    { fn: () => { G.sfx('rip'); G.setOutfit('josephFled'); S.q.robe = 1; G.P.face = 0.2; cpose(null); }, cam: [tx - 3.2, th + 1.6, tz + 3.4], look: [tx - 0.8, th + 1.1, tz + 0.6], dur: 6, shake: 0.4, shakeDecay: 1.2,
      t: '그 여인이 그의 옷을 잡고 동침하자 하니, 요셉이 자기의 옷을 그 여인의 손에 버리고 밖으로 나가매', ref: '창세기 39:12' },
  ], () => G.go('c2_flee'));
}
// c2_flee done → accused and imprisoned (창 39:13–20)
function cinAccuse(S, G, next) {
  const hx = -28, hz = 41.6, hh = hAt(hx, hz), gx = SPOTS.pGate[0], gz = SPOTS.pGate[1], gh = hAt(gx, gz);
  cine([
    { fn: () => { S.q.empty = 0; place('wife', -27, 43, 0); emote('wife', 'cheer', 6); [['cook', -31, 46], ['gardener', -24.6, 46.4], ['maid', -29.4, 47.6], ['neb', -26.2, 48], ['ameni', -32.4, 47]].forEach(([id, x, z]) => place(id, x, z, Math.atan2(-27 - x, 43 - z))); G.teleport(gx + 0.6, gz + 2.6, 0); },
      cam: [hx + 5, hh + 2.2, hz + 9], cam2: [hx + 3.6, hh + 1.8, hz + 7], look: [-27, hh + 1.3, 44], dur: 6, sfx: 'crowd', t: '그 여인이 요셉이 그의 옷을 자기 손에 버리고 도망하여 나감을 보고, 그 여인의 집 사람들을 불러서', ref: '창세기 39:13–14' },
    { cam: [-25.2, hh + 1.5, 46], look: [-27, hh + 1.5, 43], dur: 9, fov: 0.65, n: '보디발의 아내', t: '보라! 주인이 히브리 사람을 우리에게 데려다가 우리를 희롱하게 하는도다. 그가 나와 동침하고자 내게로 들어오므로 내가 크게 소리 질렀더니, 그가 그의 옷을 내게 버려두고 도망하여 나갔느니라!', ref: '창세기 39:14–15', e: 'shout' },
    { cam: [-33.6, hh + 1.5, 48.6], look: [-32.4, hh + 1.5, 47], dur: 5, fov: 0.6, n: '늙은 종 아메니', t: '(…요셉이 그럴 리가 없어. 그 아이는…)', e: 'whisper' },
    { hour: 18.8, fn: () => { place('potiphar', gx, gz + 4, Math.PI); walkTo('potiphar', -27.4, 45.6, 1.6, () => face('potiphar', -27, 43)); place('pg1', gx - 1.4, gz + 3.6, Math.PI); place('pg2', gx + 1.4, gz + 3.6, Math.PI); G.npcShow('pg1', true); G.npcShow('pg2', true); },
      cam: [gx + 3, gh + 2, gz - 6], look: [gx, gh + 1.3, gz + 1], dur: 6, t: '그의 옷을 곁에 두고 자기 주인이 집으로 돌아오기를 기다려', ref: '창세기 39:16' },
    { cam: [-24.6, hh + 1.6, 44.8], look: [-27, hh + 1.5, 43], dur: 8, n: '보디발의 아내', t: '당신이 우리에게 데려온 히브리 종이 나를 희롱하려고 내게로 들어왔으므로, 내가 소리 질러 불렀더니 그가 그의 옷을 내게 버려두고 밖으로 도망하여 나갔나이다.', ref: '창세기 39:17–18', e: 'cry' },
    { cam: [-26.4, hh + 1.6, 47.8], look: [-27.4, hh + 1.6, 45.6], dur: 7, fov: 0.6, t: '주인이 그의 아내가 자기에게 이르기를 「당신의 종이 내게 이같이 행하였다」 하는 말을 듣고 심히 노한지라.', ref: '창세기 39:19' },
    { fn: () => { G.teleport(-27.6, 49.4, Math.PI); cpose(null); }, cam: [-26.2, hh + 1.6, 51.4], look: [-27.6, hh + 1.5, 49.4], dur: 6, t: '요셉은 아무 말도 하지 않았습니다. 무슨 말을 한들, 종의 말을 누가 믿어 줄까요.' },
    { cam: [-28.6, hh + 1.6, 47.6], look: [-27.4, hh + 1.6, 45.6], dur: 6, n: '보디발', t: '……이자를 묶어라. 왕의 옥에 넣어라.', e: 'cold' },
    { fn: () => { G.setOutfit('josephFettered'); S.q.chain = 1; cpose('bound', 0, true); G.sfx('chain'); walkTo('pg1', -28.8, 49.8, 2); walkTo('pg2', -26.4, 49.8, 2); }, cam: [-24, hh + 2, 52], look: [-27.6, hh + 1.2, 49.4], dur: 8,
      t: '요셉의 주인이 그를 잡아 옥에 넣으니, 그 옥은 왕의 죄수를 가두는 곳이었더라. 요셉이 옥에 갇혔으나', ref: '창세기 39:20', fadeOut: 1.6 },
    { black: true, title: '3장 · 왕의 옥', sub: '창세기 39:20–41:14', cam: [-30, 4, 10], look: [-30, 1, 0], dur: 4, fn: () => { stage(S, G); } },
    { hour: 21.4, fn: () => { G.teleport(-18.4, -6.2, Math.PI); cpose('bound', 0, true); G.sfx('door'); }, fadeIn: 1.6, music: 'j_prison',
      cam: [-18.4, hAt(-18.4, -6) + 1.6, -1.6], look: [-18.4, hAt(-18.4, -6) + 1.0, -6.4], dur: 8, t: '「그의 발은 차꼬를 차고, 그의 몸은 쇠사슬에 매였으니」', ref: '시편 105:18', sfx: 'chain' },
  ], () => { GG.Game.musicOverride = null; next(); });
}
