# 中原 翔平 ポートフォリオ

個人開発と業務ツールの開発について、課題、考えたこと、判断、結果、まだできていないことをまとめたサイトです。React と Vite で作っています。

- 公開URL: https://portfolio-index-ten.vercel.app/
- トップのほかに、作品ごとのページが `/work/<slug>` にあります。

## 掲載している作品

| 作品 | ページ |
|---|---|
| AI Product Lab | `/work/ai-product-lab` |
| AI Job Dashboard | `/work/ai-job-dashboard` |
| TechScope AI | `/work/techscope-ai` |
| 申請書から制作物を展開する案件管理 | `/work/case-management`（デモ: `/demo/case-management`） |
| 形式の違うPDFの読み取りと照合 | `/work/pdf-check`（デモ: `/demo/pdf-check`） |
| Veeva CRM 上の業務ツール開発 | `/work/crm-tools`（概要のみ） |

## 内容を直すとき

文章と数字は `src/data/cases.js` にまとめています。

- 確かめられる事実だけを書きます。実績や数字は作りません。
- AI Product Lab の数字は手で写したものです。更新するときは `LAB_AS_OF` と `labStats` を一緒に直してください。最新の数字は https://ai-lab-dashboard-production-fc9e.up.railway.app/showcase で確かめられます。
- AI Product Lab では、人とAIの役割を `/interventions` の説明に合わせます。
- AI Job Dashboard の `notice` は、毎日の収集が再開したら消してください。TechScope AI の `notice` は、データベースを再開したら消してください。
- `public/works/` の画像は、2026年11月10日に撮影した実際の画面です。

## 公開用の配慮

- 実務のツールについて、会社名、実メールの本文、実在する個人名、ローカルのパスは載せません。
- 実務をもとにしたデモは、実務のコードを流用せず、架空のサンプルだけで新しく作っています。
- デモはブラウザの中だけで動き、PDFや入力内容をサーバーへ送りません。

## 起動

```bash
npm install
npm run dev
```

`http://127.0.0.1:5180/` で表示できます。

## デプロイ

Vercel の GitHub 連携で動いています。main に入ると本番に反映されます。変更はブランチで作業してPRにし、動作確認のあとにマージします。
`vercel.json` は、作品ページのURLを直接開いても表示できるようにする設定です。

## アクセス確認

Vercel Web Analytics を入れています。作品のリンクやデモの切り替えはカスタムイベントとして記録します。
