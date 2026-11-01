
// ------------------------------------------------------------------ props for this episode
const PI = Math.PI;
const WHITE = 0xeee6d2, SAND = 0xe4d2a9, LAPIS = 0x2c5aa0, OCHRE = 0xb3472e, TURQ = 0x2f8a77, GOLD = 0xd9a73a, MUD = 0xc49a6c, WOOD = 0x7a5a3a, LINEN = 0xf4efe2;
const band = (g, M, w, y, d, z) => { g.box(w, 0.22, 0.04, { m: M, at: [0, y, z], c: (x) => [LAPIS, OCHRE, TURQ, GOLD][Math.floor((x + w) * 1.4) % 4], j: 0 }); };
const ENVX = {
  egWall(g, M, r, len, h, col) { h = h || 3; const c = col || WHITE; g.box(len, h, 0.7, { m: M, at: [0, h / 2, 0], c, j: 0.02 }); g.box(len + 0.1, 0.18, 0.86, { m: M, at: [0, h + 0.06, 0], c: 0xd8c8a8, j: 0.02 }); },
  mudWall(g, M, r, len, h) { h = h || 2.4; const n = Math.max(1, Math.round(len / 2)); for (let i = 0; i < n; i++) g.box(len / n + 0.02, h, 0.6, { m: M, at: [-len / 2 + (i + 0.5) * len / n, h / 2, 0], c: [0xc49a6c, 0xbc9264, 0xcaa274][i % 3], j: 0.03 }); },
  portico(g, M, r, w, d, h, n) { // flat roof on painted papyrus columns + back wall: the open front hall of a great house
    h = h || 4; n = n || 6; g.box(w, h, 0.6, { m: M, at: [0, h / 2, -d / 2], c: WHITE, j: 0.02 }); band(g, M, w, h - 0.6, 0, -d / 2 + 0.31);
    for (const s of [1, -1]) g.box(0.6, h, d, { m: M, at: [s * (w / 2 - 0.3), h / 2, 0], c: WHITE, j: 0.02 });
    for (let i = 0; i < n; i++) { const x = -w / 2 + 1.2 + i * (w - 2.4) / (n - 1); g.cyl(0.3, 0.34, h - 0.3, 10, { m: M, at: [x, (h - 0.3) / 2, d / 2 - 0.5], c: SAND, j: 0.02 }); g.cyl(0.46, 0.3, 0.5, 10, { m: M, at: [x, h - 0.45, d / 2 - 0.5], c: TURQ }); g.cyl(0.32, 0.32, 0.16, 10, { m: M, at: [x, h * 0.7, d / 2 - 0.5], c: OCHRE }); }
    g.box(w + 0.6, 0.35, d + 0.4, { m: M, at: [0, h + 0.1, 0], c: 0xe6dcc4, j: 0.02 }); band(g, M, w + 0.6, h + 0.1, 0, d / 2 + 0.21);
    g.box(w - 1.4, 0.06, d - 1.4, { m: M, at: [0, 0.04, -0.2], c: (x, y, z) => (Math.floor(x * 0.8) + Math.floor(z * 0.8)) % 2 ? 0xd8c8a4 : 0xcab890, j: 0 }); },
  pavilion(g, M, r, w, d, h, col) { h = h || 2.6; for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2], [0, d / 2], [0, -d / 2]]) g.cyl(0.12, 0.14, h, 6, { m: M, at: [x, h / 2, z], c: WOOD });
    g.box(w + 0.6, 0.18, d + 0.6, { m: M, at: [0, h + 0.05, 0], c: col || 0xc8b48a, j: 0.04 }); for (let i = 0; i < 7; i++) g.cyl(0.05, 0.05, d + 0.8, 4, { m: M, at: [-w / 2 + i * w / 6, h + 0.18, 0], rx: PI / 2, c: 0x9a7a4a }); },
  oven(g, M) { g.lathe([[0.75, 0], [0.8, 0.4], [0.62, 0.9], [0.28, 1.15], [0.2, 1.2]], 12, { m: M, c: 0xb07448, j: 0.04 }); g.box(0.45, 0.4, 0.1, { m: M, at: [0, 0.35, 0.74], c: 0x2a1810, j: 0 }); g.sph(0.12, 6, 4, { m: M, at: [0, 0.3, 0.8], c: 0xff8a3a, j: 0.1 }); },
  quern(g, M) { g.box(1.0, 0.25, 0.55, { m: M, at: [0, 0.13, 0], c: 0x8a8278, j: 0.06, flat: true }); g.box(0.5, 0.14, 0.32, { m: M, at: [0.05, 0.32, 0], c: 0x9a9288, j: 0.06 }); g.sph(0.18, 6, 4, { m: M, at: [0.62, 0.12, 0.1], s: [1, 0.4, 1], c: 0xe8d8a0 }); },
  jars(g, M, r, n) { n = n || 4; for (let i = 0; i < n; i++) g.lathe([[0.06, 0], [0.24, 0.18], [0.27, 0.5], [0.16, 0.85], [0.1, 0.95], [0.13, 1.02]], 10, { m: M, at: [(i - (n - 1) / 2) * 0.62, 0, (i % 2) * 0.2], c: [0xc8865a, 0xb5673a, 0xd09868][i % 3] }); },
  shelves(g, M, r, kind) { g.box(2.4, 1.9, 0.5, { m: M, at: [0, 0.95, -0.15], c: 0x8a6a48, j: 0.03 }); for (const y of [0.55, 1.2]) g.box(2.5, 0.06, 0.62, { m: M, at: [0, y, 0.05], c: 0x6a4a30 });
    const col = { wine: 0x8a3a3a, oil: 0xd8b860, grain: 0xe2cfa0, figs: 0x6a4a6a }[kind] || 0xb5673a;
    for (let k = 0; k < 2; k++) for (let i = 0; i < 4; i++) { const y = 0.6 + k * 0.65; if (kind === 'grain') g.lathe([[0.12, 0], [0.2, 0.12], [0.19, 0.35], [0.09, 0.48], [0.12, 0.52]], 8, { m: M, at: [-0.9 + i * 0.6, y, 0.08], c: col }); else if (kind === 'figs') { g.cyl(0.22, 0.17, 0.2, 8, { m: M, at: [-0.9 + i * 0.6, y + 0.1, 0.08], c: 0xa57a3c }); g.sph(0.15, 6, 4, { m: M, at: [-0.9 + i * 0.6, y + 0.22, 0.08], s: [1, 0.5, 1], c: col }); }
      else g.lathe([[0.04, 0], [0.13, 0.1], [0.15, 0.3], [0.08, 0.48], [0.07, 0.56]], 8, { m: M, at: [-0.9 + i * 0.6, y, 0.08], c: kind === 'oil' ? 0xc8a050 : 0xb5673a }); } },
  room(g, M, r, w, d, h, doorW) { // walled storeroom open at the front door, flat roof
    h = h || 3; doorW = doorW || 1.6; g.box(w, h, 0.5, { m: M, at: [0, h / 2, -d / 2], c: WHITE, j: 0.02 }); for (const s of [1, -1]) g.box(0.5, h, d, { m: M, at: [s * w / 2, h / 2, 0], c: WHITE, j: 0.02 });
    const side = (w - doorW) / 2; for (const s of [1, -1]) g.box(side, h, 0.5, { m: M, at: [s * (doorW / 2 + side / 2), h / 2, d / 2], c: WHITE, j: 0.02 }); g.box(doorW, 0.6, 0.5, { m: M, at: [0, h - 0.3, d / 2], c: WHITE });
    g.box(w + 0.4, 0.22, d + 0.4, { m: M, at: [0, h + 0.05, 0], c: 0xe0d4b8, j: 0.02 }); band(g, M, w, h - 0.45, 0, d / 2 + 0.26); },
  pool(g, M, r, w, d) { g.box(w + 0.8, 0.35, d + 0.8, { m: M, at: [0, 0.12, 0], c: 0xd8c8a4 }); g.box(w, 0.06, d, { m: M, at: [0, 0.31, 0], c: 0x3a7a8a, j: 0 });
    for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * (w - 0.8), z = (r() - 0.5) * (d - 0.8); g.cyl(0.28, 0.28, 0.02, 8, { m: M, at: [x, 0.35, z], c: 0x4a8a4a, j: 0.1 }); if (i % 3 === 0) g.sph(0.09, 6, 4, { m: M, at: [x + 0.1, 0.42, z], c: [0xf0e0f0, 0x8aa0e0, 0xf0f0f8][i % 3] }); } },
  cellRow(g, M, r, n, w, d, h) { // prison cells: back wall, side walls, roof, iron/wood bars in front
    h = h || 2.8; const W2 = n * w; g.box(W2, h, 0.5, { m: M, at: [0, h / 2, -d / 2], c: 0xb8a888, j: 0.03 }); g.box(W2 + 0.5, 0.25, d + 0.3, { m: M, at: [0, h + 0.05, 0], c: 0xa89878, j: 0.03 });
    for (let i = 0; i <= n; i++) g.box(0.4, h, d, { m: M, at: [-W2 / 2 + i * w, h / 2, 0], c: 0xb0a080, j: 0.03 });
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) g.cyl(0.035, 0.035, h - 0.2, 4, { m: M, at: [-W2 / 2 + i * w + 0.5 + k * (w - 1) / 8, (h - 0.2) / 2, d / 2 - 0.1], c: 0x4a3a2a, j: 0 });
    for (let i = 0; i < n; i++) g.box(w - 0.4, 0.12, 0.12, { m: M, at: [-W2 / 2 + (i + 0.5) * w, 1.9, d / 2 - 0.1], c: 0x4a3a2a }); },
  straw(g, M, r) { g.box(1.8, 0.1, 0.8, { m: M, at: [0, 0.05, 0], c: 0xc8b070, j: 0.1 }); },
  dais(g, M, r, w, d, h) { g.box(w, h, d, { m: M, at: [0, h / 2, 0], c: SAND, j: 0.02 }); for (let i = 0; i < 3; i++) g.box(w * 0.5, h / 3, 0.4, { m: M, at: [0, h / 6 + i * h / 3 - 0.02, d / 2 + 0.6 - i * 0.4], c: 0xd8c49a }); band(g, M, w, h - 0.2, 0, d / 2 + 0.02); },
  throne(g, M) { g.box(1.2, 0.5, 1.0, { m: M, at: [0, 0.25, 0], c: GOLD }); g.box(1.2, 1.5, 0.15, { m: M, at: [0, 1.0, -0.45], c: GOLD }); for (const s of [1, -1]) g.box(0.12, 0.45, 0.9, { m: M, at: [s * 0.55, 0.7, 0], c: LAPIS });
    for (const [x, z] of [[-1.5, -1.2], [1.5, -1.2], [-1.5, 1.4], [1.5, 1.4]]) g.cyl(0.08, 0.08, 3.6, 6, { m: M, at: [x, 1.8, z], c: GOLD }); g.box(3.4, 0.12, 2.9, { m: M, at: [0, 3.6, 0.1], c: (x) => Math.floor((x + 2) * 3) % 2 ? LAPIS : WHITE }); },
  brazier(g, M) { g.cyl(0.05, 0.08, 1.1, 6, { m: M, at: [0, 0.55, 0], c: 0x6a5a3a }); g.lathe([[0.1, 1.05], [0.42, 1.25], [0.46, 1.4]], 10, { m: M, c: 0xb08a4a }); g.sph(0.28, 6, 4, { m: M, at: [0, 1.38, 0], s: [1, 0.5, 1], c: 0xff9a3a, j: 0.15 }); },
  logX(g, M) { g.cyl(0.34, 0.4, 7.5, 9, { m: M, at: [0, 0.38, 0], rz: PI / 2, c: 0x6a4a30, j: 0.06 }); for (let i = 0; i < 4; i++) g.cyl(0.07, 0.1, 1.1, 5, { m: M, at: [-2.6 + i * 1.8, 0.75, 0.15], rz: 0.6 - i * 0.3, rx: 0.4, c: 0x5a3a24 }); g.sph(0.45, 7, 5, { m: M, at: [3.8, 0.4, 0], s: [0.6, 1, 1], c: 0x8a6a48, flat: true }); },
  pitWell(g, M, r) { // the cistern: stone-lined walls (seen from inside) and a ring of rim stones
    const R0 = PIT.wall, H = PIT.depth + 0.06, n = 22;
    for (let k = 0; k < Math.ceil(H / 0.42); k++) for (let i = 0; i < n; i++) { const a = (i + (k % 2) * 0.5) / n * PI * 2, y = 0.2 + k * 0.42; g.box(0.72, 0.44, 0.4, { m: M, at: [Math.cos(a) * (R0 + 0.2), y, Math.sin(a) * (R0 + 0.2)], ry: -a + PI / 2, c: [0x9a8a72, 0x8a7a64, 0xa89880, 0x7a6c58][(i + k) % 4], j: 0.08, flat: true }); }
    g.cyl(R0 + 0.1, R0 + 0.1, 0.05, 16, { m: M, at: [0, 0.02, 0], c: 0x6a5a48, j: 0.1 });
    g.lathe([[R0 + 4.6, PIT.depth - 0.12], [R0 + 3.6, PIT.depth - 0.03], [R0 + 2.4, PIT.depth - 0.0], [R0 + 1.3, PIT.depth + 0.01], [R0 + 0.3, PIT.depth + 0.03]], 48, { m: M, c: 0x9a8668, j: 0.05 });
    g.lathe([[R0 + 0.48, -0.1], [R0 + 0.5, PIT.depth * 0.5], [R0 + 0.48, PIT.depth + 0.02]], 32, { m: M, c: 0x7e6a50, j: 0.06 }); // v13: packed earth behind the stones — nothing of the shaft shows from outside // v12: one smooth collar of trodden earth, flush with the field, over the coarse terrain slope
    for (let i = 0; i < 13; i++) { const a = (i + r() * 0.5) / 13 * PI * 2, rr = R0 + 0.55 + r() * 0.35; g.sph(0.28 + r() * 0.2, 6, 4, { m: M, at: [Math.cos(a) * rr, PIT.depth + 0.04, Math.sin(a) * rr], ry: r() * 6, s: [1.2 + r() * 0.5, 0.35 + r() * 0.2, 0.9 + r() * 0.3], c: [0xa89880, 0x9a8a72, 0xb8a890][i % 3], flat: true, j: 0.08 }); }
    for (let i = 0; i < 5; i++) g.sph(0.2 + r() * 0.15, 5, 4, { m: M, at: [(r() - 0.5) * 2.4, 0.12, (r() - 0.5) * 2.4], c: 0x8a7a64, flat: true }); },
  cistern(g, M, r) { g.cyl(1.5, 1.7, 0.4, 12, { m: M, at: [0, 0.18, 0], c: 0xa89880, flat: true, j: 0.08 }); g.cyl(1.1, 1.1, 0.05, 12, { m: M, at: [0, 0.38, 0], c: 0x1a1612, j: 0 }); },
  fort(g, M) { g.box(5, 7, 5, { m: M, at: [0, 3.5, 0], c: MUD, j: 0.03, taper: 0.92 }); for (let i = 0; i < 4; i++) for (const s of [1, -1]) { g.box(0.8, 0.7, 0.8, { m: M, at: [-1.8 + i * 1.2, 7.2, s * 2.1], c: 0xb48a5c }); g.box(0.8, 0.7, 0.8, { m: M, at: [s * 2.1, 7.2, -1.8 + i * 1.2], c: 0xb48a5c }); } g.box(1.2, 2, 0.1, { m: M, at: [0, 1, 2.52], c: 0x3a2618 }); },
  felucca(g, M) { g.lathe([[0.05, -2.4], [0.5, -1.6], [0.7, 0], [0.5, 1.6], [0.05, 2.4]], 8, { m: M, at: [0, 0.3, 0], s: [1, 0.32, 1], rz: PI / 2, c: 0x8a6440 }); g.cyl(0.05, 0.06, 4.2, 5, { m: M, at: [0, 2.3, -0.4], c: WOOD });
    g.tri([0, 4.3, -0.4], [0, 0.9, -2.0], [0, 0.9, 1.6], { m: M, c: 0xf4ecd8 }); g.tri([0, 4.3, -0.4], [0, 0.9, 1.6], [0, 0.9, -2.0], { m: M, c: 0xe8dcc0 }); },
  camelSit(g, M) { g.sph(0.6, 9, 7, { m: M, at: [0, 0.55, 0], s: [0.75, 0.6, 1.4], c: 0xc9a46c }); g.sph(0.35, 8, 6, { m: M, at: [0, 1.05, -0.05], c: 0xc9a46c }); g.cyl(0.1, 0.14, 0.9, 6, { m: M, at: [0, 1.0, 0.9], rx: 0.45, c: 0xc9a46c }); g.sph(0.14, 7, 5, { m: M, at: [0, 1.38, 1.12], s: [0.8, 0.8, 1.5], c: 0xc9a46c }); g.box(0.9, 0.3, 0.9, { m: M, at: [0, 1.25, 0], c: 0xb3472e }); },
  bales(g, M, r) { for (let i = 0; i < 5; i++) g.box(0.8, 0.5, 0.6, { m: M, at: [(i % 3) * 0.85 - 0.85, 0.25 + Math.floor(i / 3) * 0.5, 0], ry: (r() - 0.5) * 0.3, c: [0xc8a878, 0xb8946a, 0xd8b888][i % 3] }); },
  sheafField(g, M, r, n) { for (let i = 0; i < (n || 10); i++) { const x = (r() - 0.5) * 9, z = (r() - 0.5) * 6; g.cyl(0.16, 0.24, 0.9, 7, { m: M, at: [x, 0.45, z], c: 0xe2b844, j: 0.06 }); g.cyl(0.25, 0.25, 0.06, 7, { m: M, at: [x, 0.5, z], c: 0x9a6a2a }); } },
  tableEg(g, M) { g.box(1.8, 0.08, 0.8, { m: M, at: [0, 0.8, 0], c: 0x8a6440 }); for (const [x, z] of [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]]) g.cyl(0.04, 0.04, 0.8, 5, { m: M, at: [x, 0.4, z], c: 0x6a4a30 }); },
  couch(g, M) { g.box(2.0, 0.45, 0.8, { m: M, at: [0, 0.32, 0], c: 0x8a6440 }); g.box(2.0, 0.12, 0.8, { m: M, at: [0, 0.6, 0], c: LINEN }); g.box(0.2, 0.5, 0.8, { m: M, at: [-0.95, 0.75, 0], c: 0x8a6440 }); },
  seatEg(g, M) { g.box(0.6, 0.45, 0.55, { m: M, at: [0, 0.22, 0], c: 0x8a6440 }); g.box(0.6, 0.5, 0.08, { m: M, at: [0, 0.65, -0.24], c: 0x8a6440 }); },
  palmRow(g, M, r, n) { for (let i = 0; i < n; i++) G.env.datePalm(g, m4mul(m4(), M, m4trs(m4(), i * 4, 0, (r() - 0.5) * 0.6, r() * 6)), r); },
  hieroWall(g, M, r, len, h) { ENVX.egWall(g, M, r, len, h, SAND); for (let i = 0; i < Math.floor(len / 0.9); i++) for (let k = 0; k < 3; k++) if (r() < 0.75) g.box(0.32, 0.36, 0.04, { m: M, at: [-len / 2 + 0.6 + i * 0.9, h * 0.35 + k * 0.55, 0.37], c: [LAPIS, OCHRE, 0x2a2018, TURQ][Math.floor(r() * 4)], j: 0 }); },
  gatePosts(g, M, r, w) { for (const s of [1, -1]) g.box(1.2, 4, 1.4, { m: M, at: [s * (w / 2 + 0.6), 2, 0], c: WHITE, j: 0.02, taper: 0.9 }); g.box(w + 2.6, 0.7, 1.6, { m: M, at: [0, 4.1, 0], c: 0xe6dcc4 }); band(g, M, w + 2.6, 4.0, 0, 0.82); },
  crops(g, M, r, w, d, ripe) { for (let i = 0; i < Math.round(w / 1.1); i++) { const x = -w / 2 + (i + 0.5) * w / Math.round(w / 1.1); g.box(0.7, 0.08, d, { m: M, at: [x, 0.03, 0], c: 0x4a3a2a, j: 0.03 });
      for (let k = 0; k < Math.round(d / 0.5); k++) { const z = -d / 2 + (k + 0.5) * 0.5, h = 0.5 + r() * 0.3; g.cyl(0.02, 0.05, h, 3, { m: M, at: [x + (r() - 0.5) * 0.3, h / 2, z], c: ripe ? [0xd8b850, 0xe0c060][k % 2] : [0x6aa048, 0x7ab050][k % 2], sw: 0.6 }); } } },
  loomX(g, M) { g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [-0.9, 1.1, 0], c: WOOD }); g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [0.9, 1.1, 0], c: WOOD }); g.cyl(0.06, 0.06, 2, 6, { m: M, at: [0, 2.1, 0], rz: PI / 2, c: WOOD });
    g.box(1.6, 1.6, 0.03, { m: M, at: [0, 1.2, 0], c: (x, y) => (Math.floor((y + 2) * 8) % 2 ? LINEN : 0xe0d8c4) }); },
  dovecote(g, M) { g.lathe([[1.1, 0], [1.0, 2.2], [0.6, 3.4], [0.2, 3.9]], 10, { m: M, c: MUD, j: 0.04 }); for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; g.box(0.12, 0.12, 0.05, { m: M, at: [Math.cos(a) * 0.9, 2.6, Math.sin(a) * 0.9], ry: -a, c: 0x2a1810, j: 0 }); } },
};
function tentHeb(g, M, r, col) { G.env.tent(g, M, r, col); }

