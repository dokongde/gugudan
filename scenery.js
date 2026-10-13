'use strict';
/* 모험 길 풍경: 섬마다 한 장의 그림(땅·개울·길·숲)을 그려서 노드 뒤에 깐다.
   노드 위치를 잰 뒤 길을 노드 중심으로 지나가게 그리고, 길을 피해 나무를 빽빽하게 심는다.
   스크롤이 가볍도록 SVG를 이미지 한 장으로 만들어 쓴다. */

function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const f1 = n => Math.round(n * 10) / 10;

// ---------- 그림 조각 (x,y = 땅에 닿는 점, s = 크기) ----------
const shadow = (x, y, s, a = 0.13) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(s * 0.6)}" ry="${f1(s * 0.16)}" fill="#000" opacity="${a}"/>`;
const FOREST_GREENS = [['#3f9e62', '#5cbf7f'], ['#4aab6c', '#6fcb8d'], ['#2f8a55', '#4fb072'], ['#58b56f', '#7fd393']];
const ART = {
  // 숲
  tree(x, y, s, r) {
    const [c, h] = FOREST_GREENS[Math.floor(r() * FOREST_GREENS.length)];
    return shadow(x, y, s) +
      `<rect x="${f1(x - s * 0.07)}" y="${f1(y - s * 0.6)}" width="${f1(s * 0.14)}" height="${f1(s * 0.6)}" rx="${f1(s * 0.05)}" fill="#9a6b45"/>` +
      `<circle cx="${f1(x - s * 0.27)}" cy="${f1(y - s * 0.62)}" r="${f1(s * 0.33)}" fill="${c}"/>` +
      `<circle cx="${f1(x + s * 0.28)}" cy="${f1(y - s * 0.66)}" r="${f1(s * 0.35)}" fill="${c}"/>` +
      `<circle cx="${f1(x)}" cy="${f1(y - s * 0.9)}" r="${f1(s * 0.45)}" fill="${c}"/>` +
      `<circle cx="${f1(x - s * 0.13)}" cy="${f1(y - s * 1.02)}" r="${f1(s * 0.22)}" fill="${h}"/>` +
      (r() < 0.25 ? `<circle cx="${f1(x + s * 0.2)}" cy="${f1(y - s * 0.75)}" r="${f1(s * 0.06)}" fill="#ff7a59"/><circle cx="${f1(x - s * 0.25)}" cy="${f1(y - s * 0.58)}" r="${f1(s * 0.06)}" fill="#ff7a59"/>` : '');
  },
  pine(x, y, s, r) {
    const c = r() < 0.5 ? '#2f7f57' : '#3a8f63', d = '#276d4a';
    const tri = (top, w, base) => `<path d="M${f1(x)} ${f1(top)}L${f1(x + w)} ${f1(base)}H${f1(x - w)}Z" fill="${c}"/><path d="M${f1(x)} ${f1(top)}L${f1(x + w)} ${f1(base)}H${f1(x)}Z" fill="${d}"/>`;
    return shadow(x, y, s * 0.8) +
      `<rect x="${f1(x - s * 0.06)}" y="${f1(y - s * 0.3)}" width="${f1(s * 0.12)}" height="${f1(s * 0.3)}" fill="#8a5d3b"/>` +
      tri(y - s * 1.05, s * 0.42, y - s * 0.25) + tri(y - s * 1.45, s * 0.32, y - s * 0.7);
  },
  bush(x, y, s, r) {
    const [c, h] = FOREST_GREENS[Math.floor(r() * FOREST_GREENS.length)];
    return shadow(x, y, s * 0.9, 0.1) +
      `<circle cx="${f1(x - s * 0.25)}" cy="${f1(y - s * 0.22)}" r="${f1(s * 0.25)}" fill="${c}"/><circle cx="${f1(x + s * 0.25)}" cy="${f1(y - s * 0.2)}" r="${f1(s * 0.23)}" fill="${c}"/>` +
      `<circle cx="${f1(x)}" cy="${f1(y - s * 0.34)}" r="${f1(s * 0.3)}" fill="${c}"/><circle cx="${f1(x - s * 0.08)}" cy="${f1(y - s * 0.44)}" r="${f1(s * 0.13)}" fill="${h}"/>`;
  },
  flowers(x, y, s, r) {
    const cols = ['#ff9fb2', '#ffd96a', '#ffffff', '#c7a8ff'];
    let o = '';
    for (let i = 0; i < 3; i++) {
      const dx = (r() - 0.5) * s, dy = (r() - 0.5) * s * 0.5;
      o += `<circle cx="${f1(x + dx)}" cy="${f1(y + dy)}" r="${f1(s * 0.13)}" fill="${cols[Math.floor(r() * cols.length)]}"/><circle cx="${f1(x + dx)}" cy="${f1(y + dy)}" r="${f1(s * 0.05)}" fill="#f2a516"/>`;
    }
    return o;
  },
  grass(x, y, s) {
    return `<path d="M${f1(x - s * 0.3)} ${f1(y)}q-${f1(s * 0.05)}-${f1(s * 0.5)}-${f1(s * 0.25)}-${f1(s * 0.7)}q${f1(s * 0.35)} ${f1(s * 0.2)} ${f1(s * 0.4)} ${f1(s * 0.7)}zM${f1(x)} ${f1(y)}q0-${f1(s * 0.6)} ${f1(s * 0.08)}-${f1(s * 0.9)}q${f1(s * 0.15)} ${f1(s * 0.4)} ${f1(s * 0.12)} ${f1(s * 0.9)}zM${f1(x + s * 0.25)} ${f1(y)}q${f1(s * 0.1)}-${f1(s * 0.45)} ${f1(s * 0.4)}-${f1(s * 0.6)}q-${f1(s * 0.2)} ${f1(s * 0.25)}-${f1(s * 0.2)} ${f1(s * 0.6)}z" fill="#5fae6e"/>`;
  },
  rock(x, y, s) {
    return `<ellipse cx="${f1(x)}" cy="${f1(y - s * 0.2)}" rx="${f1(s * 0.5)}" ry="${f1(s * 0.32)}" fill="#a9b1b5"/><ellipse cx="${f1(x - s * 0.12)}" cy="${f1(y - s * 0.3)}" rx="${f1(s * 0.22)}" ry="${f1(s * 0.12)}" fill="#c9d0d3"/>`;
  },
  mushroom(x, y, s) {
    return `<rect x="${f1(x - s * 0.12)}" y="${f1(y - s * 0.45)}" width="${f1(s * 0.24)}" height="${f1(s * 0.45)}" rx="${f1(s * 0.1)}" fill="#f6ead8"/><path d="M${f1(x - s * 0.42)} ${f1(y - s * 0.4)}a${f1(s * 0.42)} ${f1(s * 0.38)} 0 0 1 ${f1(s * 0.84)} 0z" fill="#ff7a59"/><circle cx="${f1(x - s * 0.12)}" cy="${f1(y - s * 0.58)}" r="${f1(s * 0.07)}" fill="#fff"/><circle cx="${f1(x + s * 0.15)}" cy="${f1(y - s * 0.52)}" r="${f1(s * 0.06)}" fill="#fff"/>`;
  },
  // 사탕
  lolli(x, y, s, r) {
    const c = ['#ff8fb1', '#ffb36b', '#a78bfa', '#6cc0e8'][Math.floor(r() * 4)];
    return shadow(x, y, s * 0.6, 0.1) + `<rect x="${f1(x - s * 0.05)}" y="${f1(y - s * 0.75)}" width="${f1(s * 0.1)}" height="${f1(s * 0.75)}" rx="${f1(s * 0.05)}" fill="#fff4e6"/>` +
      `<circle cx="${f1(x)}" cy="${f1(y - s * 1.0)}" r="${f1(s * 0.38)}" fill="${c}"/>` +
      `<path d="M${f1(x)} ${f1(y - s)}m-${f1(s * 0.22)} 0a${f1(s * 0.22)} ${f1(s * 0.22)} 0 1 1 ${f1(s * 0.22)} ${f1(s * 0.22)}a${f1(s * 0.13)} ${f1(s * 0.13)} 0 1 1-${f1(s * 0.13)}-${f1(s * 0.13)}" stroke="#fff" stroke-width="${f1(s * 0.07)}" fill="none" stroke-linecap="round"/>`;
  },
  cane(x, y, s) {
    const d = `M${f1(x + s * 0.15)} ${f1(y)}V${f1(y - s * 0.9)}a${f1(s * 0.17)} ${f1(s * 0.17)} 0 0 0-${f1(s * 0.34)} 0`;
    return shadow(x, y, s * 0.5, 0.1) + `<path d="${d}" stroke="#fff" stroke-width="${f1(s * 0.15)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#ff6b6b" stroke-width="${f1(s * 0.15)}" fill="none" stroke-dasharray="${f1(s * 0.1)} ${f1(s * 0.12)}"/>`;
  },
  gumdrop(x, y, s, r) {
    const c = ['#a78bfa', '#7fd1ab', '#ff8fb1', '#ffc94a'][Math.floor(r() * 4)];
    return shadow(x, y, s * 0.8, 0.1) + `<path d="M${f1(x - s * 0.4)} ${f1(y)}c0-${f1(s * 0.5)} ${f1(s * 0.18)}-${f1(s * 0.7)} ${f1(s * 0.4)}-${f1(s * 0.7)}s${f1(s * 0.4)} ${f1(s * 0.2)} ${f1(s * 0.4)} ${f1(s * 0.7)}z" fill="${c}"/><circle cx="${f1(x - s * 0.12)}" cy="${f1(y - s * 0.45)}" r="${f1(s * 0.06)}" fill="#fff" opacity=".7"/>`;
  },
  cupcake(x, y, s) {
    return shadow(x, y, s * 0.7, 0.1) + `<path d="M${f1(x - s * 0.3)} ${f1(y - s * 0.45)}h${f1(s * 0.6)}l-${f1(s * 0.08)} ${f1(s * 0.45)}h-${f1(s * 0.44)}z" fill="#6cc0e8"/><path d="M${f1(x - s * 0.34)} ${f1(y - s * 0.44)}c0-${f1(s * 0.2)} ${f1(s * 0.12)}-${f1(s * 0.28)} ${f1(s * 0.2)}-${f1(s * 0.28)}c0-${f1(s * 0.14)} ${f1(s * 0.08)}-${f1(s * 0.24)} ${f1(s * 0.14)}-${f1(s * 0.24)}s${f1(s * 0.14)} ${f1(s * 0.1)} ${f1(s * 0.14)} ${f1(s * 0.24)}c${f1(s * 0.1)} 0 ${f1(s * 0.2)} ${f1(s * 0.08)} ${f1(s * 0.2)} ${f1(s * 0.28)}z" fill="#ffc2d4"/><circle cx="${f1(x)}" cy="${f1(y - s * 0.98)}" r="${f1(s * 0.08)}" fill="#ff5b5b"/>`;
  },
  sprinkles(x, y, s, r) {
    const cols = ['#ff6b6b', '#ffd96a', '#6cc0e8', '#7fd1ab', '#ffffff'];
    let o = '';
    for (let i = 0; i < 4; i++) {
      const a = r() * 180, px = x + (r() - 0.5) * s, py = y + (r() - 0.5) * s * 0.6;
      o += `<rect x="${f1(px)}" y="${f1(py)}" width="${f1(s * 0.22)}" height="${f1(s * 0.07)}" rx="${f1(s * 0.035)}" fill="${cols[Math.floor(r() * cols.length)]}" transform="rotate(${Math.round(a)} ${f1(px)} ${f1(py)})"/>`;
    }
    return o;
  },
  // 바다
  palm(x, y, s, r) {
    const lean = (r() < 0.5 ? -1 : 1) * s * 0.25;
    const tx = x + lean, ty = y - s * 1.1;
    let leaves = '';
    for (const a of [-160, -120, -60, -20, 200]) {
      leaves += `<ellipse cx="${f1(tx + Math.cos(a * Math.PI / 180) * s * 0.28)}" cy="${f1(ty + Math.sin(a * Math.PI / 180) * s * 0.18)}" rx="${f1(s * 0.32)}" ry="${f1(s * 0.1)}" fill="${a > 0 && a < 180 ? '#3f9e62' : '#4fb072'}" transform="rotate(${a < -90 || a > 90 ? a + 180 : a} ${f1(tx + Math.cos(a * Math.PI / 180) * s * 0.28)} ${f1(ty + Math.sin(a * Math.PI / 180) * s * 0.18)})"/>`;
    }
    return shadow(x, y, s * 0.6, 0.12) + `<path d="M${f1(x)} ${f1(y)}Q${f1(x)} ${f1(y - s * 0.6)} ${f1(tx)} ${f1(ty)}" stroke="#b5835a" stroke-width="${f1(s * 0.11)}" fill="none" stroke-linecap="round"/>` +
      leaves + `<circle cx="${f1(tx - s * 0.05)}" cy="${f1(ty + s * 0.06)}" r="${f1(s * 0.06)}" fill="#8a5d3b"/><circle cx="${f1(tx + s * 0.06)}" cy="${f1(ty + s * 0.07)}" r="${f1(s * 0.06)}" fill="#8a5d3b"/>`;
  },
  wave(x, y, s) {
    return `<path d="M${f1(x - s * 0.5)} ${f1(y)}q${f1(s * 0.25)}-${f1(s * 0.22)} ${f1(s * 0.5)} 0t${f1(s * 0.5)} 0" stroke="#e8f6fd" stroke-width="${f1(Math.max(2.5, s * 0.08))}" fill="none" stroke-linecap="round" opacity=".9"/>`;
  },
  fish(x, y, s, r) {
    const c = r() < 0.5 ? '#ff9a5a' : '#ffc94a', dir = r() < 0.5 ? 1 : -1;
    return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${dir} 1)"><path d="M${f1(-s * 0.4)} 0c${f1(s * 0.2)}-${f1(s * 0.3)} ${f1(s * 0.5)}-${f1(s * 0.3)} ${f1(s * 0.65)} 0l${f1(s * 0.25)}-${f1(s * 0.18)}v${f1(s * 0.36)}l-${f1(s * 0.25)}-${f1(s * 0.18)}c-${f1(s * 0.15)} ${f1(s * 0.3)}-${f1(s * 0.45)} ${f1(s * 0.3)}-${f1(s * 0.65)} 0z" fill="${c}"/><circle cx="${f1(-s * 0.22)}" cy="${f1(-s * 0.04)}" r="${f1(s * 0.05)}" fill="#1f2a26"/></g>`;
  },
  srock(x, y, s) {
    return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(s * 0.62)}" ry="${f1(s * 0.2)}" fill="#e8f6fd" opacity=".8"/>` + `<path d="M${f1(x - s * 0.5)} ${f1(y)}q${f1(s * 0.1)}-${f1(s * 0.55)} ${f1(s * 0.45)}-${f1(s * 0.5)}q${f1(s * 0.45)}-${f1(s * 0.05)} ${f1(s * 0.55)} ${f1(s * 0.5)}z" fill="#8f9aa6"/><path d="M${f1(x - s * 0.2)} ${f1(y - s * 0.35)}q${f1(s * 0.15)}-${f1(s * 0.12)} ${f1(s * 0.3)}-${f1(s * 0.05)}" stroke="#b6c0c9" stroke-width="${f1(s * 0.07)}" fill="none" stroke-linecap="round"/>`;
  },
  coral(x, y, s) {
    return `<path d="M${f1(x)} ${f1(y)}V${f1(y - s * 0.5)}M${f1(x)} ${f1(y - s * 0.3)}l-${f1(s * 0.25)}-${f1(s * 0.25)}v-${f1(s * 0.15)}M${f1(x)} ${f1(y - s * 0.25)}l${f1(s * 0.25)}-${f1(s * 0.2)}v-${f1(s * 0.2)}" stroke="#ff7a8a" stroke-width="${f1(s * 0.13)}" fill="none" stroke-linecap="round"/>`;
  },
  boat(x, y, s) {
    return `<path d="M${f1(x - s * 0.5)} ${f1(y - s * 0.2)}h${f1(s)}l-${f1(s * 0.15)} ${f1(s * 0.22)}h-${f1(s * 0.7)}z" fill="#ff7a59"/><path d="M${f1(x)} ${f1(y - s * 0.22)}V${f1(y - s * 0.95)}" stroke="#8a5d3b" stroke-width="${f1(s * 0.05)}"/><path d="M${f1(x + s * 0.03)} ${f1(y - s * 0.9)}l${f1(s * 0.38)} ${f1(s * 0.6)}h-${f1(s * 0.38)}z" fill="#fff"/><path d="M${f1(x - s * 0.62)} ${f1(y + s * 0.04)}q${f1(s * 0.31)}-${f1(s * 0.1)} ${f1(s * 0.62)} 0t${f1(s * 0.62)} 0" stroke="#e8f6fd" stroke-width="${f1(s * 0.06)}" fill="none" stroke-linecap="round"/>`;
  },
  // 밤하늘
  cloud(x, y, s, r) {
    const c = r() < 0.5 ? '#3d4287' : '#464c96', h = '#5258a6';
    return `<circle cx="${f1(x - s * 0.3)}" cy="${f1(y - s * 0.22)}" r="${f1(s * 0.28)}" fill="${c}"/><circle cx="${f1(x + s * 0.3)}" cy="${f1(y - s * 0.2)}" r="${f1(s * 0.26)}" fill="${c}"/><circle cx="${f1(x)}" cy="${f1(y - s * 0.38)}" r="${f1(s * 0.36)}" fill="${c}"/><rect x="${f1(x - s * 0.58)}" y="${f1(y - s * 0.24)}" width="${f1(s * 1.16)}" height="${f1(s * 0.24)}" rx="${f1(s * 0.12)}" fill="${c}"/><circle cx="${f1(x - s * 0.08)}" cy="${f1(y - s * 0.52)}" r="${f1(s * 0.14)}" fill="${h}"/>`;
  },
  star(x, y, s, r) {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s * 0.2 : s * 0.48; pts.push(`${f1(x + Math.cos(a) * rr)},${f1(y + Math.sin(a) * rr)}`); }
    return `<polygon points="${pts.join(' ')}" fill="${r() < 0.7 ? '#ffd96a' : '#fff3c4'}" stroke="${r() < 0.7 ? '#ffd96a' : '#fff3c4'}" stroke-width="${f1(s * 0.08)}" stroke-linejoin="round"/>`;
  },
  dot(x, y, s, r) { return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s * 0.08)}" fill="#fff" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`; },
  planet(x, y, s) {
    return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s * 0.3)}" fill="#ff9d7a"/><ellipse cx="${f1(x)}" cy="${f1(y + s * 0.03)}" rx="${f1(s * 0.55)}" ry="${f1(s * 0.13)}" fill="none" stroke="#ffd1bf" stroke-width="${f1(s * 0.06)}" transform="rotate(-14 ${f1(x)} ${f1(y)})"/>`;
  },
  moon(x, y, s) {
    return `<path d="M${f1(x + s * 0.1)} ${f1(y - s * 0.45)}a${f1(s * 0.45)} ${f1(s * 0.45)} 0 1 0 ${f1(s * 0.35)} ${f1(s * 0.75)}a${f1(s * 0.36)} ${f1(s * 0.36)} 0 0 1-${f1(s * 0.35)}-${f1(s * 0.75)}z" fill="#ffe39a"/>`;
  },
};

