/* 약속의 길 — v18.35 불 시뮬레이션 (입자 하나하나가 뜨거운 기체).
   참고한 생각: Stam & Fiume 1995 「Depicting Fire and Other Gaseous Phenomena」 (난류 바람장에 실려 가는 뜨거운 기체),
   Nguyen·Fedkiw·Jensen 2002 「Physically Based Modeling and Animation of Fire」 (온도가 만드는 부력, 복사로 식는 T⁴ 냉각, 흑체 색, 그을음).
   · 온도 T: 복사(T⁴)와 대류로 식어요. 뜨거울수록 빨리 식고, 식으면 빨강 → 그을음 연기가 돼요.
   · 부력: (T − 주변 온도)에 비례해 위로 가속. 공기가 빨려 들어와(entrainment) 불꽃 위쪽이 좁아져요.
   · 난류: 발산 없는 바람장(회전 성분)으로 불꽃이 일렁이고, 날씨의 바람에 눕고, 비가 오면 작아져요.
   · 불똥: 온도가 천천히 식는 작은 입자가 위로 튀어 올라요.
   · 그리기: 불꽃은 더해지고(가산) 연기는 가려요(미리 곱한 알파 한 번에). 폰에서는 입자 수를 줄여요. */
'use strict';
(function (G) {
const Game = G.Game, R = G.R, COARSE = () => !!Game.COARSE; const MAX = 320, F = G.Fire = {};
const X = new Float32Array(MAX), Y = new Float32Array(MAX), Z = new Float32Array(MAX), VX = new Float32Array(MAX), VY = new Float32Array(MAX), VZ = new Float32Array(MAX), T = new Float32Array(MAX), SZ = new Float32Array(MAX), CX = new Float32Array(MAX), CZ = new Float32Array(MAX), K = new Uint8Array(MAX), AGE = new Float32Array(MAX);
let n = 0, clock = 0;
const cap = () => COARSE() ? 150 : MAX;
function add(x, y, z, vx, vy, vz, t, s, cx, cz, k) { if (n >= cap()) return; const i = n++; X[i] = x; Y[i] = y; Z[i] = z; VX[i] = vx; VY[i] = vy; VZ[i] = vz; T[i] = t; SZ[i] = s; CX[i] = cx; CZ[i] = cz; K[i] = k; AGE[i] = 0; }
/* power 0..1 (a torch 0.3, a campfire 0.8, a bonfire 1), radius of the fuel bed */
F.emit = function (x, y, z, power, radius, dt) { const rain = G.Weather ? G.Weather.cur.rain : 0, p = power * (1 - rain * 0.45), flick = 0.72 + 0.28 * Math.sin(clock * 9 + x) * Math.sin(clock * 5.3 + z), rate = p * flick * (COARSE() ? 72 : 120) * (dt || 0.033); let m = Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0);
  while (m-- > 0) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * radius; add(x + Math.cos(a) * r, y + Math.random() * 0.08, z + Math.sin(a) * r, 0, 0.4 + Math.random() * 0.5, 0, 0.82 + Math.random() * 0.18, (0.2 + power * 0.2) * (1 - r / (radius * 2.2)), x, z, 0); }
  add(x, y + 0.3 * (0.6 + power), z, 0, 0, 0, 0.5, 0.75 + power * 0.7 * flick, x, z, 3); /* the glow in the heart of the fire */
  if (Math.random() < p * (dt || 0.033) * 3.4) { const a = Math.random() * 6.283; add(x + Math.cos(a) * radius * 0.5, y + 0.1, z + Math.sin(a) * radius * 0.5, Math.cos(a) * 0.5, 1.8 + Math.random() * 1.8, Math.sin(a) * 0.5, 1, 0.03, x, z, 1); } };
