'use strict';
/* 코알라 구구단 — 1~12단, 듀오링고식 학습 길 + 간격 반복 */

// ================= 데이터 =================
const ISLANDS = [
  { name: '숲속 섬', icon: 'leaf', tables: [1, 2, 10, 5], color: '#2fa77a', shade: '#23845f', soft: '#e3f3ea',
    stickers: ['🐶', '🐱', '🐰', '🦊', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'] },
  { name: '사탕 섬', icon: 'candy', tables: [4, 3, 6], color: '#ff7a59', shade: '#dc5a3b', soft: '#ffece4',
    stickers: ['🍩', '🍪', '🧁', '🍰', '🍭', '🍬', '🍫', '🍦', '🍓', '🍉', '🍒', '🍑'] },
  { name: '바다 섬', icon: 'wave', tables: [9, 8, 7], color: '#3d9be0', shade: '#2a7cbd', soft: '#e3f0fb',
    stickers: ['🐬', '🐳', '🐙', '🦀', '🐠', '🐡', '🦈', '🐚', '🦭', '🐢', '🦐', '🦞'] },
  { name: '별빛 섬', icon: 'star', tables: [11, 12], color: '#6c63e0', shade: '#5048bf', soft: '#ebe9fb',
    stickers: ['🚀', '🪐', '🌙', '⭐', '🌈', '🔮', '💎', '🧚', '🐉', '🏰', '🎈', '🦋'] },
];
const NODE_INFO = {
  learn: { icon: 'listen', name: '만나기' }, pA: { icon: 'pencil', name: '연습 1' }, pB: { icon: 'pencil', name: '연습 2' },
  mix: { icon: 'shuffle', name: '섞어 풀기' }, boss: { icon: 'cloud', name: '먹구름' }, final: { icon: 'trophy', name: '졸업 시험' },
};
const NODES = [];
ISLANDS.forEach((isl, ii) => isl.tables.forEach(t =>
  ['learn', 'pA', 'pB', 'mix', 'boss'].forEach(type => NODES.push({ id: `${t}-${type}`, type, table: t, island: ii }))));
NODES.push({ id: 'final', type: 'final', table: 0, island: 3 });

// 단을 이해하는 데 돕는 한 줄 (배울 때와 💡에서만 보여줌)
const TABLE_TIP = {
  1: '1을 곱하면 그대로예요. 1 × 7 = 7',
  2: '같은 수를 두 번 더해요. 2 × 6 = 6 + 6 = 12',
  10: '10을 곱하면 뒤에 0이 붙어요. 10 × 4 = 40',
  5: '5단은 10단의 절반! 끝자리는 0 아니면 5예요.',
  4: '4단은 2단의 두 배예요. 2 × 6 = 12 → 4 × 6 = 24',
  3: '3단은 2단에 한 번 더! 2 × 4 = 8 → 3 × 4 = 12',
  6: '6단은 3단의 두 배예요. 3 × 4 = 12 → 6 × 4 = 24',
  9: '9단은 10단보다 하나씩 적어요. 10 × 6 = 60 → 9 × 6 = 54',
  8: '8단은 4단의 두 배예요. 4 × 6 = 24 → 8 × 6 = 48',
  7: '7단은 거의 다 알고 있어요! 7 × 3 = 3 × 7 처럼 순서를 바꿔 봐요.',
  11: '11 × 1~9는 쌍둥이 숫자! 11 × 4 = 44',
  12: '12단은 10단 + 2단이에요. 12 × 3 = 30 + 6 = 36',
};
const MIRROR_TIP = '순서를 바꿔도 답은 같아요. 3 × 7 = 7 × 3';

const PHRASES = {
  ko: { good1: '잘했어!', good2: '최고야!', good3: '대단해!', good4: '멋져!', good5: '우와, 정말 잘한다!', good6: '딩동댕!',
    oops1: '괜찮아, 다음에 또 만나자!', oops2: '거의 다 왔어!', done: '레슨 끝! 스티커를 받았어!',
    boss: '먹구름이 무지개가 됐어!', hello: '지안아 안녕! 오늘도 같이 해볼까?', chest: '보물상자를 찾았어!' },
  de: { good1: 'Super!', good2: 'Toll gemacht!', good3: 'Prima!', good4: 'Klasse!', good5: 'Wunderbar!', good6: 'Richtig!',
    oops1: 'Macht nichts, beim nächsten Mal!', oops2: 'Fast geschafft!', done: 'Geschafft! Du bekommst einen Sticker!',
    boss: 'Die Wolke ist jetzt ein Regenbogen!', hello: 'Hallo! Wollen wir zusammen üben?', chest: 'Du hast eine Schatzkiste gefunden!' },
};
const GOOD_KEYS = ['good1', 'good2', 'good3', 'good4', 'good5', 'good6'];

// ================= 저장 =================
const STORE = 'unicorn-gugudan-v1'; // 기존 기록 유지를 위해 키는 그대로
const DEFAULT_SETTINGS = { voice: 'ko', sound: true, sfx: true, deSub: true, name: '코코', unlockAll: false };
let S = load();
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(STORE)); } catch (e) { /* 비어 있음 */ }
  s = s || {};
  return {
    facts: s.facts || {}, done: s.done || {}, stickers: s.stickers || {}, medals: s.medals || {},
    days: s.days || {}, best60: s.best60 || 0, seq: s.seq || 0,
    settings: Object.assign({}, DEFAULT_SETTINGS, s.settings || {}),
  };
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* 저장 공간 없음 */ } }

// ================= 문제(사실) 상태 / 간격 반복 =================
const key = (a, b) => `${a}x${b}`;
const ALL = [];
for (let a = 1; a <= 12; a++) for (let b = 1; b <= 12; b++) ALL.push([a, b]);
const MIN = 60e3, HOUR = 3600e3, DAY = 864e5;
const INTERVAL = [0, 5 * MIN, 20 * HOUR, 2 * DAY, 4 * DAY, 8 * DAY];

function fact(a, b) {
  const k = key(a, b);
  return S.facts[k] || (S.facts[k] = { box: 0, seen: 0, ok: 0, bad: 0, fast: 0, due: 0, ll: -1, eg: 0, eb: 0 });
}
// new: 아직 안 봄 / learn: 배우는 중 / green: 외움 / bolt: 3초 안에 바로 나옴
function status(a, b) {
  const f = S.facts[key(a, b)];
  if (!f || !f.seen) return 'new';
  if (f.box < 3) return 'learn';
  return f.fast >= 2 ? 'bolt' : 'green';
}
const isGot = st => st === 'green' || st === 'bolt';

/* 한 번의 답을 기록한다. 상자는 레슨마다 최대 한 칸만 오른다(한 판에 몰아서 '외움'이 되지 않게).
   틀려도 한 칸만 내려가고, 화면에는 점수로 보이지 않는다. */
function record(a, b, { correct, ms, firstTry, hinted, typed, lessonId }) {
  const f = fact(a, b);
  f.seen++; f.last = Date.now();
  if (correct) {
    f.ok++;
    if (firstTry && !hinted && f.ll !== lessonId) { f.box = Math.min(5, f.box + 1); f.ll = lessonId; }
    if (firstTry && !hinted && typed && ms < 3000) f.fast++;
  } else {
    f.bad++;
    if (firstTry) { f.box = Math.max(0, f.box - 1); f.fast = Math.max(0, f.fast - 1); }
  }
  f.due = Date.now() + INTERVAL[f.box];
  const st = status(a, b), ev = [];
  if (isGot(st) && !f.eg) { f.eg = 1; ev.push('green'); }
  if (st === 'bolt' && !f.eb) { f.eb = 1; ev.push('bolt'); }
  return ev;
}

function weight(a, b) {
  const f = S.facts[key(a, b)];
  if (!f || !f.seen) return 3;
  let w = 1 + (5 - f.box) * 1.5;
  if (f.due < Date.now()) w += 2;
  if (f.fast < 2) w += 0.5;
  return w;
}
function learnedTables() {
  const set = new Set();
  NODES.forEach(n => { if (n.type === 'learn' && S.done[n.id]) set.add(n.table); });
  return set;
}
function learnedFacts() {
  const t = learnedTables();
  return ALL.filter(([a, b]) => t.has(a) || t.has(b));
}
function dueFacts() {
  const now = Date.now();
  return learnedFacts().filter(([a, b]) => { const f = S.facts[key(a, b)]; return f && f.seen && f.due <= now; });
}

