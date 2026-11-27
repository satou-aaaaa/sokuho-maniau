// アプリのアイコン（icon-192.png・icon-512.png）を作る。紺の地に、震源の星から広がる波と、町へ先回りする速報の矢印。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#112f52"/>
      <rect y="58" width="100" height="42" fill="#5a4630"/><line x1="0" y1="58" x2="100" y2="58" stroke="#fdfdfb" stroke-width="3"/>
      <g fill="none" stroke="#f0a050" stroke-width="4"><path d="M10 64 a16 16 0 0 1 32 0"/><path d="M2 64 a24 24 0 0 1 48 0" opacity=".6"/></g>
      <path d="M26 70l3 6 6.5.7-4.8 4.4 1.3 6.4-6-3.3-6 3.3 1.3-6.4-4.8-4.4 6.5-.7z" fill="#e8473a" stroke="#fff" stroke-width="1.2"/>
      <path d="M70 58v-14l10-9 10 9v14z" fill="#fdfdfb"/>
      <path d="M24 28 H62" stroke="#fdfdfb" stroke-width="7" stroke-linecap="round"/><path d="M56 18 l12 10 -12 10" fill="none" stroke="#fdfdfb" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