// ---------- 섬별 테마 ----------
const TALL = new Set(['tree', 'pine', 'bush', 'lolli', 'cane', 'cupcake', 'gumdrop', 'cloud', 'srock', 'boat']);
const THEMES = [
  { // 숲속 섬
    patches: ['#cbe7b9', '#b7dca2'], road: { w: 54, edge: '#c99a63', fill: '#ecca93', line: '#f8e2b8', walked: '#f6d89f' },
    stream: { edge: '#6bb8e3', fill: '#9dd8f5', shine: '#d6f0fc' },
    near: [['flowers', 12, 18], ['grass', 14, 20], ['rock', 12, 18], ['mushroom', 14, 18], ['grass', 14, 20], ['flowers', 12, 18]],
    far: [['tree', 40, 62], ['tree', 40, 62], ['pine', 40, 60], ['tree', 36, 56], ['bush', 30, 44], ['pine', 42, 62]],
    step: 30, fillP: 0.92,
  },
  { // 사탕 섬
    patches: ['#ffe7ee', '#ffd6e3'], road: { w: 54, edge: '#e88aa8', fill: '#fff6f9', line: '#ffd1de', walked: '#ffe9f0' },
    stream: { edge: '#7a4428', fill: '#9b5d3a', shine: '#b97a52' },
    near: [['sprinkles', 16, 22], ['sprinkles', 16, 22], ['gumdrop', 14, 20]],
    far: [['lolli', 40, 60], ['gumdrop', 30, 46], ['cane', 38, 54], ['cupcake', 34, 48], ['lolli', 40, 60]],
    step: 46, fillP: 0.6,
  },
  { // 바다 섬
    patches: ['#b9e1f7', '#a5d6f2'], road: { w: 70, edge: '#ffffff', fill: '#f6dfb2', line: '#fbecc9', walked: '#f9e6bd', foam: true },
    near: [['wave', 22, 32], ['srock', 22, 30]],
    far: [['wave', 26, 40], ['wave', 26, 40], ['fish', 26, 34], ['srock', 30, 42], ['coral', 26, 34], ['wave', 26, 40]],
    rare: ['boat', 54, 64], edgeItem: ['palm', 48, 62],
    step: 44, fillP: 0.55,
  },
  { // 별빛 섬
    patches: ['#2c3068', '#262a5c'], road: { w: 54, edge: 'rgba(255,255,255,.10)', fill: '#565ca8', line: '#ffd96a', walked: '#6a70bd', glow: true },
    near: [['cloud', 44, 62], ['cloud', 40, 56]],
    far: [['dot', 18, 24], ['star', 14, 22], ['dot', 18, 24], ['dot', 18, 24], ['star', 10, 16], ['cloud', 40, 60]],
    rare: ['planet', 46, 60], rare2: ['moon', 40, 52],
    step: 38, fillP: 0.6,
  },
];