function step(dt) { clock += dt; if (dt <= 0) return; const wind = G.Weather ? G.Weather.cur.wind * 0.35 : 0.25, s = 1.75, a = clock * 2.1; let w = 0;
  for (let i = 0; i < n; i++) { const t = T[i], k = K[i], x = X[i], y = Y[i], z = Z[i]; let tn;
    if (k === 3) { if (AGE[i] > 0) continue; AGE[i] = 1; X[w] = x; Y[w] = y; Z[w] = z; VX[w] = VY[w] = VZ[w] = 0; T[w] = t; SZ[w] = SZ[i]; CX[w] = x; CZ[w] = z; K[w] = 3; AGE[w] = 1; w++; continue; }
    if (k === 3) tn = 0; else if (k === 1) tn = t - dt * 0.55; else if (k === 2) tn = t - dt * 0.42; else tn = t - dt * (1.25 + 2.5 * t * t * t * t);
    if (tn <= 0.02) { if (k === 0 && Math.random() < 0.09) { X[w] = x; Y[w] = y; Z[w] = z; VX[w] = VX[i] * 0.6; VY[w] = VY[i] * 0.7; VZ[w] = VZ[i] * 0.6; T[w] = 0.9; SZ[w] = SZ[i] * 1.5; CX[w] = CX[i]; CZ[w] = CZ[i]; K[w] = 2; AGE[w] = 0; w++; } continue; } /* burnt out: soot */
    const hot = k === 0 ? tn : 0.2, tu = (k === 2 ? 0.8 : 0.5 + 2.1 * hot), ux = Math.sin(y * s + a) * Math.cos(z * s * 1.3 - a * 0.7), uz = Math.cos(y * s * 1.1 - a * 1.2) * Math.sin(x * s * 1.2 + a), uy = 0.45 * Math.sin((x + z) * s + a);
    let ax = ux * tu * 1.9 + wind * 0.4, az = uz * tu * 1.9, ay = k === 0 ? 5.2 * (tn - 0.04) : k === 1 ? 0.9 - 2.6 * (1 - tn) : 0.75; ay += uy * tu * 1.6;
    if (k === 0) { ax += (CX[i] - x) * 11 * (1.1 - tn); az += (CZ[i] - z) * 11 * (1.1 - tn); } /* entrainment: the air drawn in pinches the flame to a point */
    const dg = k === 2 ? 1.2 : 2.3; const vx = VX[i] + (ax - VX[i] * dg) * dt, vy = VY[i] + (ay - VY[i] * (dg * 0.65)) * dt, vz = VZ[i] + (az - VZ[i] * dg) * dt;
    X[w] = x + vx * dt; Y[w] = y + vy * dt; Z[w] = z + vz * dt; VX[w] = vx; VY[w] = vy; VZ[w] = vz; T[w] = tn; SZ[w] = SZ[i] * (1 + dt * (k === 2 ? 0.75 : k === 1 ? 0 : -1.1)); CX[w] = CX[i]; CZ[w] = CZ[i]; K[w] = k; AGE[w] = AGE[i] + dt; w++; }
  n = w; }
/* black-body ramp, a little warmer than the real thing so it reads on a phone */
function write() { const B = R.fireBuf; if (!B) return 0; const d = B.data; for (let i = 0; i < n; i++) { const t = T[i], k = K[i], o = i * 8; d[o] = X[i]; d[o + 1] = Y[i]; d[o + 2] = Z[i]; let r, g, b, a;
    if (k === 3) { r = 1; g = 0.48; b = 0.12; a = 0.24; } else if (k === 2) { r = g = b = 0.1; a = t * 0.2; } else if (k === 1) { r = 1; g = 0.5 + t * 0.3; b = 0.12; a = 0.5 + 0.5 * Math.sin(AGE[i] * 30 + i); }
    else { const u = t > 0.75 ? (t - 0.75) / 0.25 : t > 0.5 ? (t - 0.5) / 0.25 : t > 0.25 ? (t - 0.25) / 0.25 : t / 0.25; if (t > 0.75) { r = 1; g = 0.62 + 0.3 * u; b = 0.14 + 0.46 * u; } else if (t > 0.5) { r = 1; g = 0.3 + 0.32 * u; b = 0.05 + 0.09 * u; } else if (t > 0.25) { r = 0.62 + 0.38 * u; g = 0.08 + 0.22 * u; b = 0.02 + 0.03 * u; } else { r = 0.2 + 0.42 * u; g = 0.05 + 0.03 * u; b = 0.03; } a = Math.min(0.85, t * 1.25); }
    d[o + 3] = r; d[o + 4] = g; d[o + 5] = b; d[o + 6] = a; d[o + 7] = SZ[i]; } return n; }
F.frame = function (sc, dt) { if (!R.fireBuf) R.fireInit(MAX); step(Math.min(dt, 0.05)); sc.fire = { n: write() }; };
F.count = () => n;
})(window.G);
