'use strict';
/* 연산 나라 — 덧셈·뺄셈·나눗셈·섞기 (수의 범위 100까지).
   구구단과 같은 레슨 엔진을 쓰고, 문제는 기술(skill)마다 만들어 낸다.
   실력은 문제 하나하나가 아니라 기술마다 최근 12번의 답으로 판단한다. */

const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const OPSYM = { x: '×', '+': '+', '-': '−', '÷': '÷' };

// ---------- 섬 ----------
const CALC_ISLANDS = [
  { name: '덧셈 섬', icon: 'plus', theme: 0, color: '#2fa77a', shade: '#23845f', soft: '#e3f3ea', sub: '몇십 · 받아올림',
    skills: ['a3', 'a4', 'a5'], stickers: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍇', '🍏', '🥥', '🍈', '🥭', '🥝', '🍍'] },
  { name: '뺄셈 섬', icon: 'minus', theme: 1, color: '#ff7a59', shade: '#dc5a3b', soft: '#ffece4', sub: '몇십 · 받아내림',
    skills: ['s2', 's3', 's4'], stickers: ['🚗', '🚕', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚜', '🚲', '🛴', '🚂', '🚁'] },
  { name: '나눗셈 섬', icon: 'divide', theme: 2, color: '#3d9be0', shade: '#2a7cbd', soft: '#e3f0fb', sub: '구구단 거꾸로',
    skills: ['d1', 'd2', 'd3', 'd4'], stickers: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🎯', '🎨', '🧩', '🎳', '🎲'] },
  { name: '무지개 섬', icon: 'mix', theme: 3, color: '#6c63e0', shade: '#5048bf', soft: '#ebe9fb', sub: '섞어 풀기 · 빈칸',
    skills: ['m1', 'm2', 'm3', 'm4'], stickers: ['🌻', '🌷', '🌹', '🌸', '🍀', '🍁', '🍄', '🌵', '🌴', '☀️', '⛄', '🌼'] },
];

// ---------- 기술 ----------
// gen(): { op, a, b, miss? }  (miss: 'a' | 'b' | 'c' — 비어 있는 자리, 기본은 답 c)
// ex: 만나기 화면의 예시 [op, a, b, 풀이]
const SKILLS = {
  a3: { name: '몇십 더하기', op: '+', fast: 5000, tip: '몇십을 더할 때는 십의 자리만 더하면 돼요.',
    ex: [['+', 30, 40, '3 + 4 = 7 → 70'], ['+', 45, 30, '40 + 30 = 70, 70 + 5 = 75'], ['+', 62, 20, '60 + 20 = 80, 80 + 2 = 82']],
    gen: () => {
      if (Math.random() < 0.5) { const t = ri(1, 8); return { op: '+', a: t * 10, b: ri(1, 9 - t) * 10 }; }
      let a; do { a = ri(11, 89); } while (a % 10 === 0);
      return { op: '+', a, b: ri(1, Math.floor((99 - a) / 10)) * 10 };
    } },
  a4: { name: '두 자리 덧셈', op: '+', fast: 7000, tip: '십의 자리끼리, 일의 자리끼리 따로 더해요.',
    ex: [['+', 23, 15, '20 + 10 = 30, 3 + 5 = 8 → 38'], ['+', 41, 36, '40 + 30 = 70, 1 + 6 = 7 → 77'], ['+', 52, 7, '2 + 7 = 9 → 59']],
    gen: () => {
      const at = ri(1, 8), ao = ri(0, 8), bt = ri(0, 9 - at), bo = ri(1, 9 - ao);
      return { op: '+', a: at * 10 + ao, b: bt * 10 + bo };
    } },
  a5: { name: '받아올림 덧셈', op: '+', fast: 9000, tip: '먼저 몇십을 더하고, 남은 수를 더해요. 10을 넘으면 십의 자리가 하나 올라가요.',
    ex: [['+', 38, 25, '38 + 20 = 58, 58 + 5 = 63'], ['+', 47, 8, '47 + 3 = 50, 50 + 5 = 55'], ['+', 29, 34, '29 + 30 = 59, 59 + 4 = 63']],
    gen: () => {
      const ao = ri(2, 9), bo = ri(10 - ao, 9), at = ri(1, 7), bt = ri(0, 8 - at);
      return { op: '+', a: at * 10 + ao, b: bt * 10 + bo };
    } },
  s2: { name: '몇십 빼기', op: '-', fast: 5000, tip: '몇십을 뺄 때는 십의 자리만 빼면 돼요.',
    ex: [['-', 70, 30, '7 − 3 = 4 → 40'], ['-', 56, 20, '50 − 20 = 30, 30 + 6 = 36'], ['-', 84, 50, '80 − 50 = 30, 30 + 4 = 34']],
    gen: () => {
      if (Math.random() < 0.5) { const t = ri(2, 9); return { op: '-', a: t * 10, b: ri(1, t - 1) * 10 }; }
      let a; do { a = ri(21, 99); } while (a % 10 === 0);
      return { op: '-', a, b: ri(1, Math.floor(a / 10) - 1) * 10 };
    } },
  s3: { name: '두 자리 뺄셈', op: '-', fast: 7000, tip: '십의 자리끼리, 일의 자리끼리 따로 빼요.',
    ex: [['-', 48, 23, '40 − 20 = 20, 8 − 3 = 5 → 25'], ['-', 79, 35, '70 − 30 = 40, 9 − 5 = 4 → 44'], ['-', 66, 4, '6 − 4 = 2 → 62']],
    gen: () => {
      const at = ri(2, 9), ao = ri(1, 9), bt = ri(0, at - 1), bo = ri(0, ao);
      const b = bt * 10 + bo;
      return b < 2 ? { op: '-', a: at * 10 + ao, b: ao } : { op: '-', a: at * 10 + ao, b };
    } },
  s4: { name: '받아내림 뺄셈', op: '-', fast: 9000, tip: '몇십을 먼저 빼고, 남은 수를 빼요. 일의 자리가 모자라면 10을 빌려 와요.',
    ex: [['-', 52, 17, '52 − 10 = 42, 42 − 7 = 35'], ['-', 43, 8, '43 − 3 = 40, 40 − 5 = 35'], ['-', 71, 26, '71 − 20 = 51, 51 − 6 = 45']],
    gen: () => {
      const at = ri(2, 9), ao = ri(0, 8), bo = ri(ao + 1, 9), bt = ri(0, at - 1);
      return { op: '-', a: at * 10 + ao, b: bt * 10 + bo };
    } },
  d1: { name: '2·5·10으로 나누기', op: '÷', fast: 4000, tip: '나눗셈은 구구단을 거꾸로! 10 ÷ 2 = ? 는 "2 × ? = 10"을 찾는 거예요.',
    ex: [['÷', 10, 2, '2 × 5 = 10 → 5'], ['÷', 35, 5, '5 × 7 = 35 → 7'], ['÷', 60, 10, '10 × 6 = 60 → 6']],
    gen: () => divGen([2, 5, 10]) },
  d2: { name: '3·4·6으로 나누기', op: '÷', fast: 4000, tip: '나누는 수의 구구단을 떠올려요. 24 ÷ 4 = ? → 4 × ? = 24',
    ex: [['÷', 24, 4, '4 × 6 = 24 → 6'], ['÷', 18, 3, '3 × 6 = 18 → 6'], ['÷', 42, 6, '6 × 7 = 42 → 7']],
    gen: () => divGen([3, 4, 6]) },
  d3: { name: '7·8·9로 나누기', op: '÷', fast: 4000, tip: '어려운 단도 똑같아요. 56 ÷ 8 = ? → 8 × ? = 56',
    ex: [['÷', 56, 8, '8 × 7 = 56 → 7'], ['÷', 63, 9, '9 × 7 = 63 → 7'], ['÷', 28, 7, '7 × 4 = 28 → 4']],
    gen: () => divGen([7, 8, 9]) },
  d4: { name: '나눗셈 섞기', op: '÷', fast: 4500, tip: '2부터 10까지 모든 수로 나눠 봐요.',
    ex: [['÷', 45, 9, '9 × 5 = 45 → 5'], ['÷', 32, 4, '4 × 8 = 32 → 8'], ['÷', 90, 10, '10 × 9 = 90 → 9']],
    gen: () => divGen([2, 3, 4, 5, 6, 7, 8, 9, 10]) },
  m1: { name: '덧셈 뺄셈 섞기', op: '+', fast: 8000, tip: '+ 인지 − 인지 먼저 잘 보고 풀어요.',
    ex: [['+', 46, 27, '46 + 20 = 66, 66 + 7 = 73'], ['-', 63, 28, '63 − 20 = 43, 43 − 8 = 35']],
    gen: () => SKILLS[pick(['a3', 'a4', 'a5', 's2', 's3', 's4'])].gen() },
  m2: { name: '빈칸 채우기', op: '+', fast: 9000, tip: '빈칸은 거꾸로 계산해요. ? + 17 = 45 → 45 − 17 = 28',
    ex: [['+', 28, 17, '? + 17 = 45 → 45 − 17 = 28', 'a'], ['-', 63, 25, '63 − ? = 38 → 63 − 38 = 25', 'b'], ['÷', 28, 4, '? ÷ 4 = 7 → 7 × 4 = 28', 'a']],
    gen: () => Object.assign(SKILLS[pick(['a4', 'a5', 's3', 's4', 'd4'])].gen(), { miss: Math.random() < 0.5 ? 'a' : 'b' }) },
  m3: { name: '곱셈 나눗셈 섞기', op: 'x', fast: 4500, tip: '× 와 ÷ 는 짝꿍! 6 × 7 = 42 이면 42 ÷ 7 = 6 이에요.',
    ex: [['x', 6, 7, '6 × 7 = 42'], ['÷', 42, 7, '7 × 6 = 42 → 6']],
    gen: () => (Math.random() < 0.5 ? { op: 'x', a: ri(2, 10), b: ri(2, 10) } : divGen([2, 3, 4, 5, 6, 7, 8, 9, 10])) },
  m4: { name: '모두 섞기', op: '+', fast: 8000, tip: '지금까지 배운 걸 모두 섞었어요. 천천히, 차근차근!',
    ex: [['+', 57, 36, '57 + 30 = 87, 87 + 6 = 93'], ['-', 81, 45, '81 − 40 = 41, 41 − 5 = 36'], ['÷', 72, 8, '8 × 9 = 72 → 9']],
    gen: () => SKILLS[pick(['a3', 'a4', 'a5', 's2', 's3', 's4', 'd4', 'm3'])].gen() },
};
function divGen(divs) { const b = pick(divs), q = ri(1, 10); return { op: '÷', a: b * q, b }; }
// 기술의 문제 하나 (어느 기술로 기록할지 sk에 담는다)
function makeQ(id) { return Object.assign(SKILLS[id].gen(), { sk: id }); }

// ---------- 길 ----------
const CALC_NODES = [];
CALC_ISLANDS.forEach((isl, ii) => isl.skills.forEach(sk =>
  ['learn', 'prac', 'boss'].forEach(type => CALC_NODES.push({ id: `c-${sk}-${type}`, type, skill: sk, island: ii, world: 'calc' }))));
CALC_NODES.push({ id: 'c-final', type: 'final', skill: null, island: 3, world: 'calc' });
const CALC_FINAL = ['a4', 'a5', 's3', 's4', 'd4', 'm2', 'm3'];

// ---------- 계산 ----------
function resultOf(q) {
  if (q.op === '+') return q.a + q.b;
  if (q.op === '-') return q.a - q.b;
  if (q.op === '÷') return q.a / q.b;
  return q.a * q.b;
}
const partsOf = q => ({ a: q.a, b: q.b, c: resultOf(q) });
const answerOf = q => partsOf(q)[q.miss || 'c'];
const qKey = q => `${q.op}${q.a},${q.b},${q.miss || 'c'}`;

// ---------- 실력 (기술마다 최근 12번) ----------
function skillStat(id) { return S.skills[id] || (S.skills[id] = { h: [], n: 0, eg: 0, eb: 0 }); }
function skillStatus(id) {
  const s = S.skills[id];
  if (!s || !s.n) return 'new';
  const ok = s.h.filter(v => v & 1).length, fast = s.h.filter(v => v === 3).length;
  if (s.h.length >= 10 && ok >= 10) return fast >= 8 ? 'bolt' : 'green';
  return 'learn';
}
function recordCalc(id, { correct, ms, firstTry, hinted, typed }) {
  if (!firstTry || !SKILLS[id]) return [];
  const s = skillStat(id);
  s.n++;
  s.h.push(correct ? (!hinted && typed && ms < SKILLS[id].fast ? 3 : 1) : 0);
  if (s.h.length > 12) s.h.shift();
  const st = skillStatus(id), ev = [];
  if (isGot(st) && !s.eg) { s.eg = 1; ev.push('green'); }
  if (st === 'bolt' && !s.eb) { s.eb = 1; ev.push('bolt'); }
  return ev;
}
function learnedSkills() {
  return CALC_NODES.filter(n => n.type === 'learn' && S.done[n.id]).map(n => n.skill);
}

// ---------- 도움말 ----------
// full=false 이면 마지막 답은 '?'로 남겨 둔다 (💡 버튼용)
function calcHint(q, full) {
  const { a, b, c } = partsOf(q), m = q.miss || 'c';
  const end = v => (full ? v : '?');
  const S_ = OPSYM;
  if (m !== 'c') {
    const want = m === 'a' ? a : b;
    if (q.op === '+') return `거꾸로 빼 봐요: ${c} − ${m === 'a' ? b : a} = ${end(want)}`;
    if (q.op === '-') return m === 'a' ? `거꾸로 더해 봐요: ${c} + ${b} = ${end(want)}` : `거꾸로 빼 봐요: ${a} − ${c} = ${end(want)}`;
    if (q.op === '÷') return m === 'a' ? `거꾸로 곱해 봐요: ${c} × ${b} = ${end(want)}` : `${a} ÷ ${c} = ${end(want)}  (${c} × ? = ${a})`;
    return m === 'b' ? `${a}단에서 찾아봐요: ${a} × ${end(want)} = ${c}` : `${b}단에서 찾아봐요: ${end(want)} × ${b} = ${c}`;
  }
  if (q.op === 'x') return hintFor(a, b);
  if (q.op === '÷') return full ? `${b}단에서 찾아봐요: ${b} × ${c} = ${a}` : `${b}단에서 찾아봐요: ${b} × ? = ${a}`;
  const bt = b - (b % 10), bo = b % 10, ao = a % 10;
  if (q.op === '+') {
    if (a < 10 && b < 10 && a + b > 10) { const t = 10 - a; return `${a} ${S_['+']} ${t} ${S_['+']} ${b - t} = 10 + ${b - t} = ${end(c)}`; }
    if (a + b <= 10) return `손가락으로 세어 봐도 좋아요: ${a} + ${b} = ${end(c)}`;
    if (bt && bo) return `${a} + ${bt} = ${a + bt},  ${a + bt} + ${bo} = ${end(c)}`;
    if (bt && !bo) return ao ? `십의 자리만 더해요: ${a - ao} + ${bt} = ${a - ao + bt},  + ${ao} = ${end(c)}` : `십의 자리만 더해요: ${a / 10} + ${bt / 10} = ${full ? (a + bt) / 10 + '  →  ' + c : '?'}`;
    if (ao + bo >= 10) { const t = 10 - ao; return `${a} + ${t} = ${a + t},  ${a + t} + ${b - t} = ${end(c)}`; }
    return `일의 자리끼리: ${ao} + ${bo} = ${ao + bo}  →  ${end(c)}`;
  }
  // 뺄셈
  if (a < 20 && b < 10 && b > ao) return `${a} − ${ao} − ${b - ao} = 10 − ${b - ao} = ${end(c)}`;
  if (bt && bo) return `${a} − ${bt} = ${a - bt},  ${a - bt} − ${bo} = ${end(c)}`;
  if (bt && !bo) return ao ? `십의 자리만 빼요: ${a - ao} − ${bt} = ${a - ao - bt},  + ${ao} = ${end(c)}` : `십의 자리만 빼요: ${a / 10} − ${bt / 10} = ${full ? (a - bt) / 10 + '  →  ' + c : '?'}`;
  if (bo > ao) return `${a} − ${ao} = ${a - ao},  ${a - ao} − ${bo - ao} = ${end(c)}`;
  return `일의 자리끼리: ${ao} − ${bo} = ${ao - bo}  →  ${end(c)}`;
}
// 십 모형(막대 10개짜리) + 낱개
function blocks(n) {
  const t = Math.floor(n / 10), o = n % 10;
  return `<span class="bt">${'<i class="ten"></i>'.repeat(t)}<span class="ones">${'<b></b>'.repeat(o)}</span></span>`;
}
function calcVisual(q) {
  if ((q.miss || 'c') !== 'c') return '';
  if (q.op === '÷') return arrayDots(q.b, q.a / q.b, q.a > 60);
  if (q.op === 'x') return arrayDots(q.a, q.b, q.a * q.b > 60);
  return `<div class="btrow">${blocks(q.a)}<span class="bop">${OPSYM[q.op]}</span>${blocks(q.b)}</div>`;
}

// ---------- 읽어 주기 ----------
const KO_OP = { '+': '더하기', '-': '빼기', '÷': '나누기', x: '곱하기' };
const DE_OP = { '+': 'plus', '-': 'minus', '÷': 'geteilt durch', x: 'mal' };
function calcSpeech(q) {
  const { a, b, c } = partsOf(q);
  return {
    ko: `${koNum(a)} ${KO_OP[q.op]} ${topic(koNum(b))}, ${koNum(c)}`,
    de: `${deNum(a)} ${DE_OP[q.op]} ${deNum(b)} ist ${deNum(c)}`,
  };
}
function deCalcQ(q) {
  const p = partsOf(q), m = q.miss || 'c', v = k => (k === m ? '?' : p[k]);
  return m === 'c' ? `${p.a} ${DE_OP[q.op]} ${p.b}` : `${v('a')} ${DE_OP[q.op]} ${v('b')} ist ${p.c}`;
}
