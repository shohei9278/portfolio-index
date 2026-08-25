# Portfolio Index

公開中の個人開発プロダクトと、実務で作成した業務ツールの公開用デモを一覧で見せるReact/Viteポートフォリオハブです。

## 公開URL

- フロント: https://portfolio-index-ten.vercel.app/
- GitHub: https://github.com/shohei9278/portfolio-index

## 掲載プロジェクト

- AI Job Dashboard
  - 公開URL: https://ai-job-dashboard-plum.vercel.app/
  - GitHub: https://github.com/shohei9278/ai-job-dashboard
  - ローカルソース: `/Users/shoheinakahara/Dropbox/Mac/Desktop/案件/_repo/ai-job-dashboard`
- TechScope AI
  - 公開URL: https://techscope-ai.vercel.app/
  - GitHub: https://github.com/shohei9278/techscope-ai
  - ローカルソース: `/Users/shoheinakahara/Dropbox/Mac/Desktop/案件/_repo/techscope-ai`
- 添付PDFから定型バナーを自動生成
  - フロント: https://event-operations-demo.vercel.app/
  - バックエンド: https://event-operations-demo.onrender.com/
  - GitHub: https://github.com/shohei9278/event-operations-demo
  - ローカルソース: `/Users/shoheinakahara/Dropbox/Mac/Desktop/案件/_repo/event-operations-demo`
  - 内容: 添付PDFを解析し、決まったバナーフォーマットへ日時、形式、講演タイトル、登壇者を自動で流し込む流れを再現

## 起動

```bash
npm install
npm run dev
```

一覧は `http://127.0.0.1:5180/` で表示できます。

リンク先の変更は `src/data/projects.js` の `links` を編集してください。
