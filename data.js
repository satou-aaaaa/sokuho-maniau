// 速報まにあう？の問題を作る（ブラウザと node の両方で使う）。
// 中身は、気象庁「緊急地震速報の仕組み」「緊急地震速報の特性や限界」に書いてあることと、それをもとにした目安の計算だけ
// （2026-11-27 に読んだ。要点は共有フォルダ games/sokuho-maniau-research.md）。
// 計算（目安。気象庁の計算方法ではない）：直線の距離 R = √(距離² + 深さ²)。強いゆれ（S波・秒速約4km）は R÷4 秒後。
// 速報は、震源の真上の地震計に P波（秒速約7km）が届く 深さ÷7 秒後に、解析と伝達の 4 秒（「数秒程度」）を足した時刻に届く。
// 余裕 = R÷4 −（深さ÷7 ＋ 4）。1秒より小さいときは「間に合わない」（0〜1秒のあいだと、−0.5〜0秒の境目の問題は出さない）。
// 1問は、深さと距離を見て余裕（秒）を選ぶ（正解したら2段目「この深さの壁は？」）か、速報の決まりの問いに答える。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回し・まちがいの選び肢は、足すだけでも過去の日の問題が変わる（選ぶ範囲が変わるため）。公開したあとは変えず、変えるときは qa/run.mjs の PINS を作り直して PR に理由を書く。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    shikumi: ["気象庁「緊急地震速報の仕組み」", "https://www.jma.go.jp/jma/kishou/know/jishin/eew/shikumi/shikumi.html"],
    tokusei: ["気象庁「緊急地震速報の特性や限界」", "https://www.jma.go.jp/jma/kishou/know/jishin/eew/shikumi/tokusei.html"],
  };
  // 計算の数（目安）
  const VP = 7, VS = 4, PROC = 4;
  const r1 = (x) => Math.round(x * 10) / 10;
  // 深さ h km・震源の真上の地点から d km の町の時刻（秒）
  function calc(d, h) {
    const R = Math.sqrt(d * d + h * h), s = R / VS, a = h / VP + PROC;
    return { R, s, a, y: s - a };
  }
  const NO = "間に合わない";
  const lab = (y) => (y < 1 ? NO : `約${Math.round(y)}秒`);
  const ok = (y) => y >= 1 || y <= -0.5; // 境目（−0.5〜1秒）は出さない
  // 壁（余裕が0になる、真上の地点からの距離）。無ければ 0
  function wall(h) { const R = VS * (h / VP + PROC); return R > h ? Math.sqrt(R * R - h * h) : 0; }

  // 2段目「この深さで、速報が間に合わない『壁』は？」の4つ（真上の地点からの距離。目安）
  const GROUPS = {
    w20: { name: "約20km", sub: "そこより近いと間に合わない" },
    w15: { name: "約15km", sub: "そこより近いと間に合わない" },
    w50: { name: "約50km", sub: "そこより近いと間に合わない" },
    none: { name: "壁なし", sub: "真上の町でも間に合う" },
  };
  const GRP_WHY = {
    w20: "深さ20kmまでの浅い地震では、震源の真上から約20kmより近いと速報が間に合いません（目安）。これが「20キロの壁」です。",
    w15: "深さ30kmでは壁は約15km。震源が深いと、ゆれが届くまで時間がかかり、壁はせまくなります（目安）。",
    w50: "",
    none: "深さ50kmより深いと、真上の町でもゆれより先に速報が届きます（目安）。ただし余裕はわずかです。",
  };
  const grpOf = (h) => (h <= 20 ? "w20" : h <= 30 ? "w15" : "none");

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end
  const MEDIA = { jishin: "地震のようす", kimari: "速報の決まり", genkai: "速報の限界" };

  // 余裕の選び肢：答えと、よくある計算ちがい（解析の時間を忘れる・深さを忘れる・P波で計算・ゆれの時刻そのまま）と「間に合わない」。
  // 数の選び肢どうしは2秒以上はなす。やさしいは3つ、ほかは4つ
  function options(R, d, h, n) {
    const c = calc(d, h), ans = lab(c.y), num = (t) => (t === NO ? null : +t.replace(/\D/g, ""));
    const mist = [c.s - h / VP, d / VS - PROC, c.R / VP - h / VP - PROC, c.s].map(lab);
    const base = ans === NO ? 3 : Math.round(c.y);
    const offs = [base + 3, base + 5, base - 3, base + 8, base - 5, base + 11].filter((x) => x >= 1).map((x) => `約${x}秒`);
    const pool = [...(ans === NO ? [] : [NO]), ...shuffle(R, mist), ...shuffle(R, offs)];
    const out = [ans];
    for (const t of pool) {
      if (out.length >= n) break;
      if (out.includes(t)) continue;
      const v = num(t);
      if (v !== null && out.some((o) => num(o) !== null && Math.abs(num(o) - v) < 2)) continue;
      out.push(t);
    }
    return out;
  }
  const place = (d) => (d === 0 ? "町は震源の真上" : `町は震源の真上から${d}km`);
  const SIT = [
    (d, h) => `深さ${h}kmの地震。${place(d)}。速報は強いゆれに間に合う？ 余裕は何秒？`,
    (d, h) => `震源の深さ${h}km。${place(d)}。強いゆれまでの余裕は？`,
    (d, h) => `${place(d)}、深さ${h}km。速報が届いてから、ゆれまで何秒？`,
  ];
  // 場面の問題。pts は [深さ, 距離] の組（境目の組は入れない）
  function scene(pts) {
    return (R, lv) => {
      const [h, d] = pts[ri(R, 0, pts.length - 1)], si = ri(R, 0, SIT.length - 1), c = calc(d, h), ans = lab(c.y);
      const opts = shuffle(R, options(R, d, h, lv === 0 ? 3 : 4));
      return {
        type: "act", media: MEDIA.jishin, q: SIT[si](d, h), opts, ans, rev: false, v: `${h}.${d}.${si}`, sim: { d, h }, grp: grpOf(h),
        name: `深さ${h}km・${d}km：${ans}`,
        look: `震源からまっすぐの距離は約${Math.round(c.R)}km。S波は秒速約4kmです。`,
        key: `速報は約${r1(c.a)}秒後（深さ÷7＋4）、ゆれは約${r1(c.s)}秒後（距離÷4）。`,
        why: `直線で約${Math.round(c.R)}km。ゆれ（S波）は約${r1(c.s)}秒後、速報は約${r1(c.a)}秒後。${ans === NO ? "速報はゆれに間に合いません" : `余裕は${ans}です`}（目安）。`,
      };
    };
  }
  // 組を作る：深さの並び × 距離の範囲（step きざみ）から、条件 f に合い境目でない組
  function grid(hs, d0, d1, step, f) { const out = []; for (const h of hs) for (let d = d0; d <= d1; d += step) { const y = calc(d, h).y; if (ok(y) && (!f || f(y, d, h))) out.push([h, d]); } return out; }
  const T = (id, lv, name, look, pts) => ({ id, lv, a: 0, ans: "", grp: "scene", col: "jishin", name, look, key: "", why: "", src: ["shikumi", "tokusei"], make: scene(pts), pts });

  // 決まりの問題。ans：答え、ws：まちがいの選び肢の候補（やさしいは2つ、ほかは3つ使う）、sit：問いの言い方
  function fact(col, sit, ans, ws) {
    return (R, lv) => {
      const si = ri(R, 0, sit.length - 1), ds = pickN(R, ws, lv === 0 ? 2 : 3);
      return { type: "fact", media: MEDIA[col], q: sit[si], opts: shuffle(R, [ans, ...ds]), ans, rev: false, v: `${si}:${ds.map((x) => ws.indexOf(x)).join(".")}` };
    };
  }
  const F = (id, lv, col, src, name, look, key, why, sit, ans, ws) => ({ id, lv, a: -1, ans, grp: null, col, name, look, key, why, src: [src], make: fact(col, sit, ans, ws) });

  const KINDS = [
    // ---- やさしい ----
    T("tooi", 0, "浅い地震・遠い町", "遠いほど、ゆれは遅れて届きます。", grid([10], 40, 150, 5)),
    T("chikai", 0, "浅い地震・すぐ近くの町", "震源のすぐ近くです。", grid([10], 0, 12, 1)),
    F("pspeed", 0, "kimari", "shikumi", "P波は秒速約7km", "先に届く、速い波です。", "P波は秒速約7km、S波は秒速約4kmで伝わります。",
      "気象庁の説明では、地震波のうち速く伝わるP波は秒速約7km。おそいけれど揺れの強いS波は秒速約4kmです。",
      ["先に届くP波の伝わる速さは？", "地震波のうち速いほうのP波。速さは秒速どのくらい？", "P波は秒速約何km？"], "秒速約7km", ["秒速約4km", "秒速約1km", "秒速約340m", "秒速約100km", "秒速約30万km"]),
    F("sspeed", 0, "kimari", "shikumi", "S波は秒速約4km", "P波よりおそい波です。", "S波は秒速約4km。P波（秒速約7km）よりおそく、揺れは強い。",
      "気象庁の説明では、S波はP波よりおそい秒速約4kmで伝わり、揺れは強い波です。",
      ["強い揺れを起こすS波の伝わる速さは？", "あとから届くS波。速さは秒速どのくらい？", "S波は秒速約何km？"], "秒速約4km", ["秒速約7km", "秒速約1km", "秒速約340m", "秒速約40km", "秒速約30万km"]),
    F("tsuyoi", 0, "kimari", "shikumi", "揺れが強いのはS波", "あとから来る波です。", "P波は速く、S波はおそいが揺れは強い。",
      "気象庁の説明では、P波は速く伝わり、S波はそれよりおそいけれど揺れは強い波です。速報はS波の前に知らせるためのものです。",
      ["P波とS波。揺れが強いのはどっち？", "強い揺れを起こすのは、どの波？", "速報が先回りしたい、揺れの強い波は？"], "S波（あとから届く波）", ["P波（先に届く波）", "どちらも同じ強さ", "音の波", "光の波"]),
    // ---- ふつう ----
    T("naka", 1, "浅い地震・中くらいの町", "壁の外がわです。距離と深さの両方を使います。", grid([10, 20], 24, 60, 2)),
    T("fuka30", 1, "深さ30kmの地震", "深いと、ゆれが届くまで時間がかかります。", grid([30], 0, 80, 4)),
    T("haruka", 1, "浅い地震・はるかに遠い町", "とても遠い町です。", grid([10, 20, 30], 100, 200, 10)),
    T("chikai20", 1, "深さ20km・近くの町", "壁の内がわです。", grid([20], 0, 14, 1)),
    F("kaiseki", 1, "kimari", "shikumi", "解析と伝達に数秒程度", "0秒ではありません。", "速報は、解析や伝達に一定の時間（数秒程度）がかかります。",
      "気象庁の説明では、速報には解析や伝達に一定の時間（数秒程度）がかかります。そのため震源に近い所では間に合いません。",
      ["速報の解析や伝達にかかる時間は？", "P波をとらえてから速報が届くまでにかかる時間（気象庁の説明）は？", "速報の計算と伝達。かかる時間はどのくらい？"], "数秒程度", ["0秒（すぐ）", "数十分程度", "数時間程度", "1日程度", "いつも1分ちょうど"]),
    F("genri", 1, "genkai", "tokusei", "震源に近い所では間に合わない", "時間の計算を思い出しましょう。", "震源に近い場所では、速報が強い揺れの到達に原理的に間に合いません。",
      "気象庁の説明では、解析や伝達に数秒程度かかるため、内陸の浅い地震などでは震源に近い場所への速報が原理的に間に合いません。",
      ["速報が強い揺れに原理的に間に合わないのは、どんな場所？", "気象庁が「原理的に間に合わない」と書いているのは？", "速報がゆれより後になりやすいのは？"], "震源に近い場所", ["震源から遠い場所", "海ぞいの町だけ", "高い建物の中だけ", "都会の町だけ", "山の上だけ"]),
    F("mijikai", 1, "genkai", "tokusei", "余裕は数秒から数十秒程度", "とても短い時間です。", "発表から強い揺れまでは、数秒から長くても数十秒程度です。",
      "気象庁の説明では、速報を発表してから強い揺れが届くまでの時間は、数秒から長くても数十秒程度と極めて短いです。",
      ["速報の発表から強い揺れまでの時間は、一般にどのくらい？", "速報が届いてから強い揺れまで。気象庁の説明では？", "速報のあとの余裕は、ふつうどのくらい？"], "数秒から長くても数十秒程度", ["数分から数十分程度", "1時間ほど", "半日ほど", "いつも1分以上", "いつも10分以上"]),
    F("kenchi", 1, "kimari", "shikumi", "震源近くでとらえたP波で計算", "先に届く波を使います。", "速報は、震源付近でP波を検知した地震計のデータを解析して計算します。",
      "気象庁の説明では、震源付近でP波を検知した地震計のデータを解析し、震源・規模・揺れの強さを計算します。",
      ["速報は、何をとらえて計算を始める？", "気象庁が速報の計算に使うのは？", "速報のもとになるデータは？"], "震源付近の地震計がとらえたP波", ["遠くの町に届いたS波", "津波の高さ", "空の雲の動き", "テレビの映像", "人からの電話"]),
    // ---- むずかしい ----
    T("kabe", 2, "20キロの壁ぎわ", "壁のすぐ内か外かです。1秒の差を見ます。", grid([10, 20], 12, 30, 1, (y) => y < 4)),
    T("fukai", 2, "深い地震", "深い震源から、ゆれは長い道のりを来ます。", grid([50, 60, 80, 100], 0, 60, 5)),
    T("kabe30", 2, "深さ30kmの壁ぎわ", "深さ30kmの壁は、浅い地震より近くです。", grid([30], 6, 24, 1, (y) => y < 4)),
    F("shinpatsu", 2, "genkai", "tokusei", "深い地震は離れた所で大きく揺れることも", "深さ100km程度より深い地震の話です。", "深発地震では、震源の真上より離れた場所で揺れが大きくなることがあります。",
      "気象庁の説明では、深発地震（深さ100km程度より深い）では、プレートに沿って地震波が伝わりやすく、真上より離れた所で揺れが大きくなることがあります。",
      ["深さ100km程度より深い地震で起こりうることは？", "深発地震の揺れについて、気象庁の説明は？", "とても深い地震。揺れが大きくなることがあるのは？"], "真上より離れた所で揺れが大きくなる", ["揺れがまったく起きない", "真上だけが揺れる", "P波がS波よりおそくなる", "速報がいつも1分前に届く"]),
    F("gosa", 2, "genkai", "tokusei", "予想震度には±1階級程度の誤差", "短い時間のデータで予想します。", "予想震度は±1階級程度の誤差を伴うことがあります。",
      "気象庁の説明では、少ない観測点の短い時間のデータから予想するため、予想震度は±1階級程度の誤差を伴うことがあります。",
      ["速報の予想震度の誤差は、どのくらいのことがある？", "予想震度と本当の震度。ずれはどのくらいありうる？", "気象庁の説明で、予想震度の誤差は？"], "±1階級程度", ["誤差は無い", "±5階級程度", "±10階級程度", "いつも2階級大きい"]),
    F("hakai", 2, "genkai", "tokusei", "M8の破壊は約100秒続く", "M6クラスでは約10秒です。", "断層のずれ破壊の時間の目安は、M6クラスで約10秒、M8クラスで約100秒。",
      "気象庁の説明では、断層面のずれ破壊が始まって終わるまでの目安はM6クラスで約10秒、M8クラスで約100秒。大きい地震ほど規模の推定に時間がかかります。",
      ["M8クラスの地震で、断層のずれ破壊が始まって終わるまでの目安は？", "マグニチュード8クラス。ずれ破壊の時間の目安は？", "M6は約10秒。ではM8クラスの破壊の時間は？"], "約100秒", ["約1秒", "約10秒", "約1000秒", "約1時間"]),
    F("toi", 2, "genkai", "tokusei", "観測網から遠い地震は誤差が大きいことも", "100km程度より遠い所の話です。", "観測網から遠い（100km程度以遠）地震では、推定の誤差が大きくなる可能性があります。",
      "気象庁の説明では、地震観測網から比較的遠い場所（100km程度以遠）の地震では、震源や規模の推定の誤差が大きくなる可能性があります。",
      ["地震観測網から遠い所（100km程度以遠）の地震では？", "沖の遠くで起きた地震。速報の推定について気象庁の説明は？", "観測点から100km程度より遠い地震で気をつけることは？"], "震源や規模の推定の誤差が大きくなりうる", ["速報がいつもより早く届く", "推定の誤差が無くなる", "S波が速くなる", "揺れが必ず小さくなる"]),
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  // 1問を作る。tag は「種類|種」（例 "naka|2026-11-27:d2"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null;
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    const P = { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, grp: null, src: k.src.map((s) => SRC[s]), ...p };
    P.gwhy = P.grp ? GRP_WHY[P.grp] : "";
    return P;
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const SKH = { KINDS, BY, GROUPS, GRP_WHY, LV, SRC, MEDIA, VP, VS, PROC, NO, calc, lab, wall, grpOf, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = SKH; else root.SKH = SKH;
})(typeof self !== "undefined" ? self : this);
