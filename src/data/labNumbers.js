import { useEffect, useState } from "react";

// AI Product Lab の数字は、実験の概要ページと同じ数え方の入口（ダッシュボードの /api/showcase/numbers）から読む。
// 読めないとき（止まっている・遅い・形が違う）は、LAB_AS_OF 時点に手で写した下の数字を出す。
// 手元で確かめるときは、VITE_LAB_NUMBERS_URL で手元のダッシュボードを指せる
const NUMBERS_URL = import.meta.env.VITE_LAB_NUMBERS_URL || "https://ai-lab-dashboard-production-fc9e.up.railway.app/api/showcase/numbers";

// 手で写した数字の日付。手で写した数字を直すときは、ここも直す
export const LAB_AS_OF = "2026年11月23日";

// 手で写した数字（LAB_AS_OF 時点）。入口と同じ形にしておく
const FALLBACK = {
  asOf: LAB_AS_OF,
  live: false,
  totals: { ideas: 204, projects: 40, published: 27, visits: 324, conversions: 19, aiCostJpy: 24276, perConversionJpy: 886 },
  autoPublish: { published: 16, reviewed: 7, bad: 0 },
  staff: [
    { id: "anthropic", candidates: 54, selected: 20, lean: "strict" },
    { id: "openai", candidates: 54, selected: 17, lean: "self" },
    { id: "google", candidates: 54, selected: 1, lean: "even" },
  ],
  improvements: { human: 120, aiDone: 40 },
  operations: [
    { label: "AIの提案を承認・却下", n: 35 },
    { label: "公開後に評価", n: 7 },
    { label: "公開を止めた", n: 0 },
    { label: "修正やデザインを指示", n: 28 },
    { label: "案件を保留にした", n: 16 },
    { label: "SNSに手で投稿・返信", n: 7 },
  ],
  // クラウドの Claude Code（ルーティン）の実績（ダッシュボードの src/lib/showcase.ts の showcaseRoutineStats）
  routines: { tools: 7, published: 4, autoPublished: 4, asked: 11, merged: 11, reviewed: 5, reviewAsked: 5, reviewMerged: 5 },
};

const isCount = (v) => Number.isFinite(v) && v >= 0;
const LEANS = ["self", "strict", "even", null];
const ROUTINE_KEYS = ["tools", "published", "autoPublished", "asked", "merged", "reviewed", "reviewAsked", "reviewMerged"];

// 入口の答えの形を確かめ、使う形にそろえる。おかしいところがあれば null（手で写した数字を出す）
function normalize(raw) {
  if (!raw || typeof raw !== "object") return null;
  const t = raw.totals ?? {};
  const totals = ["ideas", "projects", "published", "visits", "conversions", "aiCostJpy"].every((k) => isCount(t[k])) ? t : null;
  const a = raw.autoPublish ?? {};
  const autoPublish = ["published", "reviewed", "bad"].every((k) => isCount(a[k])) ? a : null;
  const staff = Array.isArray(raw.staff) && raw.staff.length === 3 && raw.staff.every((m) => typeof m?.id === "string" && isCount(m.candidates) && isCount(m.selected) && LEANS.includes(m.lean)) ? raw.staff : null;
  const i = raw.improvements ?? {};
  const improvements = isCount(i.human) && isCount(i.aiDone) ? i : null;
  const operations = Array.isArray(raw.operations) && raw.operations.every((o) => typeof o?.label === "string" && isCount(o.n)) ? raw.operations : null;
  // ルーティンの実績は、あとから足した数字。形が違っても、ほかの数字は使い、ここだけ手で写した数字にする
  const r = raw.routines ?? {};
  const routines = ROUTINE_KEYS.every((k) => isCount(r[k])) ? r : FALLBACK.routines;
  const at = new Date(raw.at);
  if (!totals || !autoPublish || !staff || !improvements || !operations || Number.isNaN(at.getTime())) return null;
  if (!(totals.perConversionJpy === null || isCount(totals.perConversionJpy))) return null;
  const asOf = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" }).format(at);
  return { asOf, live: true, totals, autoPublish, staff, improvements, operations, routines };
}

let pending = null;
function load() {
  if (!pending) {
    pending = fetch(NUMBERS_URL, { signal: AbortSignal.timeout(6000) })
      .then((res) => (res.ok ? res.json() : null))
      .then(normalize)
      .catch(() => null);
  }
  return pending;
}

// 最初は手で写した数字を出し、読めたら入れ替える
export function useLabNumbers() {
  const [numbers, setNumbers] = useState(FALLBACK);
  useEffect(() => {
    let alive = true;
    load().then((n) => {
      if (alive && n) setNumbers(n);
    });
    return () => {
      alive = false;
    };
  }, []);
  return numbers;
}

const num = (v) => v.toLocaleString("ja-JP");

export function labStatTiles(n) {
  const t = n.totals;
  return [
    ["AIが出したアイデア", num(t.ideas), "件"],
    ["進めた案件", num(t.projects), "件"],
    ["公開した案件", num(t.published), "件"],
    ["訪問（累計）", num(t.visits), "人"],
    ["登録・利用（累計）", num(t.conversions), "件"],
    ["AI費用（累計）", num(t.aiCostJpy), "円", t.perConversionJpy === null ? null : `登録・利用1件あたり ${num(t.perConversionJpy)}円（案件の費用。共通の費用は除く）`],
  ];
}

const BIAS = { self: "自分の案に甘め", strict: "自分の案に辛め", even: "自他の案をほぼ同じに採点" };

// 社員ごとの「選ばれた案」と、自分の案に甘いか辛いか（id は anthropic・openai・google）
export function labStaffScore(n, id) {
  const m = n.staff.find((s) => s.id === id);
  return m ? { picked: `${m.selected}/${m.candidates}`, bias: m.lean ? BIAS[m.lean] : "" } : null;
}

export const opCount = (n, label) => n.operations.find((o) => o.label === label)?.n ?? 0;
export { num as labNum };