// ================= 오늘 =================
const CHEST_AT = [4, 10, 18];
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function today() { const k = todayKey(); return S.days[k] || (S.days[k] = { g: [], b: [], st: 0, ch: 0, ls: 0 }); }

// ================= 소리 =================
const SFX = (() => {
  let ctx = null;
  const ac = () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
  function tone(freq, start, dur, type = 'sine', vol = 0.18) {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime + start);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
    o.connect(g).connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
  }
  const on = () => S.settings.sfx;
  return {
    unlock() { try { ac().resume(); } catch (e) { /* 무시 */ } },
    good() { if (!on()) return; tone(784, 0, 0.18); tone(1175, 0.09, 0.28); },
    soft() { if (!on()) return; tone(330, 0, 0.22, 'triangle', 0.12); tone(262, 0.12, 0.3, 'triangle', 0.1); },
    tap() { if (!on()) return; tone(660, 0, 0.05, 'sine', 0.06); },
    pop() { if (!on()) return; tone(520, 0, 0.08); tone(1040, 0.05, 0.14); },
    bolt() { if (!on()) return; [988, 1319, 1760].forEach((f, i) => tone(f, i * 0.05, 0.16, 'square', 0.05)); },
    fanfare() { if (!on()) return; [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.14)); },
  };
})();

const Voice = (() => {
  const missing = new Set(); // 파일이 없는 언어 → 기기 음성으로
  let current = null, token = 0;
  let voices = [];
  const loadVoices = () => { voices = speechSynthesis.getVoices(); };
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

  function bestVoice(lang) {
    const list = voices.filter(v => v.lang.toLowerCase().startsWith(lang));
    const score = v => (/neural|natural|online|premium|enhanced/i.test(v.name) ? 4 : 0) + (/google/i.test(v.name) ? 3 : 0) + (v.localService ? 0 : 1);
    return list.sort((x, y) => score(y) - score(x))[0] || null;
  }
  function tts(lang, text, my) {
    return new Promise(res => {
      if (!('speechSynthesis' in window) || my !== token) return res();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'ko' ? 'ko-KR' : 'de-DE';
      const v = bestVoice(lang); if (v) u.voice = v;
      u.rate = lang === 'ko' ? 0.95 : 0.9; u.pitch = 1.1;
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 6000);
      speechSynthesis.speak(u);
    });
  }
  function file(lang, name, text, my) {
    if (missing.has(lang)) return tts(lang, text, my);
    return new Promise(res => {
      const a = new Audio(`audio/${lang}/${name}.mp3`);
      current = a;
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      a.onended = fin;
      a.onerror = () => { if (done) return; done = true; missing.add(lang); tts(lang, text, my).then(res); };
      a.play().catch(() => { if (!done) { done = true; tts(lang, text, my).then(res); } });
      setTimeout(fin, 7000);
    });
  }
  function stop() {
    token++;
    if (current) { try { current.pause(); } catch (e) { /* 무시 */ } current = null; }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
  const langs = () => (S.settings.voice === 'both' ? ['ko', 'de'] : [S.settings.voice]);
  return {
    stop,
    async fact(a, b) {
      if (!S.settings.sound) return;
      stop(); const my = token;
      for (const l of langs()) {
        if (my !== token) return;
        await file(l, key(a, b), l === 'ko' ? koFact(a, b) : deFact(a, b), my);
      }
    },
    async phrase(name) {
      if (!S.settings.sound) return;
      stop(); const my = token;
      const l = langs()[0];
      await file(l, name, PHRASES[l][name], my);
    },
    hasNiceKorean() { return !missing.has('ko'); },
    voiceName(lang) { const v = bestVoice(lang); return v ? v.name : '없음'; },
  };
})();

// 숫자 읽기 (tools/gen_audio.py 와 같은 규칙, 파일이 없을 때 기기 음성용)
const KO_DIG = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
function koNum(n) {
  let s = '';
  if (n >= 100) { s += (n >= 200 ? KO_DIG[Math.floor(n / 100)] : '') + '백'; n %= 100; }
  if (n >= 10) { s += (n >= 20 ? KO_DIG[Math.floor(n / 10)] : '') + '십'; n %= 10; }
  return s + KO_DIG[n];
}
const topic = w => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c % 28 ? '은' : '는'); };
function koFact(a, b) {
  const c = a * b;
  if (a <= 9 && b <= 9) {
    const head = koNum(a) + koNum(b);
    return c < 10 ? `${topic(head)} ${koNum(c)}` : `${head}, ${koNum(c)}`;
  }
  return `${koNum(a)} 곱하기 ${topic(koNum(b))}, ${koNum(c)}`;
}
const DE1 = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf',
  'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const DE10 = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
function deNum(n) {
  if (n >= 100) return 'einhundert' + (n % 100 ? deNum(n % 100) : '');
  if (n < 20) return DE1[n];
  const t = Math.floor(n / 10), o = n % 10;
  return o ? (o === 1 ? 'ein' : DE1[o]) + 'und' + DE10[t] : DE10[t];
}
const deFact = (a, b) => `${deNum(a)} mal ${deNum(b)} ist ${deNum(a * b)}`;
const deQ = (a, b) => `${deNum(a)} mal ${deNum(b)}`;

// ================= 그림 =================
// 아이콘 (24×24, 둥근 선)
const ICON = {
  path: '<path d="M6 21V4"/><path d="M6 4h11l-2.5 4L17 12H6z" fill="currentColor"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  bolt: '<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z" fill="currentColor"/>',
  star: '<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="currentColor"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
  listen: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4" height="6.5" rx="1.6" fill="currentColor"/><rect x="16.5" y="14" width="4" height="6.5" rx="1.6" fill="currentColor"/>',
  pencil: '<path d="M4.5 19.5l1-4.2L15.8 5a2.1 2.1 0 0 1 3 3L8.5 18.3z"/><path d="M13.8 7l3 3"/>',
  shuffle: '<path d="M3 7h3.5c2 0 3 1 4.2 2.8l2.6 4.4C14.5 16 15.5 17 17.5 17H21"/><path d="M3 17h3.5c1.3 0 2.1-.4 2.9-1.3M13.6 8.3c.8-.9 1.6-1.3 3.9-1.3H21"/><path d="M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5"/>',
  cloud: '<path d="M7 18.5h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.6A3.3 3.3 0 0 0 7 18.5z" fill="currentColor"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z" fill="currentColor"/><path d="M8 6H5a3 3 0 0 0 3.5 4M16 6h3a3 3 0 0 1-3.5 4M12 13v4M8.5 20.5h7"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="3" fill="currentColor"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.6.6.8 1.3.8 2.4h6c0-1.1.2-1.8.8-2.4A6 6 0 0 0 12 3z"/>',
  sound: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  back: '<path d="M9 5.5h10.5a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H9L3 12z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>',
  play: '<path d="M8 5.5v13l10-6.5z" fill="currentColor"/>',
  pause: '<path d="M8 5.5v13M16 5.5v13"/>',
  leaf: '<path d="M5 19c0-8.5 6-14 15-14 0 9-5.5 15-14 15z" fill="currentColor"/><path d="M5.5 18.5l8-8" stroke="rgba(255,255,255,.7)"/>',
  candy: '<circle cx="12" cy="12" r="4.6" fill="currentColor"/><path d="M7.6 12 3.5 8.8v6.4zM16.4 12l4.1-3.2v6.4z" fill="currentColor"/>',
  wave: '<path d="M2.5 9.5c2.4-2.6 4.8-2.6 7.2 0s4.8 2.6 7.2 0 3.6-2 4.6-1M2.5 15.5c2.4-2.6 4.8-2.6 7.2 0s4.8 2.6 7.2 0 3.6-2 4.6-1"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="2.5" fill="currentColor"/><path d="M3.5 9h17M12 9v11" stroke="rgba(255,255,255,.85)"/><path d="M12 9c-1.5-3.5-5-4.5-5-2s3.2 2 5 2c1.8 0 5 .5 5-2s-3.5-1.5-5 2"/>',
  mirror: '<path d="M12 3v18" stroke-dasharray="2 3"/><path d="M9 7 4 12l5 5zM15 7l5 5-5 5z" fill="currentColor"/>',
  guitar: '<path d="M14.5 9.5 20 4M18 3l3 3"/><path d="M10.5 9.5c1.6-1.6 4-1.4 4.6.2.6 1.5-1.2 2.3-.7 3.7.6 1.8-.6 4.6-3.4 5.6-3.3 1.2-6.6-1.4-6.4-4.5.2-2.6 2.5-2.5 3.4-3.6.8-1 .8-1 2.5-1.4z" fill="currentColor"/>',
  medal: '<path d="M8 3l3 6M16 3l-3 6"/><circle cx="12" cy="14.5" r="6" fill="currentColor"/>',
};
const ic = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

