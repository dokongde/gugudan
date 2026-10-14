#!/usr/bin/env python3
"""구구단 음성 파일 생성기.

앱은 audio/<lang>/<a>x<b>.mp3 와 audio/<lang>/<phrase>.mp3 를 먼저 재생하고,
파일이 없으면 기기 음성(speechSynthesis)으로 대신 읽는다.
그래서 이 스크립트로 만든 파일을 다른 엔진으로 만든 파일로 바꿔 넣어도 된다.

기본 엔진: sherpa-onnx (오프라인 신경망 TTS)
  pip install sherpa-onnx soundfile numpy   (+ ffmpeg 필요)
  모델: https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models
    de: vits-piper-de_DE-thorsten-high   (한국어 공개 모델은 품질이 낮아 지원 안 함)

  python3 tools/gen_audio.py --models <모델 폴더> --lang de [--only 3x7]

한국어(그리고 원하면 독일어도)는 엣지 신경망 음성으로 (무료, 인터넷 필요, 내 PC에서 실행):
  pip install edge-tts
  python3 tools/gen_audio.py --engine edge --lang ko
"""
import argparse, asyncio, json, os, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'audio')

# ---------- 한국어 숫자 / 구구단 리듬 ----------
KO_DIG = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

def ko_num(n):
    s = ''
    if n >= 100:
        s += ('' if n // 100 == 1 else KO_DIG[n // 100]) + '백'
        n %= 100
    if n >= 10:
        s += ('' if n // 10 == 1 else KO_DIG[n // 10]) + '십'
        n %= 10
    return s + KO_DIG[n]

def has_batchim(word):
    code = ord(word[-1]) - 0xAC00
    return code >= 0 and code % 28 != 0

def topic(word):
    return word + ('은' if has_batchim(word) else '는')

def ko_fact(a, b):
    """한 자리 × 한 자리는 구구단 리듬('삼칠 이십일', '이삼은 육'),
    10 이상이 끼면 '삼 곱하기 십일은 삼십삼'."""
    c = a * b
    if a <= 9 and b <= 9:
        head = ko_num(a) + ko_num(b)
        if c < 10:
            return f'{topic(head)} {ko_num(c)}'
        return f'{head}, {ko_num(c)}'
    return f'{ko_num(a)} 곱하기 {topic(ko_num(b))}, {ko_num(c)}'

# ---------- 독일어 숫자 ----------
DE_ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun',
           'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn',
           'achtzehn', 'neunzehn']
DE_TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']

def de_num(n):
    if n >= 100:
        rest = n % 100
        return 'einhundert' + (de_num(rest) if rest else '')
    if n < 20:
        return DE_ONES[n]
    t, o = divmod(n, 10)
    if o == 0:
        return DE_TENS[t]
    return ('ein' if o == 1 else DE_ONES[o]) + 'und' + DE_TENS[t]

def de_fact(a, b):
    return f'{de_num(a)} mal {de_num(b)} ist {de_num(a * b)}'

# ---------- 칭찬 / 안내 문구 (app.js 의 PHRASES 와 키가 같아야 함) ----------
PHRASES = {
    'ko': {
        'good1': '잘했어!', 'good2': '최고야!', 'good3': '대단해!', 'good4': '멋져!',
        'good5': '우와, 정말 잘한다!', 'good6': '딩동댕!',
        'oops1': '괜찮아, 다음에 또 만나자!', 'oops2': '거의 다 왔어!',
        'done': '레슨 끝! 스티커를 받았어!', 'boss': '먹구름이 무지개가 됐어!',
        'hello': '지안아 안녕! 오늘도 같이 해볼까?', 'chest': '보물상자를 찾았어!',
    },
    'de': {
        'good1': 'Super!', 'good2': 'Toll gemacht!', 'good3': 'Prima!', 'good4': 'Klasse!',
        'good5': 'Wunderbar!', 'good6': 'Richtig!',
        'oops1': 'Macht nichts, beim nächsten Mal!', 'oops2': 'Fast geschafft!',
        'done': 'Geschafft! Du bekommst einen Sticker!', 'boss': 'Die Wolke ist jetzt ein Regenbogen!',
        'hello': 'Hallo! Wollen wir zusammen üben?', 'chest': 'Du hast eine Schatzkiste gefunden!',
    },
}

def items(lang):
    for a in range(1, 13):
        for b in range(1, 13):
            yield f'{a}x{b}', (ko_fact if lang == 'ko' else de_fact)(a, b)
    for k, v in PHRASES[lang].items():
        yield k, v

# ---------- 엔진 ----------
def to_mp3(wav, mp3):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav,
                    '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,'
                           'silenceremove=start_periods=1:start_threshold=-50dB,areverse,'
                           'loudnorm=I=-16:TP=-1.5',
                    '-ac', '1', '-ar', '24000', '-b:a', '40k', mp3], check=True)

def sherpa_engine(models, lang):
    import sherpa_onnx, soundfile as sf
    if lang == 'ko':
        # 공개된 한국어 오프라인 모델(kss_low)은 알아듣기 어려워서 쓰지 않는다.
        sys.exit('한국어는 --engine edge 로 만들어 주세요 (또는 원하는 음성 파일을 audio/ko 에 넣기).')
    d = os.path.join(models, 'vits-piper-de_DE-thorsten-high')
    model, speed = 'de_DE-thorsten-high.onnx', 0.95
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=os.path.join(d, model), tokens=os.path.join(d, 'tokens.txt'),
            data_dir=os.path.join(d, 'espeak-ng-data'),
            noise_scale=0.5, noise_scale_w=0.6),
        num_threads=4))
    tts = sherpa_onnx.OfflineTts(cfg)

    def say(text, mp3):
        audio = tts.generate(text, sid=0, speed=speed)
        with tempfile.NamedTemporaryFile(suffix='.wav') as f:
            sf.write(f.name, audio.samples, audio.sample_rate)
            to_mp3(f.name, mp3)
    return say

def edge_engine(lang):
    import edge_tts
    voice = {'ko': 'ko-KR-SunHiNeural', 'de': 'de-DE-KatjaNeural'}[lang]

    def say(text, mp3):
        with tempfile.NamedTemporaryFile(suffix='.mp3') as f:
            asyncio.run(edge_tts.Communicate(text, voice, rate='-10%').save(f.name))
            to_mp3(f.name, mp3)
    return say

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--engine', choices=['sherpa', 'edge'], default='sherpa')
    ap.add_argument('--models', default='models')
    ap.add_argument('--lang', choices=['ko', 'de', 'all'], default='all')
    ap.add_argument('--only', help='이 키만 생성 (쉼표 구분, 예: 3x7,good1)')
    ap.add_argument('--print', action='store_true', help='문장만 출력')
    args = ap.parse_args()
    only = set(args.only.split(',')) if args.only else None
    for lang in (['ko', 'de'] if args.lang == 'all' else [args.lang]):
        todo = [(k, t) for k, t in items(lang) if not only or k in only]
        if args.print:
            for k, t in todo:
                print(lang, k, t)
            continue
        os.makedirs(os.path.join(OUT, lang), exist_ok=True)
        say = sherpa_engine(args.models, lang) if args.engine == 'sherpa' else edge_engine(lang)
        for i, (k, t) in enumerate(todo, 1):
            say(t, os.path.join(OUT, lang, k + '.mp3'))
            print(f'\r{lang} {i}/{len(todo)}', end='', file=sys.stderr)
        print(file=sys.stderr)

if __name__ == '__main__':
    main()
