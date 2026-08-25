export const links = {
  portfolio: "https://portfolio-index-ten.vercel.app/",
  portfolioRepo: "https://github.com/shohei9278/portfolio-index",
  event: "https://event-operations-demo.vercel.app/",
  eventApi: "https://event-operations-demo.onrender.com/",
  eventRepo: "https://github.com/shohei9278/event-operations-demo",
  jobs: "https://ai-job-dashboard-plum.vercel.app/",
  jobsRepo: "https://github.com/shohei9278/ai-job-dashboard",
  techscope: "https://techscope-ai.vercel.app/",
  techscopeRepo: "https://github.com/shohei9278/techscope-ai",
};

export const projects = [
  {
    id: "jobs",
    group: "portfolio",
    title: "AI Job Dashboard",
    subtitle: "求人分析ダッシュボード",
    summary:
      "求人データを収集し、スキルトレンド、件数推移、個人分析、AIコメントまでまとめて可視化するフルスタックアプリ。",
    stack: ["React", "NestJS", "Prisma", "Python", "Supabase"],
    accent: "blue",
    icon: "AI",
    link: links.jobs,
    linkLabel: "公開サイト",
    repo: links.jobsRepo,
    readmeTitle: "README要約",
    readmePoints: [
      "求人情報を自動収集し、AIで要約、スキル抽出、市場分析コメントを生成。",
      "求人数推移、スキルトレンド、地域別分析をダッシュボードで可視化。",
      "スキルマッチ、ギャップ分析、年収シミュレーションなど個人分析も搭載。",
    ],
    architecture: "React / Vite / NestJS / Prisma / Supabase / Python",
    metrics: [
      ["Skill", "match"],
      ["Trend", "chart"],
      ["JWT", "auth"],
    ],
  },
  {
    id: "techscope",
    group: "portfolio",
    title: "TechScope AI",
    subtitle: "AI学習支援プラットフォーム",
    summary:
      "学習ログをAIが整理し、スキル抽出、記事推薦、日報ドラフトまでつなげる自己学習ループ型のプロダクト。",
    stack: ["Next.js", "NestJS", "Supabase", "OpenAI", "BullMQ"],
    accent: "green",
    icon: "TS",
    link: links.techscope,
    linkLabel: "公開サイト",
    repo: links.techscopeRepo,
    readmeTitle: "README要約",
    readmePoints: [
      "学習、記録、スキル抽出、記事推薦、日報作成をAIでつなぐ自己学習ループ。",
      "Qiita / Zennの記事収集と、OpenAIによる学習テーマ提案を連携。",
      "Supabaseに学習履歴、スキル、日報、推薦状態を保存。",
    ],
    architecture: "Next.js 15 / NestJS / Supabase / Redis + BullMQ / OpenAI",
    metrics: [
      ["AI", "recommend"],
      ["Daily", "report"],
      ["Skill", "update"],
    ],
  },
  {
    id: "integrated",
    group: "work-demo",
    title: "添付PDFから定型バナーを自動生成",
    subtitle: "実務制作ツールの公開用デモ",
    summary:
      "添付PDFを解析し、日時、形式、講演タイトル、登壇者を決まったバナーフォーマットへ自動で流し込むルーチンワーク自動化ツール。",
    stack: ["React", "FastAPI", "SQLite", "PDF extract", "PNG export"],
    accent: "coral",
    icon: "DM",
    demo: "ops",
    link: links.event,
    linkLabel: "デモを開く",
    repo: links.eventRepo,
    readmeTitle: "自動化したルーチンワーク",
    readmePoints: [
      "依頼メールの件名と添付PDFから、バナー制作案件を自動で起票。",
      "PDF内の日時、形式、演題、登壇者を抽出し、定型バナーの各枠へ流し込み。",
      "必要に応じて編集画面で微調整し、生成PNGと入稿データをZIP化。",
      "会社名、実メール、個人名は使わず、匿名サンプルPDFで実務に近い流れを再現。",
      `Backend API: ${links.eventApi}`,
    ],
    architecture: "React / FastAPI / SQLite / PDF preview / fixed-format banner / PNG + ZIP export",
    metrics: [
      ["Mail", "import"],
      ["PDF", "extract"],
      ["ZIP", "delivery"],
    ],
  },
];

export const opsSteps = [
  ["メール受信", "件名、本文、添付PDFを取り込む", "IN"],
  ["案件起票", "ボードと詳細画面にカードを作る", "PJ"],
  ["PDF解析", "日時、形式、演題、登壇者を抽出", "PDF"],
  ["定型バナー生成", "決まったレイアウトの各枠へ流し込む", "PNG"],
];

export const initialCards = [
  {
    id: "evt-145",
    title: "オンライン講演 素材一式",
    owner: "Design",
    status: "received",
    date: "04/22",
    outputs: 3,
  },
  {
    id: "evt-231",
    title: "地域セミナー 告知バナー",
    owner: "Ops",
    status: "missing",
    date: "04/24",
    outputs: 2,
  },
  {
    id: "evt-318",
    title: "配信後フォロー メール",
    owner: "Mail",
    status: "ready",
    date: "04/26",
    outputs: 4,
  },
  {
    id: "evt-402",
    title: "資料公開ページ更新",
    owner: "Web",
    status: "test",
    date: "04/27",
    outputs: 1,
  },
  {
    id: "evt-511",
    title: "月次レポート素材生成",
    owner: "Data",
    status: "ready",
    date: "04/30",
    outputs: 5,
  },
  {
    id: "evt-620",
    title: "終了済み素材アーカイブ",
    owner: "Ops",
    status: "done",
    date: "05/02",
    outputs: 2,
  },
];

export const boardColumns = [
  ["received", "受付", "gray"],
  ["missing", "確認待ち", "amber"],
  ["ready", "登録待ち", "blue"],
  ["test", "検証中", "purple"],
  ["done", "完了", "green"],
];

export const jobTrend = [73, 86, 92, 108, 119, 131, 126, 144];