// 코알라 마스코트 (표정: 기본 / happy / wow)
function koala(cls = '') {
  return `<svg class="koala ${cls}" viewBox="0 0 120 120" aria-hidden="true">
  <circle cx="24" cy="44" r="21" fill="#8e99a6"/><circle cx="96" cy="44" r="21" fill="#8e99a6"/>
  <circle cx="25" cy="46" r="12.5" fill="#f4e4e0"/><circle cx="95" cy="46" r="12.5" fill="#f4e4e0"/>
  <ellipse cx="60" cy="70" rx="38" ry="34" fill="#a5b0bb"/>
  <ellipse cx="60" cy="86" rx="22" ry="13" fill="#c8d0d8"/>
  <g class="k-open"><circle cx="40" cy="64" r="5" fill="#262b36"/><circle cx="80" cy="64" r="5" fill="#262b36"/>
    <circle cx="41.8" cy="62.2" r="1.8" fill="#fff"/><circle cx="81.8" cy="62.2" r="1.8" fill="#fff"/></g>
  <path class="k-happy" d="M34 66q6-7 12 0M74 66q6-7 12 0" stroke="#262b36" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="30" cy="78" rx="6.5" ry="3.8" fill="#ff8f7a" opacity=".5"/><ellipse cx="90" cy="78" rx="6.5" ry="3.8" fill="#ff8f7a" opacity=".5"/>
  <path d="M60 60c7.5 0 12 4.5 12 11.5 0 7-5.2 11.5-12 11.5s-12-4.5-12-11.5C48 64.5 52.5 60 60 60z" fill="#363c4a"/>
  <ellipse cx="55" cy="66" rx="3" ry="4" fill="#fff" opacity=".3"/>
  <path class="k-smile" d="M54 91q6 5 12 0" stroke="#363c4a" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <ellipse class="k-wow" cx="60" cy="92.5" rx="3.6" ry="4.2" fill="#363c4a"/>
  <g transform="translate(83 20) rotate(25)"><path d="M0 0c6-6.5 15-6.5 20 0-5 6.5-15 6.5-20 0z" fill="#2fa77a"/>
    <path d="M1 0h17" stroke="#1f7a57" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M3 2c-1.5 6 1.5 12 8 14.5-.5-6.5-3-11.5-8-14.5z" fill="#5cc497"/></g></svg>`;
}
// 보스를 이긴 뒤 해님
function sunSVG() {
  let rays = '';
  for (let i = 0; i < 12; i++) rays += `<rect x="57" y="4" width="6" height="16" rx="3" fill="#ffc94a" transform="rotate(${i * 30} 60 60)"/>`;
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><g class="rays">${rays}</g>
    <circle cx="60" cy="60" r="30" fill="#ffc94a"/><circle cx="50" cy="56" r="3.5" fill="#6b4a00"/><circle cx="70" cy="56" r="3.5" fill="#6b4a00"/>
    <path d="M50 67q10 9 20 0" stroke="#6b4a00" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="43" cy="66" rx="5" ry="3" fill="#ff8f7a" opacity=".55"/><ellipse cx="77" cy="66" rx="5" ry="3" fill="#ff8f7a" opacity=".55"/></svg>`;
}
// 먹구름: 남은 체력이 줄수록 밝아지고 웃는다
function cloud(ratio) {
  const mix = (x, y) => Math.round(x + (y - x) * (1 - ratio));
  const fill = `rgb(${mix(120, 236)},${mix(132, 242)},${mix(150, 247)})`;
  const mouth = ratio > 0.6 ? 'M50 60 Q60 53 70 60' : ratio > 0.25 ? 'M51 58 L69 58' : 'M49 55 Q60 66 71 55';
  const brow = ratio > 0.6 ? '<path d="M40 38 L50 42 M80 38 L70 42" stroke="#3a4150" stroke-width="3" stroke-linecap="round"/>' : '';
  const blush = ratio <= 0.25 ? '<ellipse cx="38" cy="54" rx="5" ry="3" fill="#ffb3c8"/><ellipse cx="82" cy="54" rx="5" ry="3" fill="#ffb3c8"/>' : '';
  return `<svg viewBox="0 0 120 84" aria-hidden="true"><g fill="${fill}">
    <circle cx="30" cy="50" r="22"/><circle cx="55" cy="34" r="26"/><circle cx="83" cy="40" r="22"/><circle cx="98" cy="58" r="16"/>
    <rect x="18" y="50" width="88" height="24" rx="12"/></g>
    ${brow}<circle cx="46" cy="47" r="4" fill="#3a4150"/><circle cx="74" cy="47" r="4" fill="#3a4150"/>
    ${blush}<path d="${mouth}" stroke="#3a4150" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
}
// 묶음 그림: a줄 × b개 (5개마다 살짝 띄움)
function arrayDots(a, b, small) {
  let html = `<div class="arr ${small ? 'small' : ''}" style="grid-template-columns:repeat(${b},auto)">`;
  for (let r = 0; r < a; r++) for (let c = 0; c < b; c++) {
    const gap = (c === 5 ? 'margin-left:6px;' : '') + (r === 5 ? 'margin-top:6px;' : '');
    html += `<b class="${r % 2 ? 'alt' : ''}" style="${gap}"></b>`;
  }
  return html + '</div>';
}

// ================= 도움말(💡) =================
const HELPER_ORDER = [1, 10, 2, 5, 11, 9, 4, 3, 6, 8, 12, 7];
function hintFor(a, b) {
  const c = a * b;
  if (a !== b && isGot(status(b, a))) return `${b} × ${a} = ${c} 기억나? 순서만 바뀌었어!`;
  if ((a === 7 && b === 8) || (a === 8 && b === 7)) return '5, 6, 7, 8 → 56 = 7 × 8';
  const t = HELPER_ORDER.find(x => x === a || x === b), o = t === a ? b : a;
  switch (t) {
    case 1: return '1을 곱하면 그대로!';
    case 10: return `${o} 뒤에 0을 붙여요 → ${c}`;
    case 2: return `${o} + ${o} = ${c}`;
    case 5: return `10 × ${o} = ${10 * o}의 절반 → ${c}`;
    case 11: return o <= 9 ? `쌍둥이 숫자! ${o}${o}` : `11 × ${o} = 10 × ${o} + ${o} = ${10 * o} + ${o}`;
    case 9: return `10 × ${o} = ${10 * o}에서 ${o}를 빼요 → ${c}`;
    case 4: return `2 × ${o} = ${2 * o}, 두 배 하면 → ${c}`;
    case 3: return `2 × ${o} = ${2 * o}, 하나 더 ${o} → ${c}`;
    case 6: return `5 × ${o} = ${5 * o}, 하나 더 ${o} → ${c}`;
    case 8: return `4 × ${o} = ${4 * o}, 두 배 하면 → ${c}`;
    case 12: return `10 × ${o} = ${10 * o}, 2 × ${o} = ${2 * o} → ${c}`;
    default: return `5 × ${o} = ${5 * o}, 2 × ${o} = ${2 * o} → ${c}`;
  }
}

