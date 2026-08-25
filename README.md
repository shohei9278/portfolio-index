# Portfolio Index

公開中の個人開発プロダクトと、実務で作成した業務ツールの公開用デモを一覧で見せるReact/Viteポートフォリオハブです。

## 公開URL

- フロント: https://portfolio-index-ten.vercel.app/
- GitHub: https://github.com/shohei9278/portfolio-index

## 掲載プロジェクト

- AI Job Dashboard
  - 公開URL: https://ai-job-dashboard-plum.vercel.app/
  - GitHub: https://github.com/shohei9278/ai-job-dashboard
- TechScope AI
  - 公開URL: https://techscope-ai.vercel.app/
  - GitHub: https://github.com/shohei9278/techscope-ai
- 添付PDFから定型バナーを自動生成
  - フロント: https://event-operations-demo.vercel.app/
  - バックエンド: https://event-operations-demo.onrender.com/
  - GitHub: https://github.com/shohei9278/event-operations-demo
  - 内容: 添付PDFを解析し、決まったバナーフォーマットへ日時、形式、講演タイトル、登壇者を自動で流し込む流れを再現

## 見てほしいポイント

- AI Job Dashboard: データ収集、分析、AIコメント、ダッシュボードUIを含むフルスタック構成
- TechScope AI: 学習ログ、記事推薦、日報ドラフト生成をつなぐAI活用プロダクト
- 添付PDFから定型バナーを自動生成: 実務で作成したツールを匿名サンプル化し、メール起票から納品ZIP作成までの流れを再現
- 各カードから公開URLとGitHubを確認できるため、画面の動きと実装内容をセットで見られます。

## About

Reactの画面設計、API連携、データ保存、PDFや画像生成まわりの自動化を組み合わせて、手作業で繰り返していた業務を使える形へ落とし込むことを重視しています。

## 公開用の配慮

- 会社名、実メール本文、実在する個人名、絶対ローカルパスは掲載しません。
- 実務制作ツールは、サンプルPDFと匿名データで処理の流れだけを再現しています。
- 機密情報に該当しそうなデータはリポジトリへ含めず、デモ用の固定データに置き換えています。

## アクセス確認

Vercel Web Analyticsを導入しています。Vercel DashboardでこのプロジェクトのAnalyticsを有効化すると、ページビュー、参照元、閲覧ページを確認できます。
作品リンク、GitHubリンク、デモ切り替えはカスタムイベントとして記録します。

## 起動

```bash
npm install
npm run dev
```

一覧は `http://127.0.0.1:5180/` で表示できます。

リンク先の変更は `src/data/projects.js` の `links` を編集してください。