// ------------------------------------------------------------------ BUILD
function build(W, Game) {
  const r = rng(91); W.nodes = []; let nid = 0;
  const node = (type, x, z, s) => { if (waterDist(x, z) < 4 && type !== 'reeds') return; W.nodes.push({ id: 'n' + (nid++), type, x, y: W.heightAt(x, z), z, ry: r() * 6, s: s || (0.85 + r() * 0.3) }); };
  // roofed buildings you can walk into register their roof, so the camera knows to stay under the ceiling inside them
  const CANOPY = { oak: [3.6, 11.5, 6], olive: [1.8, 6, 3.5], fig: [1.6, 5.2, 3.6], acacia: [3, 6.2, 4.5], tamarisk: [2, 7, 3.2], datePalm: [8, 12.5, 3.5], palm: [8, 13, 3.5] };
  W.canopies = [];
  const ROOFED = { portico: a => [a[0], a[1], a[2] || 4], room: a => [a[0], a[1], a[2] || 3], cellRow: a => [a[0] * a[1], a[2], a[3] || 2.8], pavilion: a => [a[0], a[1], a[2] || 2.6] };
  const P = (fn, x, z, o) => {
    if (fn === 'egHouse' && o) { // v12: houses were one low storey; raise them to a proper two-storey height (model and collider together)
      o = Object.assign({}, o); if (o.args && o.args[0]) o.args = [Object.assign({}, o.args[0], { h: (o.args[0].h || 3) * 1.45 })]; if (o.col) o.col = Object.assign({}, o.col, { h: (o.col.h || 3) * 1.45 }); }
    // v18.8: on phones (GG.treeLod) the trees standing beside the roads are left out, and the forest is thinned by a third (trees were most of the world's triangles); trees near a story place (SPOTS / PADS) are kept.
    if (GG.treeLod && typeof fn === 'string' && CANOPY[fn] && !(o && o.keep)) {
      const road = roadD(x, z) < 11, thin = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 < 0.34;
      if ((road || thin) && !PADS.some(p => Math.hypot(x - p.x, z - p.z) < p.r + 12) && !Object.keys(SPOTS).some(k => { const q = SPOTS[k]; return Array.isArray(q) && Math.hypot(x - q[0], z - q[1]) < 12; })) { W.skippedTrees = (W.skippedTrees || 0) + 1; return { x, y: W.heightAt(x, z), z }; }
    }
    if (typeof fn === 'string') o = Object.assign({ kind: fn }, o || {}); // v16.1: lets W.place give it a default collider by name
    if (fn === 'palmRow' && (!o || o.col === undefined)) { const n = (o && o.args && o.args[0]) || 3, a = (o && o.ry) || 0; for (let i = 0; i < n; i++) W.addCol({ x: x + Math.cos(a) * i * 4, z: z - Math.sin(a) * i * 4, r: 0.32, h: 5 }); }
    const res = W.place(typeof fn === 'string' && ENVX[fn] ? ENVX[fn] : fn, x, z, o);
    if (typeof fn === 'string' && CANOPY[fn]) { const c = CANOPY[fn], k = (o && o.s) || 1; (W.canopies = W.canopies || []).push({ x, z, y0: res.y + c[0] * k, y1: res.y + c[1] * k, r: c[2] * k }); } // v15: tree crowns, so cutscene cameras keep out of them
    if (typeof fn === 'string' && ROOFED[fn] && W.addRoof) { const [w, d, h] = ROOFED[fn]((o && o.args) || []); W.addRoof({ x, z, w, d, a: (o && o.ry) || 0, y: res.y + h, k: fn }); }
    return res; };
  const wallL = (ax, az, bx, bz, h, kind) => { const L = Math.hypot(bx - ax, bz - az), a = -Math.atan2(bz - az, bx - ax); P(kind || 'egWall', (ax + bx) / 2, (az + bz) / 2, { ry: a, args: [L, h || 3], col: { w: L, d: 0.8, h: (h || 3) + 0.2, a, cam: true } }); };
  const ok = (x, z, m) => roadD(x, z) > (m || 4) && PADS.every(p => Math.hypot(x - p.x, z - p.z) > p.r + 2) && waterDist(x, z) > 5 && Math.max(Math.abs(x), Math.abs(z)) < 205 && Math.hypot(x - PIT.x, z - PIT.z) > 8;
  const tree = { r: 0.5, h: 3 };
  // ================= CANAAN
  // Hebron valley: the tents of Jacob
  P('tent', 168, 146, { ry: 0.25, s: 1.3, args: [0x3a302c], col: { w: 7.4, d: 4.8, h: 2.5, cam: true, a: 0.25 } });     // 야곱의 장막
  /* 요셉과 베냐민의 장막 (v16.9): you can walk in under the roof — the back and the sides are walls, the front is open — and
     Joseph's sleeping mat lies inside, so the story starts with him asleep under goat hair, not out on the bare ground */
  P('tent', 184, 158, { ry: -0.5, args: [0x4a3e38], col: null });
  { const ca = Math.cos(-0.5), sa = Math.sin(-0.5), at = (lx, lz) => [184 + ca * lx + sa * lz, 158 - sa * lx + ca * lz];
    for (const [lx, lz, w, d] of [[0, -1.72, 5.7, 0.3], [2.78, 0, 0.3, 3.5], [-2.78, 0, 0.3, 3.5]]) { const [x, z] = at(lx, lz); W.addCol({ x, z, w, d, a: -0.5, h: 2.2, cam: true }); }
    if (W.addRoof) W.addRoof({ x: 184, z: 158, w: 5.6, d: 3.6, a: -0.5, y: W.heightAt(184, 158) + 1.9 });
    const [mx, mz] = at(0.35, -0.55); P((g, M) => { g.box(1.95, 0.05, 0.95, { m: M, at: [0, 0.03, 0], c: (x, y, z) => Math.abs(z) > 0.36 || Math.abs(x) > 0.86 ? 0x8a3a2a : Math.floor((x + 1) * 5) % 2 ? 0xc8b08a : 0xb89a70 });
      g.box(1.7, 0.06, 0.6, { m: M, at: [0.05, 0.07, -0.05], c: 0x6a5a4a, j: 0.04 }); g.sph(0.2, 8, 6, { m: M, at: [0.78, 0.12, 0], s: [1, 0.45, 1.2], c: 0xd8c8a8 }); }, mx, mz, { ry: -0.5, col: null }); }
  P('tent', 163, 162, { ry: 0.9, args: [0x5a4636], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: 0.9 } });
  P('tent', 189, 141, { ry: -1.1, args: [0x3e342e], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: -1.1 } });
  P('campfire', 176, 153, { col: { r: 0.8, h: 0.5 } }); P('pots', 172, 156); P('sacks', 179, 147); P('pots', 186, 152);
  P('well', 160, 150, { col: { r: 1.7, h: 1 } }); P('fence', 192, 166.5, { args: [12] }); P('fence', 192, 175.5, { args: [12] }); P('fence', 186, 171, { ry: PI / 2, args: [9] }); P('fence', 198, 171, { ry: PI / 2, args: [9] });
  for (const [x, z] of [[156, 140], [196, 150], [165, 172], [190, 130]]) P('olive', x, z, { s: 1.1, col: tree });
  P('oak', 148, 156, { s: 1.5, col: tree }); // 마므레의 상수리나무 (창 35:27)
  P('crops', 160, 128, { args: [10, 6, true] }); P('crops', 196, 124, { args: [8, 6, true] });
  // road north: the fallen trunk across the dry wadi (jump!) between two rock shoulders
  P('logX', SPOTS.log[0], SPOTS.log[1], { ry: 0.05, col: { w: 7.4, d: 0.8, h: 0.62 } });
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) P('outcrop', SPOTS.log[0] + s * (5.8 + i * 2.2), SPOTS.log[1] + (r() - 0.5) * 2, { s: 0.9 + r() * 0.3, ry: r() * 6, col: { r: 1.9, h: 3 } });
  // rest stop under the oak
  P('oak', 190, 29, { s: 1.7, col: { r: 0.7, h: 3 } }); P('campfire', SPOTS.restOak[0], SPOTS.restOak[1], { col: { r: 0.8, h: 0.5 } }); P('straw', SPOTS.restBed[0], SPOTS.restBed[1], { ry: 0.4 }); P('rock', 182, 30, { col: { r: 0.9, h: 1 } });
  // Shechem fields: grazing land, the brothers' old camp
  P('campfire', SPOTS.clue1[0], SPOTS.clue1[1]); P('sacks', SPOTS.clue1[0] + 2, SPOTS.clue1[1] - 1.5); P('altar', SPOTS.clue3[0], SPOTS.clue3[1]);
  for (let i = 0; i < 8; i++) P('olive', 170 + (i % 4) * 9 + r() * 3, -40 - Math.floor(i / 4) * 9, { col: tree });
  // Dothan: the brothers' camp, cisterns
  P('campfire', 158, -150, { col: { r: 0.8, h: 0.5 } }); P('sacks', 154, -146); P('pots', 161, -154); P('tent', 151, -156, { ry: 0.6, args: [0x4a3e38], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: 0.6 } });
  P('pitWell', PIT.x, PIT.z, { y: PIT.floor }); W.markers.pit = PIT; if (W.addAvoid) W.addAvoid({ x: PIT.x, z: PIT.z, r: PIT.wall + 0.7, k: 'pit' }); // nobody strolls across the pit
  P('cistern', 146, -128); P('cistern', 178, -162); P('cistern', 140, -160);
  P('fence', 148, -170, { args: [14] }); P('fence', 148, -180, { args: [14] }); P('fence', 141, -175, { ry: PI / 2, args: [10] }); P('fence', 155, -175, { ry: PI / 2, args: [10] });
  // Gilead / caravan road: acacias
  for (let i = 0; i < 6; i++) P('acacia', 205 + i * 5, -146 + (r() - 0.5) * 12, { col: tree });
  // ================= DESERT
  P('campfire', SPOTS.caravanNight[0], SPOTS.caravanNight[1]); P('bales', SPOTS.caravanNight[0] + 3, SPOTS.caravanNight[1] - 2); P('camelSit', SPOTS.caravanNight[0] - 4, SPOTS.caravanNight[1] + 2, { ry: 0.8 }); P('camelSit', SPOTS.caravanNight[0] + 5, SPOTS.caravanNight[1] + 3, { ry: -1.2 });
  P('fort', 34, 78, { ry: 0.3, col: { w: 5, d: 5, h: 7, cam: true, a: 0.3 } });  // 애굽 국경의 망루
  // ================= EGYPT · market
  P('dais', SPOTS.block[0], SPOTS.block[1] - 2, { args: [4, 3, 0.9], col: { w: 4, d: 3, h: 0.9 } });
  [[2, 124, 0xb3472e], [-18, 124, 0x2c5aa0], [4, 110, 0x3e8a66], [-20, 110, 0xd9a73a]].forEach(([x, z, c], i) => P('stallM', x, z, { ry: i * 0.5 + 0.3, args: [c], col: { w: 2.6, d: 2.2, h: 2.2, a: i * 0.5 + 0.3 } }));
  P('palmRow', -24, 132, { args: [4] }); P('palmRow', 8, 132, { args: [3] }); P('jars', -2, 126, { args: [5] }); P('bales', -15, 106); P('camelSit', 10, 118, { ry: 2.4 }); P('camelSit', 13, 114, { ry: 2.0 });
  // ================= POTIPHAR'S HOUSE (captain of the guard)
  { const x0 = -50, x1 = -6, z0 = 36, z1 = 70, gx = -28;
    wallL(x0, z0, x1, z0); wallL(x0, z0, x0, z1); wallL(x1, z0, x1, 50.5); wallL(x1, 53.5, x1, z1); wallL(x0, z1, gx - 2, z1); wallL(gx + 2, z1, x1, z1);
    P('gatePosts', gx, z1, { args: [4] }); W.addCol({ x: gx - 2.6, z: z1, w: 1.2, d: 1.4, h: 4, cam: true }); W.addCol({ x: gx + 2.6, z: z1, w: 1.2, d: 1.4, h: 4, cam: true });
    P('portico', -28, 41.5, { args: [26, 9, 4.2, 7], col: null }); W.addCol({ x: -28, z: 37.2, w: 26, d: 0.7, h: 4.2, cam: true }); W.addCol({ x: -41, z: 41.5, w: 0.7, d: 9, h: 4.2, cam: true }); W.addCol({ x: -15, z: 41.5, w: 0.7, d: 9, h: 4.2, cam: true });
    for (let i = 0; i < 7; i++) W.addCol({ x: -28 - 13 + 1.2 + i * (26 - 2.4) / 6, z: 41.5 + 4.5 - 0.5, r: 0.38, h: 4 });
    P('seatEg', -28, 39.4, { args: [], col: { r: 0.45, h: 1 } }); P('tableEg', -22.5, 40.2, { col: { w: 1.8, d: 0.8, h: 0.9 } }); P('couch', -34.5, 39.6, { col: { w: 2, d: 0.8, h: 0.8 } }); P('jars', -38.5, 39, { args: [3] });
    P('pavilion', -45.5, 52, { args: [7, 15, 2.6] }); for (let i = 0; i < 4; i++) P('straw', -47.6, 46 + i * 3.4, { ry: PI / 2 });   // 종들의 숙소
    P('pavilion', -10.5, 45, { args: [6, 9, 2.6, 0xd0b888] }); P('oven', -10, 41.8, { col: { r: 0.8, h: 1.2 } }); P('quern', SPOTS.quern[0], SPOTS.quern[1], { ry: 0.3 }); P('jars', -8.4, 47.6, { ry: PI / 2, args: [3] }); P('tableEg', -11.5, 44.6, { ry: PI / 2 });  // 부엌
    P('well', SPOTS.well[0], SPOTS.well[1], { col: { r: 1.7, h: 1 } });
    P('pool', SPOTS.pool[0], SPOTS.pool[1], { args: [8, 5], col: { w: 8.8, d: 5.8, h: 0.4 } }); P('palmRow', -25, 63.5, { args: [3] }); P('datePalm', -13, 55); P('datePalm', -26, 54.5); P('flowers', -21, 61.5, { args: [0x8a6ad8] });
    P('room', SPOTS.store[0] - 0.5, SPOTS.store[1] + 0.5, { ry: -PI / 2, args: [8, 9, 3, 1.8] }); // 곳간 (문은 서쪽)
    { const sx = SPOTS.store[0] - 0.5, sz = SPOTS.store[1] + 0.5; W.addCol({ x: sx + 4.5, z: sz, w: 0.5, d: 8, h: 3, cam: true }); W.addCol({ x: sx, z: sz - 4, w: 9, d: 0.5, h: 3, cam: true }); W.addCol({ x: sx, z: sz + 4, w: 9, d: 0.5, h: 3, cam: true }); W.addCol({ x: sx - 4.5, z: sz - 2.45, w: 0.5, d: 3.1, h: 3 }); W.addCol({ x: sx - 4.5, z: sz + 2.45, w: 0.5, d: 3.1, h: 3 });
      const SH = [['wine', 3.4, -2.6, 0], ['oil', 3.4, 2.6, 0], ['grain', 0.6, -3.3, PI / 2], ['figs', 0.6, 3.3, -PI / 2]]; for (const [k, dx, dz, ry] of SH) P('shelves', sx + dx, sz + dz, { ry: ry + -PI / 2, args: [k] }); }
    P('loomX', SPOTS.loom[0], SPOTS.loom[1], { ry: PI / 2, col: { w: 2, d: 0.5, h: 2.2, a: PI / 2 } }); P('jars', -38, 67.5, { args: [3] }); P('dovecote', -47, 38.5);
    // fields and the cattle yard outside the east door
    P('fence', 9, 70.5, { args: [10] }); P('fence', 9, 81.5, { args: [10] }); P('fence', 4, 76, { ry: PI / 2, args: [11] }); P('fence', 14, 76, { ry: PI / 2, args: [11] });
    P('shaduf', 16, 52, { ry: -PI / 2 }); P('trough', 9, 72, { col: { w: 2.4, d: 0.8, h: 0.6 } }); }
  // ================= THE KING'S PRISON (in the house of the captain of the guard, 창 40:3)
  { const x0 = -45, x1 = -15, z0 = -10, z1 = 14, gx = -30;
    wallL(x0, z0, x1, z0, 3.4, 'mudWall'); wallL(x0, z0, x0, z1, 3.4, 'mudWall'); wallL(x1, z0, x1, z1, 3.4, 'mudWall'); wallL(x0, z1, gx - 1.6, z1, 3.4, 'mudWall'); wallL(gx + 1.6, z1, x1, z1, 3.4, 'mudWall');
    P('gatePosts', gx, z1, { args: [3.2] });
    P('cellRow', -32.75, -7.6, { args: [4, 5.5, 4.4, 2.8] }); W.addCol({ x: -32.75, z: -5.55, w: 22.2, d: 0.4, h: 2.8, cam: false });
    P('room', -18.4, -6.6, { args: [5.6, 6.2, 2.9, 1.3], col: null }); W.addCol({ x: -18.4, z: -9.7, w: 5.6, d: 0.5, h: 2.9, cam: true }); W.addCol({ x: -21.2, z: -6.6, w: 0.5, d: 6.2, h: 2.9, cam: true }); W.addCol({ x: -15.6, z: -6.6, w: 0.5, d: 6.2, h: 2.9, cam: true });
    W.addCol({ x: -20.25, z: -3.5, w: 2.3, d: 0.5, h: 2.9, cam: true }); W.addCol({ x: -16.55, z: -3.5, w: 2.3, d: 0.5, h: 2.9, cam: true });
    P('straw', -19.6, -8.2); P('egHouse', -20, 8.6, { ry: PI, args: [{ w: 6, d: 4.4, h: 2.8 }], col: { w: 6, d: 4.4, h: 3, a: PI, cam: true } });
    P('tableEg', SPOTS.yard[0] - 2, SPOTS.yard[1] + 4, { col: { w: 1.8, d: 0.8, h: 0.9 } }); P('well', SPOTS.basin[0], SPOTS.basin[1], { args: [{ r: 0.8, posts: false }], col: { r: 1.2, h: 1 } }); P('jars', -43, 12.5, { args: [3] }); P('brazier', -26, 9); P('brazier', -34, 9); }
  // ================= THE ROYAL CITY
  const city = [[-40, -60], [-30, -58], [-12, -58], [-2, -62], [-42, -72], [-6, -74], [-40, -86], [-30, -88], [-12, -88], [-2, -84], [-46, -98], [-34, -104]];
  city.forEach(([x, z], i) => P('egHouse', x, z, { ry: (i % 4) * PI / 2 + (r() - 0.5) * 0.1, args: [{ w: 6 + (i % 3), d: 5, h: 2.8 + (i % 2) * 1.2, awning: i % 3 === 0 ? OCHRE : null }], col: { w: 6 + (i % 3), d: 5, h: 3.4 + (i % 2) * 1.2, a: (i % 4) * PI / 2, cam: true } }));
  [[-26, -76, 0x8a3a5a], [-18, -76, 0x2c5aa0], [-26, -66, 0x3e8a66], [-18, -66, 0xd9a73a]].forEach(([x, z, c], i) => P('stallM', x, z, { ry: i * 0.4, args: [c], col: { w: 2.6, d: 2.2, h: 2.2, a: i * 0.4 } }));
  P('obelisk', -32, -71, { col: { r: 0.8, h: 8 } }); P('palmRow', -48, -114, { args: [5] });
  // temple of On (Heliopolis): Asenath's father Potiphera is its priest (창 41:45)
  P('obelisk', 5, -95, { col: { r: 0.8, h: 8 } }); P('obelisk', 19, -95, { col: { r: 0.8, h: 8 } }); P('portico', 12, -102, { args: [12, 6, 3.6, 4], col: { w: 12, d: 5, h: 4, cam: true } });
  // ================= PHARAOH'S PALACE
  { const x0 = -54, x1 = -6, z0 = -182, z1 = -142, gx = -30;
    wallL(x0, z0, x1, z0, 5); wallL(x0, z0, x0, z1, 5); wallL(x1, z0, x1, z1, 5); wallL(x0, z1, gx - 9.9, z1, 5); wallL(gx + 9.9, z1, x1, z1, 5);
    for (const s of [1, -1]) P('pylon', gx + s * 6.6, z1, { s: 0.55, col: { w: 6.6, d: 2.4, h: 6.2, cam: true } }); P('gatePosts', gx, z1, { args: [5] });
    for (const s of [1, -1]) P('obelisk', gx + s * 9.5, z1 + 4, { col: { r: 0.8, h: 8 } });
    for (let row = 0; row < 3; row++) for (const s of [1, -1]) { const x = gx + s * 7.5, z = -150 - row * 7; P('column', x, z, { args: [6.5], col: { r: 0.85, h: 7, cam: true } }); }
    for (const s of [1, -1]) P('pool', gx + s * 14, -152, { args: [6, 9], col: { w: 6.8, d: 9.8, h: 0.4 } });
    P('dais', gx, -176, { args: [10, 6, 1.1], col: { w: 10, d: 6, h: 1.1 } }); P('throne', gx, -177.4, { y: padH(gx, -176) + 1.1 }); P('brazier', gx - 6, -172); P('brazier', gx + 6, -172);
    P('hieroWall', gx, -181.3, { args: [46, 5] }); P('palmRow', -52, -158, { args: [3] }); }
  // the vizier's house
  P('egHouse', 10, -144, { args: [{ w: 12, d: 8, h: 4.2, awning: LAPIS }], col: { w: 12, d: 8, h: 4.4, cam: true } }); P('pool', 4, -134, { args: [5, 3], col: { w: 5.8, d: 3.8, h: 0.4 } }); P('palmRow', 14, -132, { args: [2] }); P('datePalm', -2, -139);
  // ================= WEST BANK & SOUTH: villages, fields, pyramids
  for (const [cx, cz] of [SPOTS.westVillage, SPOTS.southVillage]) { for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2 + 0.3, d = 11 + (i % 2) * 4; P('egHouse', cx + Math.cos(a) * d, cz + Math.sin(a) * d, { ry: -a + PI / 2, args: [{ w: 5, d: 4, h: 2.6 }], col: { w: 5, d: 4, h: 3, a: -a + PI / 2, cam: true } }); }
    P('well', cx, cz, { col: { r: 1.7, h: 1 } }); P('shaduf', cx + 18, cz + 4); P('dovecote', cx - 6, cz + 17); P('crops', cx + 22, cz - 10, { args: [12, 8, true] }); P('crops', cx - 24, cz + 6, { args: [10, 8, false] }); }
  P('pyramid', -205, -175, { args: [30] }); P('pyramid', -178, -214, { args: [22] }); P('pyramid', -216, -122, { args: [18] });
  // the Nile: papyrus, palms, boats; fields along the banks
  for (let z = -205; z < 205; z += 7) { const s = r() < 0.5 ? -1 : 1; node('reeds', nileX(z) + s * (9.5 + r() * 2.5), z); if (r() < 0.22) P('datePalm', nileX(z) + s * (18 + r() * 8), z + r() * 3, { col: tree }); }
  for (const [z, s] of [[-120, 1], [30, -1], [150, 1]]) P('felucca', nileX(z) + s * 3, z, { ry: 0.1, y: -0.3 });
  for (let i = 0; i < 26; i++) { const z = -190 + i * 15 + r() * 6, s = r() < 0.5 ? -1 : 1, x = nileX(z) + s * (26 + r() * 22); if (!ok(x, z, 6)) continue; P('crops', x, z, { ry: r() * 0.4, args: [8 + r() * 6, 6 + r() * 4, r() < 0.5] }); }
  // decorative trees, rocks and shrubs across the land
  // v17.0 포아송 디스크: evenly scattered with a minimum gap (closer in green Canaan and by the Nile, wide apart in the desert)
  const bigPts = G.poisson ? G.poisson(r, -205, -205, 205, 205, (x, z) => { const C = canaanK(x), F = fert(x, z); return 19 - 7 * Math.max(C, F); }, 11, 19) : [];
  for (const bp of bigPts) {
    const x = bp[0], z = bp[1]; if (!ok(x, z, 6)) continue; const C = canaanK(x), F = fert(x, z) * (1 - C), k = r(); let t;
    if (C > 0.5) t = k < 0.3 ? 'olive' : k < 0.5 ? 'oak' : k < 0.62 ? 'fig' : k < 0.8 ? 'bush' : k < 0.9 ? 'rock' : 'outcrop';
    else if (F > 0.5) t = k < 0.42 ? 'datePalm' : k < 0.6 ? 'palm' : k < 0.75 ? 'acacia' : k < 0.88 ? 'bush' : 'tamarisk';
    else t = k < 0.18 ? 'acacia' : k < 0.3 ? 'tamarisk' : k < 0.46 ? 'retama' : k < 0.66 ? 'outcrop' : 'rock';
    const big = ['oak', 'olive', 'acacia', 'tamarisk', 'fig', 'datePalm', 'palm'].includes(t);
    P(t, x, z, { ry: r() * 6, s: 0.8 + r() * 0.5, col: big ? tree : t === 'rock' ? { r: 1.1, h: 1.2 } : t === 'outcrop' ? { r: 1.8, h: 2 } : null });
  }
  const smallPts = G.poisson ? G.poisson(r, -200, -200, 200, 200, (x, z) => 13.5 - 4.5 * Math.max(canaanK(x), fert(x, z)), 9, 13.5) : []; // v17.0 포아송 디스크 (grass, flowers, shrubs)
  for (let i = 0; i < smallPts.length; i++) { const x = smallPts[i][0], z = smallPts[i][1]; if (!ok(x, z, 2.5)) continue; const C = canaanK(x), F = fert(x, z);
    if (C > 0.5) P(r() < 0.55 ? 'flowers' : r() < 0.7 ? 'dryGrass' : 'bush', x, z, { ry: r() * 6, s: 0.6 + r() * 0.5, detail: 1, args: [[0xd8343a, 0xf0e0f0, 0xe8c040, 0x8a6ad8][i % 4]] });
    else if (F > 0.4) P(r() < 0.6 ? 'dryGrass' : 'flowers', x, z, { ry: r() * 6, s: 0.6 + r() * 0.5, detail: 1, args: [[0xf0e0f0, 0xe8c040][i % 2]] });
    else P(r() < 0.8 ? 'dryGrass' : 'retama', x, z, { ry: r() * 6, s: 0.7 + r() * 0.6, detail: 1 }); }
  // gathering: a few sticks and stones in Canaan, figs and olives
  const around = (cx, cz, rr, n, types) => { for (let i = 0; i < n; i++) { const a = r() * 6.28, d = rr * (0.4 + r() * 0.6), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (roadD(x, z) < 2.5 || PADS.some(p => Math.hypot(x - p.x, z - p.z) < p.r * 0.75)) continue; node(types[i % types.length], x, z); } };
  around(176, 152, 38, 14, ['fig', 'olive', 'deadwood', 'rock']); around(188, -12, 30, 8, ['olive', 'fig', 'deadwood']);
  furnish(P, W);
}