// ================= 도우미 =================
const $ = sel => document.querySelector(sel);
const screen = $('#screen');
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function weightedPick(pool, avoid) {
  const cand = pool.filter(([a, b]) => !avoid.includes(key(a, b)));
  const list = cand.length ? cand : pool;
  const ws = list.map(([a, b]) => weight(a, b));
  let r = Math.random() * ws.reduce((x, y) => x + y, 0);
  for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
  return list[list.length - 1];
}
function confetti(n = 70) {
  const fx = $('#fx'), colors = ['#2fa77a', '#ffc94a', '#ff7a59', '#3d9be0', '#6c63e0', '#7fd1ab'];
  for (let i = 0; i < n; i++) {
    const d = document.createElement('i');
    d.className = 'confetti';
    d.style.left = Math.random() * 100 + 'vw';
    d.style.background = pick(colors);
    d.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
    d.style.animationDelay = Math.random() * 0.4 + 's';
    fx.appendChild(d); setTimeout(() => d.remove(), 3800);
  }
}
function sheet(html) {
  const el = $('#sheet');
  el.innerHTML = `<div class="in">${html}</div>`;
  el.classList.remove('hidden');
  el.onclick = e => { if (e.target === el) closeSheet(); };
}
function closeSheet() { $('#sheet').classList.add('hidden'); }
const uniName = () => (S.settings.name && S.settings.name !== '유니' ? S.settings.name : '코코');
const withRang = w => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c % 28 ? '이랑' : '랑'); };

// ================= 화면 이동 =================
let cur = 'path';
function go(name, push = true) {
  Voice.stop(); closeSheet();
  if (name !== 'result') $('#fx').innerHTML = '';
  if (L && name !== 'lesson') { if (L.timer) clearInterval(L.timer); L = null; }
  cur = name;
  document.body.classList.toggle('in-lesson', name === 'lesson' || name === 'learnIntro' || name === 'result');
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.go === name));
  if (push) history.pushState({ s: name }, '');
  ({ path: renderPath, map: renderMap, bolt: renderBolt, book: renderBook, settings: renderSettings }[name] || (() => {}))();
  if (['path', 'map', 'bolt', 'book', 'settings'].includes(name)) window.scrollTo(0, 0);
}
window.addEventListener('popstate', () => {
  if (cur === 'lesson' || cur === 'learnIntro' || cur === 'result') go('path', false);
  else if (cur !== 'path') go('path', false);
});
document.querySelectorAll('#nav button').forEach(b => { b.insertAdjacentHTML('afterbegin', ic(b.dataset.ic)); b.onclick = () => { SFX.tap(); go(b.dataset.go); }; });
document.addEventListener('pointerdown', () => SFX.unlock(), { once: true });

// ================= 모험 길 =================
function currentIndex() {
  const i = NODES.findIndex(n => !S.done[n.id]);
  return i < 0 ? NODES.length : i;
}
function nodeOpen(i) { return S.settings.unlockAll || i <= currentIndex(); }

function renderPath() {
  const ci = currentIndex(), d = today();
  const got = d.g.length + d.b.length;
  const nextChest = CHEST_AT[d.ch];
  const due = dueFacts().length, learned = learnedFacts().length;
  const greet = ci === 0 ? `안녕 지안! 나는 코알라 ${uniName()}야. 같이 구구단 섬을 모험하자!`
    : got ? `오늘 벌써 ${got}개나 외웠어!` : '오늘도 같이 해볼까?';
  let html = `
  <div class="hello"><div class="mascot" id="helloUni">${koala('happy')}</div><div class="bubble">${greet}</div></div>
  <div class="today card">
    <div class="tstat"><span class="tlabel2">오늘 외운 문제</span><span class="tnum"><i class="dot g"></i>${d.g.length}<i class="dot b"></i>${d.b.length}</span></div>
    <div class="tstat"><span class="tlabel2">오늘 스티커</span><span class="tnum">${ic('star', 'sm gold')}${d.st}</span></div>
    <div class="tstat grow"><span class="tlabel2">${nextChest ? `보물상자까지 ${Math.max(0, nextChest - got)}개` : '오늘 보물상자 다 찾았어!'}</span>
      <span class="chestbar">${ic('gift', 'sm coral')}<span class="cbar"><i style="width:${nextChest ? Math.min(100, got / nextChest * 100) : 100}%"></i></span></span></div>
  </div>`;
  if (learned >= 6) {
    html += `<button class="card review" id="reviewBtn"><span class="rv-k">${koala()}</span>
      <span class="grow" style="text-align:left"><span class="rv-t">${withRang(uniName())} 복습하기</span><br>
      <span class="sub">${due ? `기억할 때가 된 문제 ${due}개` : '헷갈리는 문제 위주로 10개'}</span></span><span class="rv-go">${ic('play')}</span></button>`;
  }
  let lastIsland = -1, lastTable = -1, k = 0;
  const zig = [0, 56, 84, 56, 0, -56, -84, -56];
  html += '<div class="path">';
  NODES.forEach((n, i) => {
    const isl = ISLANDS[n.island];
    if (n.island !== lastIsland) {
      lastIsland = n.island;
      const firstIdx = NODES.findIndex(x => x.island === n.island);
      html += `</div><div class="island ${nodeOpen(firstIdx) ? '' : 'locked'}" style="--c:${isl.color};--s:${isl.shade}">
        <span class="e">${ic(isl.icon)}</span><div><div class="isl-n">섬 ${n.island + 1}</div><h2>${isl.name}</h2><div class="t">${isl.tables.map(t => t + '단').join(' · ')}</div></div></div><div class="path">`;
    }
    if (n.table !== lastTable && n.type !== 'final') { lastTable = n.table; html += `<div class="tlabel" style="--c:${isl.color}">${n.table}단</div>`; }
    if (n.type === 'final') html += '<div class="tlabel">모든 단</div>';
    const open = nodeOpen(i), done = !!S.done[n.id], isCur = i === ci;
    const info = NODE_INFO[n.type];
    const cls = ['node', n.type === 'boss' || n.type === 'final' ? 'boss' : '', done ? 'done' : '', open ? '' : 'locked', isCur ? 'current' : ''].join(' ');
    const dx = zig[k++ % zig.length];
    html += `<div class="node-wrap" style="transform:translateX(${dx}px)">
      <button class="${cls}" style="--c:${isl.color};--s:${isl.shade}" data-i="${i}">${ic(open ? info.icon : 'lock')}${done ? `<span class="badge">${ic('check')}</span>` : ''}</button>
      <span class="node-name">${info.name}</span>
      ${isCur ? `<div class="mini-uni ${dx > 0 ? 'left' : ''}">${koala()}</div>` : ''}</div>`;
  });
  html += '</div><div style="height:30px"></div>';
  screen.innerHTML = html;
  screen.querySelectorAll('.node').forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    if (!nodeOpen(i)) { SFX.soft(); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; }
    SFX.tap(); openNode(NODES[i]);
  });
  const rb = $('#reviewBtn'); if (rb) rb.onclick = () => startReview();
  const curNode = screen.querySelector('.node.current');
  if (curNode && ci > 2) setTimeout(() => curNode.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80);
  $('#helloUni').onclick = () => { Voice.phrase('hello'); const m = $('#helloUni'); m.classList.remove('jump'); void m.offsetWidth; m.classList.add('jump'); };
}

// ================= 레슨 설정 =================
const tableFacts = (t, from = 1, to = 12) => { const r = []; for (let k = from; k <= to; k++) r.push([t, k]); return r; };
const both = facts => { const seen = new Set(), r = []; facts.forEach(([a, b]) => [[a, b], [b, a]].forEach(f => { const k = key(...f); if (!seen.has(k)) { seen.add(k); r.push(f); } })); return r; };

function openNode(n) {
  const t = n.table, isl = n.island;
  if (n.type === 'learn') return renderLearnIntro(n);
  if (n.type === 'pA') return startLesson({ node: n, island: isl, pool: tableFacts(t, 1, 6), target: 8, mix: { choice: 0.4, missing: 0.15 } });
  if (n.type === 'pB') return startLesson({ node: n, island: isl, pool: tableFacts(t, 7, 12), target: 8, mix: { choice: 0.4, missing: 0.15 } });
  if (n.type === 'mix') {
    const review = learnedFacts().filter(([a, b]) => a !== t && b !== t);
    const extra = shuffle(review).slice(0, 4);
    return startLesson({ node: n, island: isl, pool: both(tableFacts(t)).concat(extra), target: 10, mix: { choice: 0.2, missing: 0.2 } });
  }
  if (n.type === 'boss') return startLesson({ node: n, island: isl, pool: both(tableFacts(t)), target: 10, boss: true, mix: { choice: 0.1, missing: 0.15 } });
  if (n.type === 'final') return startLesson({ node: n, island: isl, pool: ALL, target: 20, boss: true, mix: { choice: 0, missing: 0.15 } });
}
function startReview() {
  const due = dueFacts(), learned = learnedFacts();
  const pool = due.length >= 6 ? due : learned;
  startLesson({ kind: 'review', island: islandNow(), pool, target: 10, mix: { choice: 0.15, missing: 0.15 } });
}
function islandNow() { const n = NODES[Math.min(currentIndex(), NODES.length - 1)]; return n.island; }

