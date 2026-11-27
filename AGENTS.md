# AGENTS.md

速報まにあう？：震源の深さと距離を見て、緊急地震速報と強いゆれ（S波）のどちらが先に届くか・余裕は何秒かを当てる1日5問の学習ゲーム（防災シリーズ BS1。核の一言「20キロの壁」）。正解したら、その深さで速報が間に合わない「壁」も選ぶ。速報の決まりの問題も出る。「ためす」で距離と深さを動かして壁をさがせる。`index.html` と `data.js`（問題の種類と目安の計算）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 問題（20種類×3000問：選び肢・答えは1つ・答えと2段目が目安の計算どおり・20キロの壁・検算・出典）・今日の5問と上級（3年分）・とことん・通しで遊ぶ・続きから・2段目・復習・ためす・線の図・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 中身は気象庁「緊急地震速報の仕組み」<https://www.jma.go.jp/jma/kishou/know/jishin/eew/shikumi/shikumi.html> と「緊急地震速報の特性や限界」<https://www.jma.go.jp/jma/kishou/know/jishin/eew/shikumi/tokusei.html> に書いてあることと、それをもとにした目安の計算だけ（2026-11-27 に読んだ。要点は共有フォルダ games/sokuho-maniau-research.md）。決まりの問題を足すときもページを読み、`qa/run.mjs` の `FACT` にも足す。
- 計算（目安。気象庁の計算方法ではない）：余裕 ＝ √(距離²＋深さ²)÷4 −（深さ÷7＋4）。P波 秒速約7km・S波 秒速約4km・解析と伝達 4秒（「数秒程度」）。1秒より小さければ「間に合わない」。−0.5〜1秒の境目の組は問題に出さない。式は `qa/run.mjs` で別に書いて検算する。数を変えるときは「くわしく」「このゲームについて」・README・出典メモもそろえる。
- 言い方：遊び方と「このゲームについて」と README に、秒の計算は目安であること・問題の地震は練習のための例で本物の地震の記録ではないことを置く（QA が見る）。猶予を言い切らない（気象庁は具体的な猶予時間を発表しない）。速報を見聞きしたら、まず身を守ることを「このゲームについて」に置く。
- 問題は2つの形。場面の問題（深さと距離）は「間に合わない」か「約N秒」から選び、正解したら2段目でその深さの壁（約20km・約15km・約50km・壁なし）を選ぶ。やさしいは選び肢3つ、ほかは4つ。まちがいの選び肢は、よくある計算ちがい（解析の時間を忘れる・深さを忘れる・P波で計算・ゆれの時刻そのまま）から作る。決まりの問題は答え1つとまちがい2〜3つで、2段目は無い。2回目のヒントはまちがいを消して2つにしぼり、要点（`key`）も見せる。
- 今日の5問（やさしい2・ふつう2・むずかしい1、種類は重ねない）・上級（むずかしい3、今日のむずかしいと別）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。乱数は `sort` の比較の中で引かない。`KINDS`・言い回し・まちがいの選び肢は、足すだけでも過去の日の問題が変わる。公開後は変えず、変えるときは QA の `PINS`（3日分の5問と上級）を作り直して理由を PR に書く。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。上級はヒントなし。時間制限なし（「ためす」の線の伸びも時間制限ではない。「動きを減らす」では伸ばさない）。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。とことん（`runs.e`）はまちがえても続き、「ここで降りる」で終わる。「ためす」は記録に入れない。
- 1問を深くする：`depth.js` と `qa/depth-check.mjs` は shared-workflows `template/` の写しで、ここでは直さない。自信あり・2段目「この深さの壁は？」・復習（1→3→7日後）。記録 `skh-v1`・文字 `skh-fs`・復習 `skh-depth`。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答えを出さない。感想は Issue フォーム（`.github/ISSUE_TEMPLATE/feedback.yml`）を開くだけ。応援は Ko-fi へのただのリンクだけ。
- 外へ通信しない（CSP の `connect-src 'self'` を広げない）。見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）と引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は風力階級よみ（fuuryoku-yomi）から写した（ひな形の部品は `node scripts/new-game.mjs` で入れた）。写し元の言葉が残っていないかを QA が見る。保存の読み直しは共通部品 GameStore（`<!-- store:begin -->`〜`end`。shared-workflows `template/store/store.js` の写しで、ここでは直さない）。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- 画面のあるページは、目的ごとに `screens.js`（shared-workflows の `template/screens/screens.js`）で # の画面に分け、1ページに全部を積まない（`routines/ui-rules.md` U10〜U12）。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