// ---------- 배치 ----------
function decorateZone(zone) {
  const ii = +zone.dataset.island, T = THEMES[ii];
  const deco = zone.querySelector('.deco');
  const W = zone.clientWidth, H = zone.clientHeight;
  if (!W || !H) return;
  const zr = zone.getBoundingClientRect();
  const rnd = seeded(ii * 7919 + 13);
  const R = T.road.w;

  // 길: 노드 중심을 지나는 곡선
  const nodes = [...zone.querySelectorAll('.node')];
  const pts = nodes.map(b => {
    const r = b.getBoundingClientRect();
    return { x: r.left - zr.left + r.width / 2, y: r.top - zr.top + r.height / 2, done: b.classList.contains('done') };
  });
  const top = zone.querySelector('.path').offsetTop - 6;
  if (!pts.length) return;
  const all = [{ x: pts[0].x, y: top, done: pts[0].done }, ...pts, { x: pts[pts.length - 1].x, y: H + 20, done: false }];
  let roadD = '', walkedD = '';
  const samples = [];
  for (let i = 1; i < all.length; i++) {
    const a = all[i - 1], b = all[i], my = (a.y + b.y) / 2;
    const seg = `M${f1(a.x)} ${f1(a.y)}C${f1(a.x)} ${f1(my)} ${f1(b.x)} ${f1(my)} ${f1(b.x)} ${f1(b.y)}`;
    roadD += seg;
    if (a.done && b.done) walkedD += seg;
    for (let t = 0; t <= 1; t += 0.05) {
      const u = 1 - t;
      samples.push({
        x: u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x,
        y: u * u * u * a.y + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * b.y,
      });
    }
  }
  const distRoad = (x, y) => {
    let m = 1e9;
    for (const p of samples) { if (Math.abs(p.y - y) > 140) continue; const d = Math.hypot(p.x - x, p.y - y); if (d < m) m = d; }
    return m;
  };
  const roadXAt = y => { let best = samples[0]; for (const p of samples) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p; return best.x; };

  // 코알라 자리는 비워 둔다
  const holes = [...zone.querySelectorAll('.mini-uni')].map(k => { const r = k.getBoundingClientRect(); return { x: r.left - zr.left + r.width / 2, y: r.top - zr.top + r.height / 2, r: r.width * 0.65 }; });

  let o = '';
  // 1) 땅 무늬
  for (let i = 0; i < Math.round(W * H / 26000); i++) {
    o += `<ellipse cx="${f1(rnd() * W)}" cy="${f1(top + rnd() * (H - top))}" rx="${f1(60 + rnd() * 120)}" ry="${f1(30 + rnd() * 50)}" fill="${T.patches[i % 2]}" opacity=".55"/>`;
  }
  // 2) 개울 (단과 단 사이, 숲/사탕 섬)
  const streams = [];
  if (T.stream) {
    [...zone.querySelectorAll('.tlabel')].slice(1).forEach(l => {
      const r = l.getBoundingClientRect(); streams.push(r.top - zr.top + r.height / 2);
    });
    streams.forEach(sy => {
      let d = `M-20 ${f1(sy)}`;
      for (let x = -20; x < W + 40; x += 80) d += `q20 ${f1(-10 - rnd() * 6)} 40 0t40 0`;
      o += `<path d="${d}" stroke="${T.stream.edge}" stroke-width="44" fill="none"/><path d="${d}" stroke="${T.stream.fill}" stroke-width="34" fill="none"/>`;
      for (let x = 10; x < W; x += 70 + rnd() * 50) o += `<path d="M${f1(x)} ${f1(sy - 4 + rnd() * 8)}h${f1(14 + rnd() * 14)}" stroke="${T.stream.shine}" stroke-width="3" stroke-linecap="round"/>`;
    });
  }
  // 3) 길
  if (T.road.glow) o += `<path d="${roadD}" stroke="rgba(160,170,255,.12)" stroke-width="${R + 34}" fill="none" stroke-linecap="round"/>`;
  o += `<path d="${roadD}" stroke="${T.road.edge}" stroke-width="${R + (T.road.foam ? 16 : 8)}" fill="none" stroke-linecap="round"/>`;
  o += `<path d="${roadD}" stroke="${T.road.fill}" stroke-width="${R}" fill="none" stroke-linecap="round"/>`;
  if (walkedD) o += `<path d="${walkedD}" stroke="${T.road.walked}" stroke-width="${R - 14}" fill="none" stroke-linecap="round"/>`;
  o += `<path d="${roadD}" stroke="${T.road.line}" stroke-width="${T.road.glow ? 5 : 4}" fill="none" stroke-linecap="round" stroke-dasharray="${T.road.glow ? '1 22' : '10 16'}"/>`;
  // 4) 다리
  streams.forEach(sy => {
    const x = roadXAt(sy), bw = R + 22;
    o += `<rect x="${f1(x - bw / 2)}" y="${f1(sy - 24)}" width="${f1(bw)}" height="48" rx="6" fill="#b98352"/>`;
    for (let k = 0; k < 6; k++) o += `<path d="M${f1(x - bw / 2 + 3)} ${f1(sy - 20 + k * 8)}h${f1(bw - 6)}" stroke="#9a6b45" stroke-width="2"/>`;
    o += `<rect x="${f1(x - bw / 2 - 5)}" y="${f1(sy - 28)}" width="7" height="56" rx="3.5" fill="#8a5d3b"/><rect x="${f1(x + bw / 2 - 2)}" y="${f1(sy - 28)}" width="7" height="56" rx="3.5" fill="#8a5d3b"/>`;
  });
  // 5) 숲(또는 사탕·바다·구름)을 빽빽하게: 아래쪽이 앞에 오도록 y 순서로 그린다
  const items = [];
  const pick = list => list[Math.floor(rnd() * list.length)];
  const step = T.step;
  for (let gy = top - 10; gy < H + 20; gy += step * 0.8) {
    for (let gx = -10; gx < W + 10; gx += step) {
      const x = gx + (rnd() - 0.5) * step * 0.9, y = gy + (rnd() - 0.5) * step * 0.7;
      if (holes.some(h => Math.hypot(h.x - x, h.y - y) < h.r)) continue;
      if (streams.some(sy => Math.abs(sy - y) < 30)) continue;
      const d = distRoad(x, y);
      if (d < R / 2 + 6) continue;
      if (d < R / 2 + 26) {
        if (rnd() < 0.45) { const [n, a, b] = pick(T.near), s = a + rnd() * (b - a); if (!TALL.has(n) || distRoad(x, y - s * 0.6) > R / 2 + s * 0.45) items.push({ n, x, y, s }); }
        continue;
      }
      if (rnd() > T.fillP) continue;
      let spec = pick(T.far);
      if (T.rare && rnd() < 0.025) spec = T.rare;
      if (T.rare2 && rnd() < 0.015) spec = T.rare2;
      const [n, a, b] = spec, s = a + rnd() * (b - a);
      if (d < R / 2 + s * 0.3 + 4) continue;
      if (TALL.has(n) && distRoad(x, y - s * 0.8) < R / 2 + s * 0.5 + 2) continue;   // 나무 윗부분이 길을 덮지 않게
      items.push({ n, x, y, s });
    }
  }
  // 바다: 모래길 가장자리에 야자수
  if (T.edgeItem) {
    for (let i = 3; i < samples.length; i += 9) {
      const p = samples[i], side = (i / 9) % 2 < 1 ? -1 : 1;
      const x = p.x + side * (R / 2 - 4), y = p.y + 10;
      if (holes.some(h => Math.hypot(h.x - x, h.y - y) < h.r + 20) || y < top + 30) continue;
      const [n, a, b] = T.edgeItem;
      items.push({ n, x, y, s: a + rnd() * (b - a) });
    }
  }
  items.sort((p, q) => p.y - q.y).forEach(it => { o += ART[it.n](it.x, it.y, it.s, rnd); });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${o}</svg>`;
  const old = deco.dataset.url;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  deco.dataset.url = url;
  deco.innerHTML = `<img src="${url}" alt="" draggable="false">`;
  if (old) setTimeout(() => URL.revokeObjectURL(old), 1000);
}
function decorateZones() { document.querySelectorAll('.zone').forEach(decorateZone); }
let sceneTimer = null, sceneW = window.innerWidth;
window.addEventListener('resize', () => {
  if (window.innerWidth === sceneW) return;     // 주소창 등 높이 변화는 무시
  sceneW = window.innerWidth;
  clearTimeout(sceneTimer);
  sceneTimer = setTimeout(() => { if (document.querySelector('.zone')) decorateZones(); }, 150);
});
