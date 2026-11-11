// 公開用デモの照合処理。実務のツールの考え方を、架空のデータで再現している。

export const SHEET_COLUMNS = [
  ["id", "ID"],
  ["title", "イベント名"],
  ["datetime", "日時"],
  ["url", "参加登録URL"],
  ["alt", "画像の代替テキスト"],
];

export const SHEET_ROWS = [
  {
    row: 12,
    id: "EV-0412",
    title: "第12回 サンプル技術セミナー",
    datetime: "2026/12/04 19:00-20:00",
    url: "https://example.com/events/0412",
    alt: "第12回 サンプル技術セミナー 12月4日開催",
  },
  {
    row: 13,
    id: "EV-0413",
    title: "サンプル開発者ミートアップ",
    datetime: "2027/01/22 18:30-19:30",
    url: "https://example.com/events/0413",
    alt: "サンプル開発者ミートアップ 1月22日開催",
  },
  {
    row: 14,
    id: "EV-0414",
    title: "春のサンプル勉強会",
    datetime: "2027/02/10 18:30-19:30",
    url: "https://example.com/events/0414",
    alt: "春のサンプル勉強会 2月10日開催",
  },
];

// 照合する画面。わざと違いを混ぜている
export const SCREENS = [
  {
    id: "documents",
    label: "文書管理システム",
    window: "documents/registration",
    idSource: "イベントID",
    fields: [
      { key: "id", label: "イベントID", value: "EV-0412" },
      { key: "title", label: "イベント名", value: "第12回 サンプル技術セミナー" },
      { key: "datetime", label: "日時", value: "2026/12/04 19:30-20:00" },
      { key: "url", label: "公開URL", value: "https://example.com/events/0412" },
    ],
  },
  {
    id: "mail",
    label: "テストメール",
    window: "mail/inbox",
    idSource: "件名",
    fields: [
      { key: "id", label: "件名", value: "【テストメール】EV-0413_サンプル開発者ミートアップ", extractId: true },
      { key: "alt", label: "画像の代替テキスト", value: "サンプル開発者ミートアップ　1月22日開催" },
      { key: "url", label: "本文のリンク", value: "https://example.com/events/0413/" },
    ],
  },
  {
    id: "editor",
    label: "配信ツール",
    window: "webcast/edit",
    idSource: "管理ID",
    fields: [
      { key: "id", label: "管理ID", value: "EV-0414" },
      { key: "title", label: "タイトル", value: "春のサンプル勉強会" },
      { key: "datetime", label: "開始・終了", value: "2027/02/10 18:30-19:30" },
      { key: "url", label: "登録ページ", value: "https://example.com/events/0414" },
    ],
  },
];

export function readId(field) {
  if (!field) return "";
  return field.extractId ? (field.value.match(/EV-\d{4}/)?.[0] ?? "") : field.value.trim();
}

// 文字単位の差分。どちらにしかない文字に印を付ける
export function diffChars(expected, actual) {
  const a = [...expected];
  const b = [...actual];
  const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const left = [];
  const right = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      left.push({ text: a[i], changed: false });
      right.push({ text: b[j], changed: false });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      left.push({ text: a[i], changed: true });
      i += 1;
    } else {
      right.push({ text: b[j], changed: true });
      j += 1;
    }
  }
  while (i < a.length) left.push({ text: a[i++], changed: true });
  while (j < b.length) right.push({ text: b[j++], changed: true });
  return { left, right };
}

export function checkScreen(screen, row) {
  return screen.fields.map((field) => {
    const actual = field.key === "id" ? readId(field) : field.value;
    const expected = row[field.key] ?? "";
    return {
      key: field.key,
      label: field.label,
      expected,
      actual,
      match: expected === actual,
    };
  });
}

export function findRowsById(id) {
  return SHEET_ROWS.filter((row) => row.id === id);
}
