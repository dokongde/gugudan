'use strict';
/* 모험 길 풍경: 섬마다 배경색 + 길 양옆 그림 + 노드를 잇는 오솔길 */

const SCENE_ART = {
  // 숲속 섬
  pine: '<path d="M32 4 50 30H41l13 18H10l13-18h-9z" fill="#3aa070"/><path d="M32 4 50 30H41l13 18H32z" fill="#2f8a5f"/><rect x="28" y="48" width="8" height="12" rx="2" fill="#a8744f"/>',
  apple: '<rect x="29" y="36" width="6" height="24" rx="3" fill="#a8744f"/><circle cx="32" cy="26" r="20" fill="#5cbf7f"/><circle cx="24" cy="21" r="10" fill="#7dd197"/><circle cx="41" cy="31" r="3.2" fill="#ff7a59"/><circle cx="25" cy="35" r="3.2" fill="#ff7a59"/><circle cx="36" cy="16" r="3.2" fill="#ff7a59"/>',
  euca: '<path d="M32 62V22" stroke="#cdbba6" stroke-width="5" stroke-linecap="round"/><path d="M32 36 22 27M32 28l10-9" stroke="#cdbba6" stroke-width="3" stroke-linecap="round"/><ellipse cx="19" cy="23" rx="11" ry="7" fill="#7fbfa5"/><ellipse cx="45" cy="16" rx="12" ry="8" fill="#6aae94"/><ellipse cx="31" cy="11" rx="10" ry="7" fill="#8fd0b3"/>',
  bush: '<circle cx="20" cy="44" r="12" fill="#4fb377"/><circle cx="34" cy="37" r="15" fill="#5cbf7f"/><circle cx="47" cy="45" r="10" fill="#4fb377"/><rect x="8" y="45" width="50" height="11" rx="5.5" fill="#4fb377"/><circle cx="30" cy="34" r="2.5" fill="#ffc94a"/><circle cx="42" cy="42" r="2.5" fill="#ff9fb2"/>',
  mushroom: '<path d="M12 35a20 18 0 0 1 40 0z" fill="#ff7a59"/><circle cx="24" cy="26" r="3.5" fill="#fff"/><circle cx="38" cy="22" r="3" fill="#fff"/><circle cx="44" cy="30" r="2.5" fill="#fff"/><rect x="25" y="35" width="14" height="19" rx="6" fill="#f6ead8"/>',
  flower: '<path d="M32 60V34" stroke="#4fb377" stroke-width="3" stroke-linecap="round"/><path d="M32 50c-9-1-12-6-13-11 8 0 12 4 13 11z" fill="#5cbf7f"/><g fill="#ff9fb2"><circle cx="32" cy="18" r="6"/><circle cx="41" cy="25" r="6"/><circle cx="37" cy="35" r="6"/><circle cx="27" cy="35" r="6"/><circle cx="23" cy="25" r="6"/></g><circle cx="32" cy="27" r="5" fill="#ffc94a"/>',
  grass: '<path d="M20 58c-1-12-4-19-9-24 9 4 14 12 15 24zM29 58c0-14 1-23 3-30 3 8 4 18 4 30zM39 58c2-11 6-18 13-22-5 6-7 14-7 22z" fill="#6cc48c"/>',
  // 사탕 섬
  lolli: '<rect x="30" y="36" width="4" height="25" rx="2" fill="#f1e2cf"/><circle cx="32" cy="24" r="16" fill="#ff8fb1"/><path d="M32 24m-9 0a9 9 0 1 1 9 9 5.5 5.5 0 1 1-5.5-5.5" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>',
  cane: '<path d="M38 60V23a8 8 0 0 0-16 0" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M38 60V23a8 8 0 0 0-16 0" stroke="#ff6b6b" stroke-width="8" fill="none" stroke-dasharray="5 6"/>',
  cupcake: '<path d="M16 34h32l-4 24H20z" fill="#6cc0e8"/><path d="M22 34l2 24M32 34v24M42 34l-2 24" stroke="#4fa7d4" stroke-width="2"/><path d="M14 35c0-8 5-11 9-11 1-6 5-9 9-9s8 3 9 9c4 0 9 3 9 11z" fill="#ffc2d4"/><circle cx="32" cy="12" r="4.5" fill="#ff6b6b"/>',
  gumdrop: '<path d="M14 54c0-22 8-34 18-34s18 12 18 34z" fill="#a78bfa"/><g fill="#fff" opacity=".7"><circle cx="24" cy="38" r="1.6"/><circle cx="33" cy="30" r="1.6"/><circle cx="40" cy="42" r="1.6"/><circle cx="29" cy="47" r="1.6"/></g>',
  donut: '<circle cx="32" cy="34" r="20" fill="#e9b87a"/><path d="M14 32c0-11 8-18 18-18s18 7 18 18c-3 4-6 1-9 4s-6 0-9 2-6-1-9 0-6 2-9-6z" fill="#ff8fb1"/><circle cx="32" cy="32" r="6.5" fill="#fff1ea"/><g stroke-width="2.6" stroke-linecap="round"><path d="M22 22l3 1" stroke="#ffc94a"/><path d="M40 21l2 2" stroke="#6cc0e8"/><path d="M44 30l1 3" stroke="#fff"/><path d="M20 30l2-2" stroke="#6cc0e8"/></g>',
  icecream: '<path d="M22 32h20L32 60z" fill="#e9b87a"/><path d="M24 36l14 6M26 44l9 4" stroke="#d29a57" stroke-width="2"/><circle cx="26" cy="27" r="9" fill="#ffe08a"/><circle cx="38" cy="27" r="9" fill="#ffb3c8"/><circle cx="32" cy="17" r="9" fill="#bfe9d2"/>',
  // 바다 섬
  fish: '<path d="M12 32c6-10 16-14 26-10l12-8v36l-12-8c-10 4-20 0-26-10z" fill="#ff9a5a"/><path d="M38 22c3 6 3 14 0 20" stroke="#ffb98a" stroke-width="3" fill="none"/><circle cx="21" cy="30" r="2.6" fill="#1f2a26"/>',
  fish2: '<path d="M14 32c5-8 13-11 21-8l10-7v30l-10-7c-8 3-16 0-21-8z" fill="#ffc94a"/><path d="M26 24v16M32 23v18" stroke="#ffe08a" stroke-width="3"/><circle cx="21" cy="30" r="2.4" fill="#1f2a26"/>',
  shell: '<path d="M32 54 10 30c4-12 13-18 22-18s18 6 22 18z" fill="#ffc8b4"/><path d="M32 54 18 22M32 54V14M32 54l14-32M32 54 11 31M32 54l21-23" stroke="#f2a58c" stroke-width="2"/><rect x="26" y="50" width="12" height="7" rx="3" fill="#f2a58c"/>',
  starfish: '<path d="M32 8c3 0 4 9 6 13s11 3 12 6-7 7-8 11 3 12 0 14-9-5-10-5-8 7-10 5 1-10 0-14-9-8-8-11 10-2 12-6 3-13 6-13z" fill="#ffb04a"/><g fill="#ffd68a"><circle cx="32" cy="22" r="1.8"/><circle cx="32" cy="32" r="2"/><circle cx="24" cy="30" r="1.6"/><circle cx="40" cy="30" r="1.6"/></g>',
  seaweed: '<path d="M22 60c-6-8 6-14 0-22s4-14-2-22" stroke="#3fb58f" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M38 60c6-8-6-12 0-20s-4-12 2-18" stroke="#5cc8a1" stroke-width="6" fill="none" stroke-linecap="round"/>',
  bubbles: '<g fill="none" stroke="#8cc8ee" stroke-width="3"><circle cx="24" cy="44" r="9"/><circle cx="40" cy="26" r="6"/><circle cx="30" cy="12" r="4"/></g><circle cx="21" cy="41" r="2" fill="#fff"/>',
  coral: '<path d="M32 60V36M32 44 20 30M20 30v-10M20 30l-6-4M32 40l12-12M44 28V16M44 28l7-3M32 36V20" stroke="#ff7a8a" stroke-width="6" fill="none" stroke-linecap="round"/>',
  // 별빛 섬 (밤하늘)
  star: '<path d="M32 6l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 23l16-2z" fill="#ffd96a"/>',
  moon: '<path d="M40 8a24 24 0 1 0 16 38A20 20 0 0 1 40 8z" fill="#ffe39a"/><circle cx="26" cy="38" r="3" fill="#f5cf6e"/><circle cx="34" cy="48" r="2" fill="#f5cf6e"/>',
  planet: '<circle cx="32" cy="32" r="15" fill="#ff9d7a"/><path d="M20 26c6 2 18 2 24 0M19 36c8 2 18 2 26 0" stroke="#ffb89c" stroke-width="3"/><ellipse cx="32" cy="34" rx="28" ry="7" fill="none" stroke="#ffd1bf" stroke-width="3.5" transform="rotate(-14 32 34)"/>',
  sparkle: '<path d="M32 8c2 14 10 22 24 24-14 2-22 10-24 24-2-14-10-22-24-24 14-2 22-10 24-24z" fill="#fff" opacity=".9"/>',
  rocket: '<path d="M32 4c9 8 12 20 9 34H23c-3-14 0-26 9-34z" fill="#f4f5ff"/><circle cx="32" cy="22" r="5" fill="#6cc0e8" stroke="#c9d0f5" stroke-width="2"/><path d="M23 30l-8 12 9-2zM41 30l8 12-9-2z" fill="#ff7a59"/><path d="M26 40c1 8 3 12 6 16 3-4 5-8 6-16z" fill="#ffc94a"/>',
  ncloud: '<path d="M14 44h36a9 9 0 0 0 0-18 13 13 0 0 0-25-3 10 10 0 0 0-11 21z" fill="#4b5096"/>',
};
const SCENE_SETS = [
  ['pine', 'apple', 'euca', 'bush', 'mushroom', 'flower', 'grass', 'pine', 'euca'],
  ['lolli', 'cane', 'cupcake', 'gumdrop', 'donut', 'icecream'],
  ['fish', 'fish2', 'shell', 'starfish', 'seaweed', 'bubbles', 'coral'],
  ['star', 'moon', 'planet', 'sparkle', 'rocket', 'ncloud', 'star', 'sparkle'],
];
const sceneSVG = name => `<svg viewBox="0 0 64 64" aria-hidden="true">${SCENE_ART[name]}</svg>`;