// ================= 단 만나기 =================
function renderLearnIntro(n) {
  go('learnIntro');
  const t = n.table, isl = ISLANDS[n.island];
  const rows = tableFacts(t).map(([a, b]) => `
    <button class="trow" data-b="${b}"><span class="eq">${a} × ${b} = ${a * b}</span>
      ${S.settings.deSub ? `<span class="de">${a} mal ${b} ist ${a * b}</span>` : ''}
      <span class="strip">${Array.from({ length: b }, (_, i) => `<b class="${i % 2 ? 'g2' : ''}"></b>`).join('')}</span></button>`).join('');
  screen.innerHTML = `
  <div class="ltop"><button class="xbtn" id="xb">${ic('x')}</button><h2 class="title grow" style="margin:0">${t}단을 만나보자!</h2></div>
  <div class="learn-head" style="margin-top:12px"><div class="mascot">${koala('happy')}</div>
    <div class="bubble">하나씩 눌러서 들어봐! <b>모두 듣기</b>로 노래처럼 따라 해 보자.</div></div>
  <div class="tip">${ic('bulb')}<span>${TABLE_TIP[t]}${t === 7 ? `<br>${MIRROR_TIP}` : ''}</span></div>
  <div class="row"><button class="btn ghost" id="playAll">${ic('play')} 모두 듣기</button></div>
  <div class="tlist" style="--c:${isl.color}">${rows}</div>
  <button class="btn wide" id="startBtn">이제 풀어보기</button><div style="height:20px"></div>`;
  $('#xb').onclick = () => go('path');
  let playing = false;
  const mark = b => screen.querySelectorAll('.trow').forEach(r => r.classList.toggle('playing', +r.dataset.b === b));
  screen.querySelectorAll('.trow').forEach(r => r.onclick = () => { playing = false; mark(+r.dataset.b); Voice.fact(t, +r.dataset.b); });
  $('#playAll').onclick = async () => {
    if (playing) { playing = false; Voice.stop(); mark(0); return; }
    playing = true; $('#playAll').innerHTML = `${ic('pause')} 멈추기`;
    for (let b = 1; b <= 12 && playing && cur === 'learnIntro'; b++) {
      mark(b);
      screen.querySelector(`.trow[data-b="${b}"]`).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (S.settings.sound) await Voice.fact(t, b); else await new Promise(r => setTimeout(r, 900));
      await new Promise(r => setTimeout(r, 250));
    }
    playing = false; mark(0); const pb = $('#playAll'); if (pb) pb.innerHTML = `${ic('play')} 모두 듣기`;
  };
  // 만나기 레슨: 1부터 12까지 순서대로, 고르기 문제
  $('#startBtn').onclick = () => { playing = false; startLesson({ node: n, island: n.island, pool: tableFacts(t), target: 12, ordered: true, mix: { choice: 1, missing: 0 } }); };
}

// ================= 레슨 엔진 =================
let L = null;
function startLesson(cfg) {
  S.seq++;
  $('#fx').innerHTML = '';
  L = Object.assign({ id: S.seq, correct: 0, asked: 0, retry: [], recent: [], ord: 0, gainG: [], gainB: [], q: null, busy: false }, cfg);
  go('lesson');
  if (L.rush) { L.endAt = Date.now() + 60000; L.timer = setInterval(tickRush, 250); }
  renderLessonFrame();
  nextQ();
}
function renderLessonFrame() {
  screen.innerHTML = `<div class="lesson">
    <div class="ltop"><button class="xbtn" id="xb">${ic('x')}</button>
      <div class="bar"><i id="bar"></i></div>${L.rush ? '<div class="timer" id="timer">60</div>' : ''}</div>
    ${L.boss ? `<div class="bossbar"><div class="cloud" id="cloud">${cloud(1)}</div><div class="hp" id="hp">${'<i></i>'.repeat(L.target)}</div></div>` : ''}
    <div class="lbody" id="lbody"></div></div>`;
  $('#xb').onclick = quitLesson;
  updateBar();
}
function quitLesson() {
  const done = L && L.correct > 0;
  if (L && L.timer) clearInterval(L.timer);
  save();
  if (done) {
    sheet(`<div class="mascot" style="width:110px;height:110px">${koala()}</div>
      <div style="font-size:22px">여기서 쉬어갈까?</div><div class="sub">지금까지 푼 건 다 기억해 둘게!</div>
      <div class="row" style="width:100%"><button class="btn ghost grow" id="stay">계속하기</button><button class="btn grow" id="leave">쉬어가기</button></div>`);
    $('#stay').onclick = () => { closeSheet(); if (L && L.rush) L.timer = setInterval(tickRush, 250); };
    $('#leave').onclick = () => { closeSheet(); go('path'); };
  } else go('path');
}
function updateBar() {
  const bar = $('#bar'); if (!bar) return;
  if (L.rush) { bar.style.width = Math.max(0, (L.endAt - Date.now()) / 600) + '%'; return; }
  bar.style.width = Math.min(100, (L.correct / L.target) * 100) + '%';
  if (L.boss) {
    $('#cloud').innerHTML = cloud(1 - L.correct / L.target);
    $('#hp').querySelectorAll('i').forEach((h, i) => h.classList.toggle('gone', i < L.correct));
  }
}
function tickRush() {
  if (!L || !L.rush) return;
  const left = Math.max(0, Math.ceil((L.endAt - Date.now()) / 1000));
  const t = $('#timer'); if (t) t.textContent = left;
  updateBar();
  if (left <= 0) { clearInterval(L.timer); L.timer = null; if (!L.busy) finishLesson(); else L.timeUp = true; }
}

function chooseType(a, b) {
  const m = L.mix, r = Math.random();
  if (m.choice >= 1) return 'choice';
  if (r < m.choice) return 'choice';
  if (r < m.choice + m.missing) return 'missing';
  return 'input';
}
function nextQ() {
  if (!L) return;
  if (!L.rush && L.correct >= L.target) return finishLesson();
  L.asked++;
  let item = null;
  const dueRetry = L.retry.findIndex(r => r.at <= L.asked);
  const exhausted = L.ordered && L.ord >= L.pool.length;
  if (dueRetry >= 0 || (exhausted && L.retry.length)) {
    item = L.retry.splice(dueRetry >= 0 ? dueRetry : 0, 1)[0];
    item = { a: item.a, b: item.b, type: 'choice', retry: true };
  } else if (L.ordered && !exhausted) {
    const [a, b] = L.pool[L.ord++]; item = { a, b, type: 'choice' };
  } else {
    const [a, b] = weightedPick(L.pool, L.recent); item = { a, b, type: L.bolt || L.rush ? 'input' : chooseType(a, b) };
  }
  L.recent = [key(item.a, item.b)].concat(L.recent).slice(0, Math.min(3, L.pool.length - 1));
  item.answer = item.type === 'missing' ? item.b : item.a * item.b;
  item.typed = ''; item.hinted = false; item.tries = 0; item.shownAt = Date.now();
  L.q = item; L.busy = false;
  renderQ();
}