// ------------------------------------------------------------------ LOOKS
const KID = o => Object.assign({ kid: true, skin: 0xe2ab7c, top: 0xd8c8a0, trim: 0x8a5a3a, hair: 0x2a1810, hairStyle: 'curly', belt: 0x6a4428, noPouch: true }, o);
const HEB = (o) => Object.assign({ skin: 0xd09868, hair: 0x2a1810, beard: 'short', beardCol: 0x2a1810, belt: 0x4a3022, legWrap: 0x8a7a5a }, o);
const EGM = (o) => Object.assign({ skin: 0xb07448, bare: true, kilt: true, kiltLong: true, bottom: LINEN, hair: 0x15100c, hairStyle: 'wig', barefoot: false, sandal: 0x8a6a40 }, o);
const EGF = (o) => Object.assign({ skin: 0xd8a070, fem: true, long: true, top: LINEN, under: LINEN, trim: 0xe8dcc0, hair: 0x15100c, hairStyle: 'wig', collar: TURQ, collar2: GOLD }, o);
const COAT = [0xb3472e, 0xe8dcc0, 0x2e4a78, 0xe0b040, 0x3e8a66, 0xe8dcc0, 0x8a3a8a, 0xd86a2a];   // 채색옷 (창 37:3)
const JO = { skin: 0xe2ab7c, hair: 0x2a1810, hairStyle: 'curly', eye: 0x5a3a20, build: 0.62, jaw: -0.25, browAng: 0.1, vary: false }; // v17.0: Joseph's face is hand-set (no per-NPC variation)
const LOOK = {
  // Joseph through the years
  // 채색옷 v12: a plain cream tunic, with the long striped coat worn open over it — three colours in vertical bands
  josephCoat: Object.assign({}, JO, { long: true, longSleeve: true, top: 0xeee4cc, bottom: 0xeee4cc, trim: 0xd8c49a, belt: 0x6a4428, mantle: 0x7a3a2e, mantleStripes: [0x7a3a2e, 0xa88a52, 0x40566e], mantleReps: 4, mantleTrim: 0x4a2820 }),
  josephPlain: Object.assign({}, JO, { top: 0xd8ccb0, trim: 0x8a7a5a, under: 0xd0c4a8, belt: 0x6a4428 }),
  josephSlave: Object.assign({}, JO, { top: 0xcfc0a0, sleeveless: true, skin: 0xd9a070, kilt: true, kiltLong: true, bottom: 0xcfc0a0, barefoot: true, build: 0.72 }),
  josephServant: Object.assign({}, JO, { top: LINEN, sleeveless: true, skin: 0xd09868, kilt: true, kiltLong: true, bottom: LINEN, collar: 0xb8a070, build: 0.82, hairStyle: 'short' }),
  josephSteward: Object.assign({}, JO, { skin: 0xd09868, top: LINEN, sleeveless: true, kilt: true, bottom: LINEN, collar: TURQ, collar2: GOLD, sash: GOLD, build: 0.85, hairStyle: 'short', bands: GOLD }),
  josephFled: Object.assign({}, JO, { top: LINEN, sleeveless: true, skin: 0xd09868, kilt: true, kiltLong: true, bottom: LINEN, build: 0.85, hairStyle: 'short' }),
  josephPrisoner: Object.assign({}, JO, { top: 0x9a8a6a, sleeveless: true, skin: 0xc89060, kilt: true, kiltLong: true, bottom: 0x9a8a6a, beard: 'short', beardCol: 0x2a1810, hairStyle: 'wild', build: 0.8, barefoot: true }),
  josephFettered: Object.assign({}, JO, { top: 0x9a8a6a, sleeveless: true, skin: 0xc89060, kilt: true, kiltLong: true, bottom: 0x9a8a6a, beard: 'short', beardCol: 0x2a1810, hairStyle: 'wild', build: 0.8, barefoot: true, gloves: 0x4a4440, legWrap: 0x4a4440, limp: true }),
  josephShaved: Object.assign({}, JO, { skin: 0xd09868, bare: true, kilt: true, bottom: LINEN, hairStyle: 'short', build: 0.9, jaw: 0 }),
  josephVizier: Object.assign({}, JO, { skin: 0xd09868, long: true, top: LINEN, under: LINEN, trim: GOLD, trim2: LAPIS, collar: GOLD, collar2: LAPIS, sash: GOLD, bands: GOLD, hairStyle: 'wig', hair: 0x15100c, build: 0.95, jaw: 0.05, sandal: GOLD }),
  // family in Canaan
  jacob: { skin: 0xd8a070, top: 0x8a4434, trim: 0x2e4a78, trim2: 0xd8c49a, under: 0xd8c49a, hair: 0xd8d0c4, hairStyle: 'short', beard: 'long', beardCol: 0xece6dc, mantle: 0x6a5a48, mantleTrim: 0x2e4a78,
    headwear: 'cloth', clothCol: 0xece4d0, clothStripe: 0x3a6aa0, bandCol: 0x5a3a24, belt: 0x5a3a24, legWrap: 0x8a7458, limp: true, age: 'old', eye: 0x6a3e22, browAng: -0.1, long: true },
  jacobMourn: { skin: 0xd8a070, top: 0x5a4e40, trim: 0x3a3228, hair: 0xd8d0c4, hairStyle: 'wild', beard: 'long', beardCol: 0xece6dc, belt: 0x3a3228, age: 'old', long: true, eye: 0x6a3e22, browAng: -0.45 },   // 굵은 베 (창 37:34)
  benjamin: KID({ top: 0xe0c8a0, trim: 0x3e8a66, sash: 0x3e8a66, hairStyle: 'curly', skin: 0xe8b48a }),
  reuben: HEB({ top: 0x9a5a3a, trim: 0x5a3a22, under: 0xd8c8a8, mantle: 0x6a5a40, mantleShort: true, hairStyle: 'short', beard: 'long', beardCol: 0x3a2414, browAng: -0.1, build: 1.1 }),
  simeon: HEB({ top: 0x6a5a48, trim: 0x2a2018, sleeveless: true, hairStyle: 'wild', browAng: 0.65, build: 1.25, wraps: 0x4a3426 }),
  levi: HEB({ top: 0x5a6a7a, trim: 0x2a3a4a, hairStyle: 'tied', browAng: 0.5, build: 1.1 }),
  judah: HEB({ top: 0xa8402e, trim: 0xe0b040, sash: 0xe0b040, hairStyle: 'tied', beard: 'long', browAng: 0.25, build: 1.3, bag: 0x6a4428 }),
  dan: HEB({ top: 0x8aa0b8, trim: 0x4a5a7a, headwear: 'band', bandCol: 0x4a5a7a, browAng: 0.3 }),
  naphtali: HEB({ top: 0xa0b888, trim: 0x5a6a3a, hairStyle: 'curly', browAng: 0.2, build: 0.9 }),
  gad: HEB({ top: 0xb89a6a, trim: 0x5a3a22, headwear: 'cloth', clothCol: 0xd8ccb0, bandCol: 0x5a3a22, browAng: 0.4 }),
  asher: HEB({ top: 0xe0c070, trim: 0x8a6a2a, hairStyle: 'short', browAng: 0.1 }),
  issachar: HEB({ top: 0x8a7a5a, trim: 0x4a3a2a, hairStyle: 'short', build: 1.35, browAng: 0.15 }),
  zebulun: HEB({ top: 0x7a9ab8, trim: 0x3a5a7a, headwear: 'cloth', clothCol: 0xe0d8c8, bandCol: 0x3a5a7a, browAng: 0.3 }),
  servantH: HEB({ top: 0xb8a888, trim: 0x6a4a30, headwear: 'cloth', clothCol: 0xd8ccb0, bandCol: 0x6a4a30, beard: 'short' }),
  leah: { skin: 0xe0b088, top: 0x98708e, long: true, trim: 0x5a3a5a, trim2: 0xe0c070, under: 0x98708e, hair: 0x6a5a50, hairStyle: 'bun', headwear: 'veil', clothCol: 0xd8c8a0, clothStripe: 0xa86a8a, age: 'old', browAng: -0.3 },
  dinah: { skin: 0xe2ab7c, top: 0xd88a9a, long: true, trim: 0xa84a5a, hair: 0x2a1810, hairStyle: 'long', headwear: 'veil', clothCol: 0xe8dcc0, clothStripe: 0xa84a5a, fem: true, sash: 0xe0b040 },
  man: { skin: 0xc8a080, top: 0xd8d0c0, long: true, trim: 0x8a7a60, under: 0xd8d0c0, hair: 0x3a3028, headwear: 'cloth', clothCol: 0xe8e4dc, bandCol: 0x8a7a60, mantle: 0xb8b0a0, beard: 'short', beardCol: 0x5a5048, browAng: 0.2, age: 'old' },
  ishmael: { skin: 0xa86e44, long: true, stripes: [0x8a7458, 0x8a7458, 0x3a2a1a, 0x8a7458, 0xc8a050, 0x8a7458], stripesB: [0x8a7458, 0x3a2a1a, 0x8a7458, 0x8a7458, 0xc8a050, 0x8a7458], beard: 'long', beardCol: 0x1a1410, hair: 0x1a1410, headwear: 'turban', clothCol: 0xf0e8d8, bandCol: 0x3a2a1a, sash: 0xb3472e, boots: 0x4a3426, browAng: 0.3 },
  midian: { skin: 0xb07848, long: true, stripes: [0xe8dcc0, 0x7a3b2a, 0xe8dcc0, 0xc8963a], stripesB: [0xe8dcc0, 0x7a3b2a, 0xe8dcc0, 0xe8dcc0, 0xc8963a], beard: 'short', hair: 0x2a1810, headwear: 'turban', clothCol: 0xd9a73a, bandCol: 0x7a3b2a, sash: 0x2c5aa0, smile: 0.6 },
  ishBoy: KID({ skin: 0xb07848, top: 0xc8b890, trim: 0x7a3b2a, headwear: 'cloth', clothCol: 0xf0e8d8, bandCol: 0x7a3b2a, hairStyle: 'short' }),
  // Egypt
  auctioneer: EGM({ skin: 0xa86a40, hairStyle: 'bald', beard: 'short', beardCol: 0x2a1810, collar: 0xb3472e, browAng: 0.4, build: 1.2 }),
  potiphar: EGM({ skin: 0xa86a40, top: 0xd8b878, sleeveless: true, bare: false, collar: GOLD, collar2: LAPIS, bands: GOLD, sash: OCHRE, build: 1.35, jaw: 0.6, browAng: 0.35, bottom: LINEN }),
  wife: EGF({ skin: 0xe0aa78, top: 0xf8f2e6, collar: GOLD, collar2: LAPIS, sash: 0xb3472e, headband: GOLD, smile: 0.2, browAng: 0.1, bust: 1.0 }),
  ameni: EGM({ skin: 0x9a6038, hairStyle: 'bald', age: 'old', bottom: 0xe0d4b8, hair: 0x9a9088, browAng: -0.2, smile: 0.5, build: 0.6 }),
  neb: EGM({ top: LINEN, sleeveless: true, bare: false, collar: TURQ, browAng: 0.45, narrow: true }),
  cook: EGM({ hairStyle: 'bald', build: 1.3, top: 0xe8dcc0, sleeveless: true, bare: false, sash: OCHRE, smile: 0.7 }),
  gardener: EGM({ hairStyle: 'short', skin: 0x9a6038, bottom: 0xd8c8a0, browAng: 0.1 }),
  cowboy: KID({ skin: 0xb07448, bare: true, kilt: true, bottom: LINEN, hairStyle: 'short', top: LINEN }),
  weaver: EGF({ skin: 0xc89060, top: 0xe8dcc0, collar: 0x8a6a48, collar2: 0, smile: 0.5 }),
  scribe: EGM({ hairStyle: 'bald', top: LINEN, bare: false, sleeveless: true, collar: 0xe0d0b0, build: 0.6, age: 'old', hair: 0xb8b0a8 }),
  official: EGM({ collar: GOLD, collar2: TURQ, bands: GOLD, top: LINEN, bare: false, sleeveless: true, long: true }),
  priest: EGM({ hairStyle: 'bald', top: LINEN, long: true, bare: false, collar: 0xe0d0b0, build: 0.8 }),
  soldierEg: EGM({ hairStyle: 'short', collar: 0x8a6a48, bottom: 0xd8c8a0, build: 1.2, browAng: 0.5, wraps: 0x6a4a30 }),
  maid: EGF({ skin: 0xb88050, top: 0xe0d4b8, collar: 0x8a6a48, collar2: 0, hairStyle: 'long' }),
  keeper: EGM({ skin: 0x9a6038, top: 0x6a4a30, bare: false, sleeveless: true, long: false, bottom: 0x8a6a48, hairStyle: 'short', beard: 'short', beardCol: 0x2a1810, build: 1.35, browAng: 0.55, jaw: 0.7 }),
  cupbearer: EGM({ top: LINEN, bare: false, long: true, collar: GOLD, collar2: TURQ, bands: GOLD, smile: 0.4 }),
  baker: EGM({ top: LINEN, bare: false, long: true, collar: 0xd8b878, build: 1.25, hairStyle: 'bald', browAng: -0.15 }),
  prisoner: EGM({ bottom: 0x9a8a6a, hairStyle: 'wild', beard: 'short', beardCol: 0x2a1810, skin: 0x9a6038 }),
  oldPrisoner: EGM({ bottom: 0x8a7a5a, hairStyle: 'wild', hair: 0xc8c0b8, beard: 'long', beardCol: 0xd8d0c8, age: 'old', skin: 0x9a6038 }),
  youngPrisoner: KID({ skin: 0xb07448, bare: true, kilt: true, bottom: 0x9a8a6a, hairStyle: 'wild', top: 0x9a8a6a }),
  pharaoh: EGM({ headwear: 'nemes', collar: GOLD, collar2: LAPIS, bands: GOLD, top: LINEN, bare: false, sleeveless: true, sash: GOLD, beard: 'short', beardCol: 0x15100c, build: 1.1, jaw: 0.3, browAng: 0.2, sandal: GOLD }),
  magician: EGM({ hairStyle: 'bald', top: LINEN, long: true, bare: false, collar: 0x2a1810, sash: 0x2a1810, browAng: 0.35, age: 'old', hair: 0xb8b0a8 }),
  messenger: EGM({ collar: TURQ, bands: GOLD, top: LINEN, bare: false, sleeveless: true, build: 1.0 }),
  asenath: EGF({ skin: 0xe0aa78, top: 0xf8f2e6, collar: GOLD, collar2: TURQ, sash: TURQ, headband: GOLD, smile: 0.55, browAng: 0.05 }),
  manasseh: KID({ skin: 0xd8a070, bare: true, kilt: true, bottom: LINEN, top: LINEN, hairStyle: 'short' }),
  ephraim: KID({ skin: 0xd8a070, bare: true, kilt: true, bottom: LINEN, top: LINEN, hairStyle: 'curly' }),
  farmer: EGM({ hairStyle: 'short', bottom: 0xd8c8a0, skin: 0x9a6038 }),
  farmerThin: EGM({ hairStyle: 'short', bottom: 0x9a8a6a, skin: 0x9a6038, build: 0.4 }),
  woman: EGF({ skin: 0xb88050, top: 0xe0d4b8, collar: 0x8a6a48, collar2: 0, hairStyle: 'long' }),
  elder: EGM({ hairStyle: 'short', hair: 0xd8d0c8, age: 'old', top: 0xe8dcc0, bare: false, long: true, beard: 'short', beardCol: 0xd8d0c8 }),
  sidon: { skin: 0xd0a070, long: true, top: 0x6a2a5a, trim: 0xe0b040, under: 0xe8dcc0, beard: 'long', beardCol: 0x2a1810, hair: 0x2a1810, headwear: 'cap', capCol: 0x6a2a5a, sash: 0xe0b040, browAng: 0.2 },
  edom: { skin: 0xc0805a, top: 0x8a3a2a, trim: 0x4a2a1a, hair: 0x8a3a1e, hairStyle: 'wild', beard: 'long', beardCol: 0x8a3a1e, goatskin: true, belt: 0x3a2618, boots: 0x5a3a24, browAng: 0.3 },
  canaanite: { skin: 0xc0885a, top: 0x8a7a60, bottom: 0x6a5a48, trim: 0x4a3a2a, beard: 'long', beardCol: 0x6a5a4a, hair: 0x4a3a2a, headwear: 'cloth', clothCol: 0xb8a888, bandCol: 0x3a2a1a, mantle: 0x5a4a38, legWrap: 0x7a6a50, bag: 0x5a3a24, age: 'old' },
};

