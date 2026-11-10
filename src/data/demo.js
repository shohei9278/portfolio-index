export const eventDemoUrl = "https://event-operations-demo.vercel.app/";

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