function qText(q, reveal) {
  const c = q.a * q.b;
  const ans = v => `<span class="ans ${v === '' ? 'empty' : ''}" id="ans">${v === '' ? '?' : v}</span>`;
  if (q.type === 'missing') return `${q.a} × ${reveal ? ans(q.b) : ans(q.typed)} = ${c}`;
  return `${q.a} × ${q.b} = ${reveal ? ans(c) : ans(q.type === 'choice' ? '' : q.typed)}`;
}
function choicesFor(a, b) {
  const c = a * b, set = new Set([c]);
  const cands = shuffle([c + a, c - a, c + b, c - b, (a + 1) * b, a * (b + 1), c + 1, c - 1, c + 10, c - 10, c + 2]);
  for (const x of cands) { if (set.size >= 4) break; if (x > 0 && x !== c && x <= 156) set.add(x); }
  while (set.size < 4) set.add(c + set.size * 3);
  return shuffle([...set]);
}
const speakerLine = q => {
  if (L.rush) return '빨리빨리! 맞힐 때마다 별이 쌓여요.';
  if (L.bolt) return '3초 안에 맞히면 번개!';
  if (q.retry) return '아까 그 문제! 이번엔 고르기야.';
  if (q.type === 'missing') return '빈칸에 들어갈 수는?';
  if (L.boss) return '맞힐 때마다 먹구름이 맑아져!';
  return pick(['할 수 있어!', '천천히 해도 괜찮아.', '같이 풀어보자!', '이건 어때?']);
};
function renderQ() {
  const q = L.q, lb = $('#lbody'); if (!lb) return;
  lb.innerHTML = `
    <div class="lq">
      <div class="speaker"><div class="mascot" id="lUni">${koala()}</div><div class="bubble" id="say">${speakerLine(q)}</div></div>
      <div class="qcard" id="qcard">
        ${!L.rush && !L.bolt ? `<button class="hintbtn" id="hintBtn" aria-label="도움">${ic('bulb')}</button>` : ''}
        ${L.bolt ? '<svg class="ring run" viewBox="0 0 52 52"><circle class="bg" cx="26" cy="26" r="22"/><circle class="fg" cx="26" cy="26" r="22" stroke-dasharray="138"/></svg>' : ''}
        <div class="qtext" id="qtext">${qText(q)}</div>
        <div class="de">${S.settings.deSub ? deQ(q.a, q.b).replace(/^(\w)/, m => m.toUpperCase()) : ''}</div>
      </div>
      <div id="extra"></div>
    </div>
    <div class="answer" id="answer">${q.type === 'choice' ? `<div class="choices">${choicesFor(q.a, q.b).map(v => `<button data-v="${v}">${v}</button>`).join('')}</div>` : padHTML()}</div>`;
  if (q.type === 'missing') $('#qcard .de').textContent = S.settings.deSub ? `${q.a} mal ? ist ${q.a * q.b}` : '';
  if (q.type === 'choice') lb.querySelectorAll('.choices button').forEach(b => b.onclick = () => answer(+b.dataset.v, b));
  else bindPad();
  const hb = $('#hintBtn'); if (hb) hb.onclick = showHint;
}
function padHTML() {
  return `<div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button data-d="${d}">${d}</button>`).join('')}
    <button class="fn" data-d="del">${ic('back')}</button><button data-d="0">0</button><button class="go" data-d="ok">${ic('check')}</button></div>`;
}
function bindPad() { $('#answer').querySelectorAll('.pad button').forEach(b => b.onclick = () => padKey(b.dataset.d)); }
function padKey(d) {
  const q = L && L.q; if (!q || L.busy || q.type === 'choice') return;
  if (d === 'del') q.typed = q.typed.slice(0, -1);
  else if (d === 'ok') { if (q.typed !== '') answer(+q.typed); return; }
  else if (q.typed.length < 3) {
    q.typed += d;
    // 자릿수가 다 차면 바로 확인 (정답 자릿수 기준)
    if (q.typed.length >= String(q.answer).length && L.autoSubmit !== false) { refreshAns(); return setTimeout(() => L && L.q === q && !L.busy && answer(+q.typed), 180); }
  }
  SFX.tap(); refreshAns();
}
function refreshAns() { const el = $('#ans'); if (!el || !L) return; const q = L.q; el.textContent = q.typed === '' ? '?' : q.typed; el.classList.toggle('empty', q.typed === ''); }
document.addEventListener('keydown', e => {
  if (cur !== 'lesson' || !L || !L.q) return;
  if (/^[0-9]$/.test(e.key)) padKey(e.key);
  else if (e.key === 'Backspace') padKey('del');
  else if (e.key === 'Enter') padKey('ok');
});

function showHint() {
  const q = L.q; if (L.busy) return;
  q.hinted = true;
  const big = q.a * q.b <= 60;
  $('#extra').innerHTML = `<div class="hintbox">${arrayDots(q.a, q.b, !big)}<div>${hintFor(q.a, q.b)}</div></div>`;
  $('#hintBtn').style.visibility = 'hidden';
}

function answer(v, btn) {
  const q = L.q; if (L.busy) return;
  L.busy = true;
  const ms = Date.now() - q.shownAt, ok = v === q.answer;
  const firstTry = !q.retry && q.tries === 0;
  q.tries++;
  const ev = record(q.a, q.b, { correct: ok, ms, firstTry, hinted: q.hinted, typed: q.type !== 'choice', lessonId: L.id });
  const d = today();
  ev.forEach(e => { const k = key(q.a, q.b); if (e === 'green') { L.gainG.push(k); d.g.push(k); } else { L.gainB.push(k); d.b.push(k); } });
  save();
  const card = $('#qcard'), uni = $('#lUni');
  if (ok) {
    L.correct++;
    card.classList.add('ok');
    $('#qtext').innerHTML = qText(q, true);
    if (btn) btn.classList.add('right');
    const fast = q.type !== 'choice' && ms < 3000 && firstTry && !q.hinted;
    if (fast && (L.bolt || L.rush)) { card.insertAdjacentHTML('beforeend', `<span class="flash bolt">${ic('bolt')}</span>`); SFX.bolt(); } else SFX.good();
    if (ev.length) card.insertAdjacentHTML('beforeend', `<span class="flash got ${ev.includes('bolt') ? 'bolt' : ''}">${ev.includes('bolt') ? ic('bolt') : ic('check')} ${ev.includes('bolt') ? '번개!' : '외웠다!'}</span>`);
    uni.querySelector('svg').classList.add('happy'); uni.classList.add('jump');
    $('#say').textContent = ev.length ? (ev.includes('bolt') ? '번개처럼 빨라졌어!' : '이 문제 외웠다!') : PHRASES.ko[pick(GOOD_KEYS)];
    if (L.boss) { const c = $('#cloud'); c.classList.remove('hit'); void c.offsetWidth; c.classList.add('hit'); }
    updateBar();
    if (L.rush) { Voice.stop(); setTimeout(afterAnswer, 350); return; }
    Voice.fact(q.a, q.b);
    setTimeout(afterAnswer, L.bolt ? 900 : 1300);
  } else {
    SFX.soft();
    card.classList.add('no'); card.classList.add('shake');
    uni.querySelector('svg').classList.add('wow');
    if (btn) { btn.classList.add('wrong'); $('#answer').querySelectorAll('button').forEach(b => { if (+b.dataset.v === q.answer) b.classList.add('right'); }); }
    $('#qtext').innerHTML = qText(q, true);
    $('#say').textContent = '괜찮아! 정답을 같이 보자.';
    if (L.rush) { setTimeout(afterAnswer, 1300); Voice.stop(); return; }
    L.retry.push({ a: q.a, b: q.b, at: L.asked + 3 });
    Voice.fact(q.a, q.b);
    const small = q.a * q.b > 60;
    $('#answer').innerHTML = `<div class="feedback no">
      <h3>정답은 <b>${q.a * q.b}</b> 이야</h3>
      <div class="center">${arrayDots(q.a, q.b, small)}</div>
      <div class="sub">${hintFor(q.a, q.b)}</div>
      <div class="sub">이 문제는 조금 있다가 다시 만나자!</div>
      <button class="btn wide warm" id="contBtn">계속하기</button></div>`;
    $('#extra').innerHTML = '';
    $('#contBtn').onclick = () => { SFX.tap(); afterAnswer(); };
  }
}
function afterAnswer() {
  if (!L) return;
  if (L.rush && (L.timeUp || Date.now() >= L.endAt)) return finishLesson();
  nextQ();
}

// ================= 보상 =================
function awardSticker(pref) {
  const order = [pref].concat([0, 1, 2, 3].filter(i => i !== pref));
  for (const i of order) {
    const un = ISLANDS[i].stickers.filter(s => !S.stickers[s]);
    if (un.length) { const s = pick(un); S.stickers[s] = 1; return { s, isNew: true }; }
  }
  const s = pick(ISLANDS[pref].stickers); S.stickers[s] = (S.stickers[s] || 1) + 1; return { s, isNew: false };
}
function finishLesson() {
  if (!L) return;
  const lesson = L;
  if (lesson.timer) clearInterval(lesson.timer);
  const d = today(), rewards = [];
  let title = '레슨 끝!', line = '';
  if (lesson.node) S.done[lesson.node.id] = 1;
  d.ls++;
  if (lesson.rush) {
    title = `${lesson.correct}개 맞혔어!`;
    if (lesson.correct > S.best60) {
      line = S.best60 ? `새 기록이야! (전에는 ${S.best60}개)` : '첫 기록이야!';
      S.best60 = lesson.correct;
      if (lesson.correct >= 5) rewards.push({ kind: 'sticker', ...awardSticker(lesson.island) });
    } else line = `최고 기록은 ${S.best60}개야. 다음엔 깰 수 있어!`;
  } else {
    rewards.push({ kind: 'sticker', ...awardSticker(lesson.island) });
    if (lesson.node && lesson.node.type === 'boss') { S.medals[lesson.node.table] = 1; rewards.push({ kind: 'medal', t: lesson.node.table }); title = '먹구름이 걷혔어!'; }
    if (lesson.node && lesson.node.type === 'final') { S.medals.final = 1; rewards.push({ kind: 'medal', t: 'final' }); title = '구구단 졸업!'; }
  }
  // 오늘 잡은 문제 수에 따라 보물상자
  const got = d.g.length + d.b.length;
  while (d.ch < CHEST_AT.length && got >= CHEST_AT[d.ch]) {
    d.ch++;
    rewards.push({ kind: 'chest', items: [awardSticker(lesson.island), awardSticker(pick([0, 1, 2, 3]))] });
  }
  d.st += rewards.reduce((n, r) => n + (r.kind === 'sticker' ? 1 : r.kind === 'chest' ? 2 : 0), 0);
  save();
  L = null;
  renderResult(lesson, title, line, rewards);
}
function renderResult(lesson, title, line, rewards) {
  go('result');
  const boss = lesson.node && (lesson.node.type === 'boss' || lesson.node.type === 'final');
  const chip = (k, c) => { const [a, b] = k.split('x'); return `<span class="gain ${c}">${a}×${b}</span>`; };
  const gains = lesson.gainG.length || lesson.gainB.length
    ? `<div class="sub">오늘 새로 잡은 문제</div><div class="gains">${lesson.gainG.map(k => chip(k, 'g')).join('')}${lesson.gainB.map(k => chip(k, 'b').replace('">', `">${ic('bolt', 'sm')}`)).join('')}</div>`
    : `<div class="sub">${pick(['문제들이 점점 익숙해지고 있어!', '연습할수록 머릿속에 쏙쏙!', '오늘도 한 걸음 더!'])}</div>`;
  screen.innerHTML = `<div class="result">
    ${boss ? `<div class="sun">${sunSVG()}</div>` : ''}
    <div class="mascot jump">${koala('happy')}</div>
    <h2>${title}</h2>${line ? `<div class="sub" style="font-size:20px">${line}</div>` : ''}
    ${gains}
    <div class="rewards" id="rewards">${rewards.map((r, i) => `<button class="reward closed" data-i="${i}" style="animation-delay:${i * 0.12}s">
      <span class="s">${ic(r.kind === 'chest' ? 'gift' : r.kind === 'medal' ? 'trophy' : 'star')}</span>눌러서 열기</button>`).join('')}</div>
    <button class="btn wide" id="nextBtn" style="max-width:420px">계속하기</button></div>`;
  confetti(boss ? 120 : 60); SFX.fanfare();
  setTimeout(() => Voice.phrase(boss ? 'boss' : rewards.some(r => r.kind === 'chest') ? 'chest' : 'done'), 500);
  screen.querySelectorAll('.reward').forEach(b => b.onclick = () => {
    const r = rewards[+b.dataset.i]; if (!b.classList.contains('closed')) return;
    b.classList.remove('closed'); SFX.pop(); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = 'pop .5s ease';
    if (r.kind === 'sticker') b.innerHTML = `<span class="s sticker">${r.s}</span>${r.isNew ? '새 스티커!' : '하나 더!'}`;
    else if (r.kind === 'medal') b.innerHTML = `<span class="medal big">${r.t === 'final' ? ic('trophy') : r.t}</span>${r.t === 'final' ? '졸업 메달' : r.t + '단 메달'}`;
    else b.innerHTML = `<span class="s sticker" style="font-size:44px">${r.items.map(x => x.s).join('')}</span>보물상자!`;
  });
  $('#nextBtn').onclick = () => {
    if (lesson.bolt || lesson.rush) return go('bolt');
    go('path');
  };
}

// ================= 지도 =================
let mapSel = null, mapMirror = false;
function renderMap() {
  const counts = { new: 0, learn: 0, green: 0, bolt: 0 };
  ALL.forEach(([a, b]) => counts[status(a, b)]++);
  let cells = '<div class="h">×</div>';
  for (let b = 1; b <= 12; b++) cells += `<div class="h">${b}</div>`;
  for (let a = 1; a <= 12; a++) {
    cells += `<div class="h">${a}</div>`;
    for (let b = 1; b <= 12; b++) {
      const st = status(a, b);
      const cls = ['c', st, a > b ? 'lower' : '', a === b ? 'diag' : '', mapSel && mapSel[0] === a && mapSel[1] === b ? 'sel' : '',
        mapSel && mapSel[0] === b && mapSel[1] === a && a !== b ? 'mir' : ''].join(' ');
      cells += `<button class="${cls}" data-a="${a}" data-b="${b}">${a * b}</button>`;
    }
  }
  const pct = n => (n / 144 * 100) + '%';
  screen.innerHTML = `
    <h2 class="title">구구단 지도</h2>
    <div class="card" style="margin-bottom:14px">
      <div class="row" style="justify-content:space-between;font-size:20px;margin-bottom:8px">
        <span>외운 문제 <b>${counts.green + counts.bolt}</b> / 144</span><span class="boltc">${ic('bolt', 'sm')} ${counts.bolt}</span></div>
      <div class="progress-big"><i style="width:${pct(counts.bolt)};background:var(--st-bolt)"></i><i style="width:${pct(counts.green)};background:var(--st-green)"></i><i style="width:${pct(counts.learn)};background:var(--st-learn)"></i></div>
      <div class="legend">
        <span><i style="background:var(--st-new)"></i>아직 (${counts.new})</span>
        <span><i style="background:var(--st-learn)"></i>배우는 중 (${counts.learn})</span>
        <span><i style="background:var(--st-green)"></i>외웠어 (${counts.green})</span>
        <span><i style="background:var(--st-bolt)"></i>번개 (${counts.bolt})</span></div>
    </div>
    <div class="mapwrap"><div class="grid ${mapMirror ? 'mirror' : ''}" id="grid">${cells}</div></div>
    <div class="row" style="margin-top:14px;flex-wrap:wrap">
      <button class="btn ${mapMirror ? '' : 'ghost'}" id="mirBtn">${ic('mirror')} 짝꿍 찾기</button></div>
    ${mapMirror ? `<div class="tip">${ic('mirror')}<span>${MIRROR_TIP}<br>대각선을 기준으로 거울처럼 같아서, 144개 중에 정말 다른 문제는 <b>78개</b>뿐이에요!</span></div>` : ''}
    <div class="note" style="margin-top:10px">칸을 누르면 들을 수 있어요. 노란 번개 칸은 3초 안에 바로 맞힌 문제예요.</div>`;
  screen.querySelectorAll('.grid .c').forEach(c => c.onclick = () => {
    const a = +c.dataset.a, b = +c.dataset.b; mapSel = [a, b];
    const st = status(a, b), f = S.facts[key(a, b)];
    const label = { new: '아직 안 만났어요', learn: '배우는 중이에요', green: '외웠어요', bolt: '번개처럼 바로 나와요' }[st];
    Voice.fact(a, b);
    renderMap();
    sheet(`<div class="sheet-eq">${a} × ${b} = ${a * b}</div>
      ${S.settings.deSub ? `<div class="sub">${a} mal ${b} ist ${a * b}</div>` : ''}
      <div class="stlabel ${st}">${label}</div>
      ${a !== b ? `<div class="sub">짝꿍: ${b} × ${a} = ${a * b}</div>` : ''}
      ${arrayDots(a, b, a * b > 60)}
      ${f && f.seen ? `<div class="note">만난 횟수 ${f.seen}번</div>` : ''}
      <div class="row" style="width:100%"><button class="btn ghost grow" id="sAgain">${ic('sound')} 다시 듣기</button><button class="btn grow" id="sClose">닫기</button></div>`);
    $('#sAgain').onclick = () => Voice.fact(a, b);
    $('#sClose').onclick = closeSheet;
  });
  $('#mirBtn').onclick = () => { mapMirror = !mapMirror; renderMap(); };
}

// ================= 번개 =================
function renderBolt() {
  const got = ALL.filter(([a, b]) => isGot(status(a, b)));
  const notBolt = got.filter(([a, b]) => status(a, b) === 'green');
  const learned = learnedFacts();
  const okBolt = got.length >= 4, okRush = learned.length >= 6;
  screen.innerHTML = `
    <h2 class="title">번개 모드</h2>
    <div class="hello"><div class="mascot">${koala()}</div><div class="bubble">외운 문제를 생각하지 않고도 <b>바로</b> 떠오르게 만드는 곳이야!</div></div>
    <div class="modes">
      <div class="card mode"><span class="e y">${ic('bolt')}</span><h3>번개 연습</h3>
        <div class="sub">외운 문제 10개를 3초 안에! 3초가 지나도 괜찮아, 천천히 맞혀도 돼.</div>
        <div class="sub">번개로 바꿀 수 있는 문제: <b>${notBolt.length}</b>개</div>
        <button class="btn ${okBolt ? '' : 'ghost'}" id="boltBtn" ${okBolt ? '' : 'disabled'}>${okBolt ? '시작!' : '문제를 4개 외우면 열려요'}</button></div>
      <div class="card mode"><span class="e c">${ic('guitar')}</span><h3>60초 챌린지</h3>
        <div class="sub">60초 동안 몇 개나 맞힐 수 있을까? 내 기록을 깨 봐!</div>
        <div class="sub">내 최고 기록: <b>${S.best60}</b>개</div>
        <button class="btn ${okRush ? '' : 'ghost'}" id="rushBtn" ${okRush ? '' : 'disabled'}>${okRush ? '도전!' : '단을 하나 만나면 열려요'}</button></div>
    </div>`;
  $('#boltBtn').onclick = () => startLesson({ kind: 'bolt', bolt: true, island: islandNow(), pool: notBolt.length >= 4 ? notBolt : got, target: 10, mix: { choice: 0, missing: 0 } });
  $('#rushBtn').onclick = () => startLesson({ kind: 'rush', rush: true, island: islandNow(), pool: learned, target: 999, mix: { choice: 0, missing: 0 } });
}

// ================= 스티커 북 =================
function renderBook() {
  const total = ISLANDS.reduce((n, i) => n + i.stickers.length, 0);
  const have = ISLANDS.reduce((n, i) => n + i.stickers.filter(s => S.stickers[s]).length, 0);
  const rot = s => ((s.codePointAt(0) * 37) % 21) - 10;
  let html = `<h2 class="title">스티커 북</h2><div class="sub" style="margin-bottom:12px">모은 스티커 ${have} / ${total}</div>`;
  html += `<div class="page card"><h3>메달</h3><div class="sgrid" style="padding:6px">
    ${ISLANDS.flatMap(i => i.tables).map(t => `<div class="slot" style="background:none"><span class="medal ${S.medals[t] ? '' : 'off'}">${t}</span></div>`).join('')}
    <div class="slot" style="background:none"><span class="medal ${S.medals.final ? '' : 'off'}">${ic('trophy')}</span></div></div>
    <div class="note">먹구름을 무지개로 바꾸면 그 단의 메달을 받아요.</div></div>`;
  ISLANDS.forEach(isl => {
    html += `<div class="page"><h3><span class="pg-ic" style="color:${isl.color}">${ic(isl.icon)}</span>${isl.name}</h3><div class="sgrid" style="background:${isl.soft}">
      ${isl.stickers.map(s => S.stickers[s]
        ? `<div class="slot"><span class="sticker" style="--r:${rot(s)}deg">${s}</span>${S.stickers[s] > 1 ? `<span class="n">×${S.stickers[s]}</span>` : ''}</div>`
        : '<div class="slot empty">?</div>').join('')}</div></div>`;
  });
  screen.innerHTML = html;
}

// ================= 설정 =================
function renderSettings() {
  const st = S.settings;
  const seg = (name, opts) => `<div class="seg" data-k="${name}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(st[name]) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  screen.innerHTML = `<h2 class="title">설정</h2>
  <div class="set">
    <div class="card set"><label>읽어주는 목소리</label>${seg('voice', [['ko', '한국어'], ['de', 'Deutsch'], ['both', '둘 다']])}
      <button class="btn ghost" id="testV">들어보기: 7 × 8</button>
      <div class="note">한국어는 구구단 리듬("칠팔, 오십육")으로 읽어요.<br>
      독일어는 미리 녹음한 자연스러운 목소리예요. 한국어 녹음 파일이 없으면 탭의 기본 목소리로 읽어요.
      (지금 한국어 기본 목소리: ${Voice.voiceName('ko')})<br>
      더 자연스럽게 하려면: 탭 <b>설정 → 일반 → 글자 읽어주기(TTS) → 기본 엔진</b>을 <b>Google 음성 인식 및 합성</b>으로 바꿔 보세요.</div></div>
    <div class="card set"><label>소리</label>${seg('sound', [[true, '목소리 켜기'], [false, '끄기']])}${seg('sfx', [[true, '효과음 켜기'], [false, '끄기']])}</div>
    <div class="card set"><label>독일어 글자 같이 보기 (3 mal 4)</label>${seg('deSub', [[true, '보기'], [false, '숨기기']])}</div>
    <div class="card set"><label>코알라 이름</label><input type="text" id="nameIn" maxlength="10" value="${uniName()}"></div>
    <div class="card set"><label>부모님용</label>${seg('unlockAll', [[false, '순서대로 열기'], [true, '모든 단계 열기']])}
      <button class="btn ghost" id="resetBtn">기록 모두 지우기</button>
      <div class="note">기록은 이 기기(브라우저)에만 저장돼요.</div></div>
  </div><div style="height:20px"></div>`;
  screen.querySelectorAll('.seg').forEach(g => g.querySelectorAll('button').forEach(b => b.onclick = () => {
    const v = b.dataset.v; st[g.dataset.k] = v === 'true' ? true : v === 'false' ? false : v;
    save(); SFX.tap(); renderSettings();
  }));
  $('#testV').onclick = () => Voice.fact(7, 8);
  $('#nameIn').onchange = e => { st.name = e.target.value.trim() || '코코'; save(); };
  $('#resetBtn').onclick = () => {
    if (confirm('지안이의 모든 기록과 스티커를 지울까요? 되돌릴 수 없어요.')) {
      const keep = S.settings; localStorage.removeItem(STORE); S = load(); S.settings = keep; save(); go('path');
    }
  };
}

// ================= 시작 =================
history.replaceState({ s: 'path' }, '');
go('path', false);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(reg => {
    // 오프라인용으로 음성 파일을 한 번 받아 둔다
    if (localStorage.getItem('audio-cached') === '1' || !reg.active) return;
    const files = [];
    ['ko', 'de'].forEach(l => { ALL.forEach(([a, b]) => files.push(`audio/${l}/${key(a, b)}.mp3`)); Object.keys(PHRASES[l]).forEach(p => files.push(`audio/${l}/${p}.mp3`)); });
    reg.active.postMessage({ type: 'cache-audio', files });
    localStorage.setItem('audio-cached', '1');
  }).catch(() => { /* 오프라인 기능 없이도 동작 */ });
}