// ------------------------------------------------------------------ v15 INTERIORS: the rooms you walk into are lived in
Object.assign(ENVX, {
  rugEg(g, M, r, w, d, c1, c2) { const A = c1 || OCHRE, B = c2 || LINEN; g.box(w, 0.025, d, { m: M, at: [0, 0.015, 0], c: (x, y, z) => { const bx = Math.abs(x) > w / 2 - 0.25 || Math.abs(z) > d / 2 - 0.25; return bx ? LAPIS : (Math.floor((x + w) * 1.6) % 3 === 0 ? A : B); }, j: 0 });
    for (const s of [1, -1]) for (let i = 0; i < Math.floor(d / 0.12); i++) g.box(0.12, 0.01, 0.03, { m: M, at: [s * (w / 2 + 0.05), 0.012, -d / 2 + 0.06 + i * 0.12], c: 0xe8dcc0, j: 0 }); },
  lampStand(g, M) { g.cyl(0.16, 0.2, 0.06, 8, { m: M, at: [0, 0.03, 0], c: 0x6a5030 }); g.cyl(0.03, 0.04, 1.35, 6, { m: M, at: [0, 0.7, 0], c: GOLD }); g.lathe([[0.04, 1.36], [0.16, 1.42], [0.19, 1.48]], 10, { m: M, c: 0xc0844a });
    g.sph(0.06, 6, 4, { m: M, at: [0.12, 1.53, 0], s: [0.8, 1.6, 0.8], c: 0xffc860, j: 0 }); g.sph(0.035, 5, 3, { m: M, at: [0.12, 1.58, 0], s: [0.8, 1.5, 0.8], c: 0xfff4c8, j: 0 }); },
  oilLamp(g, M) { g.lathe([[0.02, 0], [0.09, 0.03], [0.08, 0.06], [0.03, 0.07]], 8, { m: M, c: 0xb5673a }); g.box(0.08, 0.03, 0.05, { m: M, at: [0.1, 0.05, 0], c: 0xb5673a }); g.sph(0.03, 5, 3, { m: M, at: [0.14, 0.1, 0], s: [0.8, 1.6, 0.8], c: 0xffd070, j: 0 }); },
  potPlant(g, M, r, kind) { g.lathe([[0.16, 0], [0.26, 0.1], [0.3, 0.42], [0.33, 0.48]], 10, { m: M, c: 0xb5673a, j: 0.03 }); g.cyl(0.29, 0.29, 0.03, 10, { m: M, at: [0, 0.45, 0], c: 0x4a3420 });
    if (kind === 'papyrus') { for (let i = 0; i < 9; i++) { const a = i * 2.4, l = 1.1 + r() * 0.5, tx = Math.cos(a) * 0.18, tz = Math.sin(a) * 0.18; g.cyl(0.012, 0.018, l, 3, { m: M, at: [tx * 0.5, 0.45 + l / 2, tz * 0.5], rz: tx * 0.6, rx: -tz * 0.6, c: 0x5f8a3a, sw: 0.4 }); g.sph(0.13, 6, 3, { m: M, at: [tx * 1.4, 0.45 + l, tz * 1.4], s: [1, 0.45, 1], c: 0x7aa04a, sw: 0.7 }); } }
    else { g.cyl(0.04, 0.06, 1.1, 5, { m: M, at: [0, 1.0, 0], c: 0x7a5a3a }); for (let i = 0; i < 7; i++) { const a = i * PI * 2 / 7; g.box(0.16, 0.02, 0.85, { m: M, at: [Math.cos(a) * 0.36, 1.48, Math.sin(a) * 0.36], ry: -a + PI / 2, rx: 0.5, c: [0x4f7a32, 0x5f8a3a][i % 2], sw: 0.8 }); } } },
  chestEg(g, M) { g.box(0.9, 0.5, 0.55, { m: M, at: [0, 0.32, 0], c: 0x7a5232, j: 0.02 }); g.box(0.95, 0.1, 0.6, { m: M, at: [0, 0.6, 0], c: 0x6a4428 }); for (const s of [1, -1]) g.box(0.06, 0.08, 0.06, { m: M, at: [s * 0.4, 0.04, 0], c: 0x4a3020 });
    g.box(0.9, 0.08, 0.02, { m: M, at: [0, 0.45, 0.28], c: (x) => [LAPIS, GOLD, OCHRE][Math.floor((x + 1) * 6) % 3], j: 0 }); g.box(0.1, 0.1, 0.03, { m: M, at: [0, 0.5, 0.29], c: GOLD }); },
  senet(g, M) { g.box(1.1, 0.4, 0.5, { m: M, at: [0, 0.2, 0], c: 0x8a6440, j: 0.02 }); g.box(1.04, 0.03, 0.36, { m: M, at: [0, 0.415, 0], c: (x, y, z) => ((Math.floor((x + 0.52) / 0.104) + Math.floor((z + 0.18) / 0.12)) % 2 ? 0xe8d8b0 : 0xb89060), j: 0 });
    for (let i = 0; i < 5; i++) { g.cyl(0.03, 0.035, 0.07, 6, { m: M, at: [-0.46 + i * 0.21, 0.46, -0.12], c: 0x2a1a10 }); g.cyl(0.03, 0.035, 0.05, 6, { m: M, at: [-0.36 + i * 0.21, 0.45, 0.12], c: 0xf0e8d0 }); }
    for (let i = 0; i < 4; i++) g.box(0.12, 0.01, 0.02, { m: M, at: [0.42, 0.44, -0.15 + i * 0.05], c: i % 2 ? 0x3a2a1a : 0xf0e0c0 }); },
  stool(g, M) { g.box(0.42, 0.06, 0.36, { m: M, at: [0, 0.42, 0], c: 0x8a6440 }); for (const [x, z] of [[-0.16, -0.13], [0.16, -0.13], [-0.16, 0.13], [0.16, 0.13]]) g.cyl(0.025, 0.03, 0.4, 4, { m: M, at: [x, 0.2, z], rz: x * 0.6, c: 0x6a4a30 }); },
  banner(g, M, r, h, col) { h = h || 2.2; g.box(0.04, 0.04, 1.0, { m: M, at: [0, h + 0.4, 0], c: 0x6a4a30 }); g.box(0.015, h, 0.9, { m: M, at: [0.02, h / 2 + 0.4, 0], c: (x, y) => { const k = Math.floor((y + h) * 3.2) % 6; return k === 0 ? (col || LAPIS) : k === 3 ? OCHRE : LINEN; }, j: 0 }); },
  scribeDesk(g, M) { g.box(1.2, 0.06, 0.6, { m: M, at: [0, 0.48, 0], c: 0x8a6440 }); for (const [x, z] of [[-0.5, -0.22], [0.5, -0.22], [-0.5, 0.22], [0.5, 0.22]]) g.cyl(0.03, 0.03, 0.46, 4, { m: M, at: [x, 0.24, z], c: 0x6a4a30 });
    g.box(0.55, 0.005, 0.32, { m: M, at: [-0.15, 0.515, 0], c: 0xf0e4c0, j: 0 }); g.cyl(0.04, 0.04, 0.34, 8, { m: M, at: [-0.45, 0.55, 0], rx: PI / 2, c: 0xe8d8b0 }); g.cyl(0.04, 0.04, 0.34, 8, { m: M, at: [0.14, 0.55, 0], rx: PI / 2, c: 0xe8d8b0 });
    g.box(0.24, 0.02, 0.06, { m: M, at: [0.38, 0.52, 0.12], c: 0x9a7a4a }); g.cyl(0.018, 0.018, 0.01, 6, { m: M, at: [0.33, 0.535, 0.12], c: 0x101010 }); g.cyl(0.018, 0.018, 0.01, 6, { m: M, at: [0.42, 0.535, 0.12], c: 0xb02a1a });
    for (let i = 0; i < 3; i++) g.cyl(0.004, 0.004, 0.26, 3, { m: M, at: [0.38, 0.53, -0.08 + i * 0.03], rz: PI / 2, c: 0xc8b070 });
    for (let i = 0; i < 4; i++) g.cyl(0.035, 0.035, 0.36, 7, { m: M, at: [-0.7 - (i % 2) * 0.08, 0.05 + Math.floor(i / 2) * 0.07, -0.1 + i * 0.07], rz: PI / 2, c: 0xe0d0a8 }); },
  bedEg(g, M) { g.box(1.9, 0.08, 0.8, { m: M, at: [0, 0.38, 0], c: 0x7a5232 }); g.box(1.85, 0.1, 0.75, { m: M, at: [0, 0.46, 0], c: LINEN, j: 0.02 }); for (const [x, z] of [[-0.85, -0.32], [0.85, -0.32], [-0.85, 0.32], [0.85, 0.32]]) g.cyl(0.04, 0.05, 0.36, 5, { m: M, at: [x, 0.18, z], c: 0x5a3a24 });
    g.box(0.2, 0.06, 0.3, { m: M, at: [-0.75, 0.53, 0], c: 0x8a6440 }); g.cyl(0.11, 0.11, 0.3, 8, { m: M, at: [-0.75, 0.66, 0], rx: PI / 2, s: [1, 1, 0.6], c: 0x9a7448 }); g.box(1.0, 0.04, 0.78, { m: M, at: [0.4, 0.53, 0], c: (x) => Math.floor((x + 2) * 5) % 2 ? 0xb3472e : 0xd8c49a }); },
  blanket(g, M, r, c) { g.box(1.5, 0.05, 0.7, { m: M, at: [0.1, 0.13, 0], c: (x) => Math.floor((x + 2) * 4) % 3 === 0 ? (c || 0x8a3a2a) : 0xc8b490, j: 0.06 }); g.cyl(0.1, 0.1, 0.55, 6, { m: M, at: [-0.75, 0.16, 0], rx: PI / 2, c: 0xa89070 }); },
  loaves(g, M, r, n) { n = n || 5; for (let i = 0; i < n; i++) g.sph(0.1, 7, 4, { m: M, at: [(i - (n - 1) / 2) * 0.22, 0.04, (i % 2) * 0.12], s: [1.1, 0.5, 1.1], c: [0xc8904a, 0xb87a3a][i % 2], j: 0.03 });
    g.cyl(0.16, 0.12, 0.08, 10, { m: M, at: [0.5, 0.04, -0.12], c: 0xb5673a }); for (let i = 0; i < 6; i++) g.sph(0.04, 5, 3, { m: M, at: [0.45 + (i % 3) * 0.05, 0.1, -0.15 + Math.floor(i / 3) * 0.06], c: [0x6a3a5a, 0x5a2a4a][i % 2] }); },
  fruitBowl(g, M) { g.lathe([[0.02, 0], [0.18, 0.04], [0.24, 0.12]], 10, { m: M, c: 0x2f8a77 }); for (let i = 0; i < 7; i++) { const a = i * 0.9; g.sph(0.06, 6, 4, { m: M, at: [Math.cos(a) * 0.1, 0.12 + (i % 2) * 0.04, Math.sin(a) * 0.1], c: [0x6a3a5a, 0xd8a040, 0x8a2a2a, 0x7aa04a][i % 4] }); } },
  hangRack(g, M) { for (const s of [1, -1]) g.cyl(0.04, 0.05, 2.0, 5, { m: M, at: [s * 0.9, 1.0, 0], c: 0x6a4a30 }); g.cyl(0.03, 0.03, 2.0, 5, { m: M, at: [0, 1.95, 0], rz: PI / 2, c: 0x7a5a3a });
    for (let i = 0; i < 7; i++) { const x = -0.75 + i * 0.25; g.cyl(0.004, 0.004, 0.3, 3, { m: M, at: [x, 1.8, 0], c: 0xc8b070 }); if (i % 3 === 1) g.box(0.06, 0.35, 0.02, { m: M, at: [x, 1.5, 0], c: 0x9a9a8a });
      else for (let k = 0; k < 3; k++) g.sph(0.055, 5, 4, { m: M, at: [x + (k - 1) * 0.04, 1.62 - k * 0.07, 0.02], s: [1, 1.15, 1], c: i % 3 === 0 ? 0xd8b070 : 0xf0e8e0 }); } },
  baskets(g, M, r, n) { n = n || 3; for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 0.62; g.lathe([[0.2, 0], [0.28, 0.12], [0.29, 0.34]], 10, { m: M, at: [x, 0, (i % 2) * 0.2], c: (xx, y) => (Math.floor((y + 1) * 30) % 2 ? 0xc8a868 : 0xa8884a), j: 0.04 });
    g.sph(0.25, 8, 4, { m: M, at: [x, 0.3, (i % 2) * 0.2], s: [1, 0.3, 1], c: [0xe2cfa0, 0xd8b060, 0x6a4a6a][i % 3] }); } },
  woodStack(g, M, r) { for (let i = 0; i < 9; i++) g.cyl(0.06, 0.07, 0.9, 5, { m: M, at: [(i % 4) * 0.13 - 0.2 + Math.floor(i / 4) * 0.06, 0.06 + Math.floor(i / 4) * 0.11, 0], rx: PI / 2, ry: (r() - 0.5) * 0.2, c: [0x6a4a30, 0x7a5a3a][i % 2], j: 0.05 }); },
  jugBowl(g, M) { g.lathe([[0.05, 0], [0.13, 0.08], [0.14, 0.25], [0.07, 0.38], [0.06, 0.44], [0.08, 0.46]], 9, { m: M, c: 0xa86a42, j: 0.04 }); g.lathe([[0.02, 0], [0.12, 0.03], [0.14, 0.08]], 9, { m: M, at: [0.32, 0, 0.1], c: 0x8a5a3a }); g.sph(0.06, 5, 3, { m: M, at: [0.32, 0.05, 0.1], s: [1.4, 0.4, 1.4], c: 0xc89a5a }); },
  fan(g, M) { g.cyl(0.025, 0.03, 2.2, 5, { m: M, at: [0, 1.1, 0], c: GOLD }); for (let i = 0; i < 9; i++) { const a = (i - 4) * 0.17; g.box(0.07, 0.6, 0.015, { m: M, at: [Math.sin(a) * 0.32, 2.3 + Math.cos(a) * 0.25, 0], rz: -a, c: i % 2 ? 0xf4efe2 : 0xe8dcc0 }); } g.sph(0.06, 6, 4, { m: M, at: [0, 2.2, 0], c: LAPIS }); },
  offering(g, M) { ENVX.tableEg(g, M); for (let i = 0; i < 3; i++) g.sph(0.1, 7, 4, { m: M, at: [-0.55 + i * 0.22, 0.88, -0.1], s: [1.1, 0.5, 1.1], c: 0xc8904a }); g.lathe([[0.02, 0.84], [0.18, 0.88], [0.22, 0.96]], 10, { m: M, at: [0.2, 0, 0], c: 0x2f8a77 });
    for (let i = 0; i < 5; i++) g.sph(0.06, 6, 4, { m: M, at: [0.16 + (i % 3) * 0.06, 0.98, -0.05 + Math.floor(i / 3) * 0.08], c: [0xd8a040, 0x8a2a2a, 0x7aa04a][i % 3] });
    for (let i = 0; i < 3; i++) { g.cyl(0.008, 0.008, 0.4, 3, { m: M, at: [0.65, 1.0, -0.2 + i * 0.12], c: 0x5f8a3a }); g.sph(0.06, 6, 3, { m: M, at: [0.65, 1.22, -0.2 + i * 0.12], s: [1, 0.7, 1], c: [0xf0f0f8, 0x8aa0e0, 0xf0e0f0][i] }); }
    g.lathe([[0.03, 0.84], [0.09, 0.9], [0.1, 0.98]], 8, { m: M, at: [-0.7, 0, 0.2], c: 0x6a5a3a }); },
  ampRack(g, M) { g.box(1.8, 0.08, 0.5, { m: M, at: [0, 0.3, 0], c: 0x7a5a3a }); for (let i = 0; i < 4; i++) { g.lathe([[0.02, -0.3], [0.12, -0.15], [0.16, 0.2], [0.07, 0.42], [0.08, 0.5]], 9, { m: M, at: [-0.66 + i * 0.44, 0.62, 0], c: [0xc8865a, 0xb5673a][i % 2] }); } },
});
function furnish(P, W) {
  // Potiphar's great hall (the portico): rug, lamps, wall hangings, plants, a scribe's desk, a game of senet, a chest
  P('rugEg', -28, 41.4, { args: [8, 3.6] }); P('rugEg', -35.8, 42.4, { ry: PI / 2, args: [2.4, 3.2, TURQ, LINEN] });
  for (const x of [-31.6, -24.4, -39.4, -17.2]) P('lampStand', x, 38.6, { col: { r: 0.22, h: 1.6 } });
  for (const x of [-37.4, -30.8, -25.2, -19.2]) P('banner', x, 37.65, { ry: PI / 2, args: [2.3, x < -28 ? LAPIS : TURQ] });
  P('potPlant', -40.1, 44.6, { args: ['palm'], col: { r: 0.32, h: 1 } }); P('potPlant', -16, 44.6, { args: ['palm'], col: { r: 0.32, h: 1 } }); P('potPlant', -39.9, 38.4, { args: ['papyrus'] });
  P('scribeDesk', -36.6, 43.6, { ry: 0.2, col: { w: 1.2, d: 0.6, h: 0.6, a: 0.2 } }); P('stool', -36.4, 44.4);
  P('senet', -19.2, 42.8, { col: { w: 1.1, d: 0.5, h: 0.5 } }); P('stool', -19.2, 43.6); P('stool', -19.2, 42.0);
  P('chestEg', -40.2, 41, { ry: PI / 2, col: { w: 0.6, d: 0.9, h: 0.7 } }); P('fruitBowl', -22.5, 40.0, { dy: 0.84 }); P('oilLamp', -21.9, 40.4, { dy: 0.84 });
  // servants' quarters: bedding, a lamp, water and baskets
  [0x8a3a2a, 0x2c5aa0, 0x3e8a66, 0x7a3a6a].forEach((c, i) => P('blanket', -47.6, 46 + i * 3.4, { ry: PI / 2, args: [c] }));
  P('jugBowl', -43.4, 47.4); P('jugBowl', -43.4, 54.2, { ry: 1 }); P('lampStand', -43.2, 50.8, { col: { r: 0.22, h: 1.6 } }); P('baskets', -43.4, 58, { ry: PI / 2, args: [2] }); P('chestEg', -43.6, 44.6, { ry: -PI / 2 });
  // the kitchen: bread on the table, a drying rack, grain baskets, firewood by the oven
  P('loaves', -11.5, 44.6, { ry: PI / 2, dy: 0.84 }); P('hangRack', -7.9, 44.4, { ry: PI / 2, col: { w: 0.2, d: 2, h: 2, a: PI / 2 } });
  P('baskets', -12.9, 47.4, { args: [3] }); P('woodStack', -8.4, 41.4, { ry: 0.3 }); P('stool', -12.4, 44.6);
  // the storeroom (곳간): stacked sacks, an amphora rack and the steward's tally desk
  P('ampRack', -12.5, 66.6, { col: { w: 1.8, d: 0.5, h: 1.2 } }); P('sacks', -10.4, 64.2); P('scribeDesk', -14.4, 62.2, { ry: PI / 2 }); P('oilLamp', -14.4, 62.6, { dy: 0.52 });
  // Joseph's cell: a jug and bowl, a lamp on a ledge, a blanket on the straw
  P('jugBowl', -16.4, -8.9, { ry: 2 }); P('oilLamp', -20.7, -9.2, { dy: 0.02 }); P('blanket', -19.6, -8.2, { args: [0x6a5a4a] });
  // the other cells: straw and a water jug in each
  for (let i = 0; i < 4; i++) { const cx = -32.75 - 11 + (i + 0.5) * 5.5; P('straw', cx - 1.5, -8.7, { ry: PI / 2 + 0.2 }); P('jugBowl', cx + 1.7, -9.1, { ry: i }); }
  // Pharaoh's hall: a long runner to the throne, lamps, papyrus in pots, feather fans by the throne
  P('rugEg', -30, -160, { ry: PI / 2, args: [24, 2.4, OCHRE, LINEN] });
  for (let i = 0; i < 4; i++) for (const s of [1, -1]) P('lampStand', -30 + s * 3.2, -150 - i * 6, { col: { r: 0.22, h: 1.6 } });
  for (const s of [1, -1]) { P('potPlant', -30 + s * 5.6, -171.6, { args: ['papyrus'], col: { r: 0.32, h: 1 } }); P('fan', -30 + s * 1.6, -178.2, { y: padH(-30, -176) + 1.1 }); P('offering', -30 + s * 3.6, -175.2, { ry: PI / 2, y: padH(-30, -176) + 1.1 }); }
  // the temple of On: an offering table, lamps and papyrus
  P('offering', 12, -103.6, { col: { w: 1.8, d: 0.8, h: 0.9 } }); P('lampStand', 9.4, -104, { col: { r: 0.22, h: 1.6 } }); P('lampStand', 14.6, -104, { col: { r: 0.22, h: 1.6 } }); P('potPlant', 7.2, -100.4, { args: ['papyrus'] }); P('potPlant', 16.8, -100.4, { args: ['papyrus'] });
}