// 매번 같은 자리에 그려지도록 고정 시드 난수
function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// 섬 하나에 풍경과 오솔길을 그린다 (화면에 붙은 뒤 크기를 재서 배치)
function decorateZone(zone) {
  const ii = +zone.dataset.island;
  const deco = zone.querySelector('.deco'), trail = zone.querySelector('.trail');
  const W = zone.clientWidth, H = zone.clientHeight;
  const zr = zone.getBoundingClientRect();
  const rnd = seeded(ii * 7919 + 13);
  const set = SCENE_SETS[ii];

  // 오솔길: 노드 중심을 부드러운 곡선으로 잇는다 (지나온 길은 진하게)
  const nodes = [...zone.querySelectorAll('.node')];
  const pts = nodes.map(b => {
    const r = b.getBoundingClientRect();
    return { x: r.left - zr.left + r.width / 2, y: r.top - zr.top + r.height / 2, done: b.classList.contains('done') };
  });
  let paths = '';
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], my = (a.y + b.y) / 2;
    paths += `<path class="${a.done ? 'walked' : ''}" d="M${a.x} ${a.y}C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}"/>`;
  }
  trail.setAttribute('viewBox', `0 0 ${W} ${H}`);
  trail.innerHTML = paths;

  // 풍경: 그 높이에 있는 노드·이름표·코알라를 피해서 빈 쪽에만 배치
  const boxes = [...zone.querySelectorAll('.node-wrap, .tlabel')].map(el => {
    const r = el.getBoundingClientRect();
    let left = r.left - zr.left, right = r.right - zr.left;
    const k = el.querySelector('.mini-uni');
    if (k) { const kr = k.getBoundingClientRect(); left = Math.min(left, kr.left - zr.left); right = Math.max(right, kr.right - zr.left); }
    return { top: r.top - zr.top - 10, bottom: r.bottom - zr.top + 30, left: left - 16, right: right + 16 };
  });
  const top = zone.querySelector('.path').offsetTop + 10;
  const wide = W > 600;
  let html = '', y = top, k = Math.floor(rnd() * set.length);
  while (y < H - 70) {
    for (const side of ['left', 'right']) {
      const per = wide ? 2 : 1;
      for (let j = 0; j < per; j++) {
        if (rnd() < 0.2) continue;
        const size = Math.round(wide ? 58 + rnd() * 42 : 44 + rnd() * 16);
        const ty = y + Math.round(rnd() * 46);
        const near = boxes.filter(b => b.bottom > ty && b.top < ty + size);
        const free = side === 'left'
          ? Math.min(W, ...near.map(b => b.left))
          : W - Math.max(0, ...near.map(b => b.right));
        if (free < size * 0.75) continue;          // 자리가 없으면 건너뜀
        const slot = free / per;
        const x = slot >= size ? Math.round(j * slot + rnd() * (slot - size)) : (j ? -1 : Math.round(free - size));
        if (x < -size * 0.25) continue;
        const rot = Math.round(rnd() * 16 - 8);
        const name = set[k++ % set.length];
        html += `<div class="d" style="${side}:${x}px;top:${ty}px;width:${size}px;height:${size}px;transform:rotate(${rot}deg)">${sceneSVG(name)}</div>`;
      }
    }
    y += Math.round((wide ? 100 : 80) + rnd() * 50);
  }
  // 밤하늘에는 작은 별을 흩뿌린다
  if (ii === 3) {
    for (let i = 0; i < 26; i++) {
      html += `<i class="tw" style="left:${Math.round(rnd() * W)}px;top:${Math.round(top + rnd() * (H - top))}px;animation-delay:${(rnd() * 3).toFixed(2)}s"></i>`;
    }
  }
  deco.innerHTML = html;
}
function decorateZones() { document.querySelectorAll('.zone').forEach(decorateZone); }
let sceneTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(sceneTimer);
  sceneTimer = setTimeout(() => { if (document.querySelector('.zone')) decorateZones(); }, 150);
});
