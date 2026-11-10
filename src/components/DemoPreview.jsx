import { useState } from "react";
import { track } from "@vercel/analytics/react";
import { initialCards } from "../data/demo.js";
import { EventDemo } from "./EventDemo.jsx";
import { OpsDemo } from "./OpsDemo.jsx";

const TABS = [
  ["ops", "自動化の流れ"],
  ["event", "案件ボード"],
];

export function DemoPreview() {
  const [active, setActive] = useState("ops");
  const [runCount, setRunCount] = useState(1);
  const [cards, setCards] = useState(() => initialCards.map((card) => ({ ...card })));
  const [filter, setFilter] = useState("all");

  return (
    <div className="demo-preview">
      <div className="demo-tabs" role="group" aria-label="デモの切り替え">
        {TABS.map(([key, label]) => (
          <button
            type="button"
            className={active === key ? "is-active" : ""}
            aria-pressed={active === key}
            key={key}
            onClick={() => {
              track("Portfolio Action", { action: "demo_tab_open", label: key });
              setActive(key);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {active === "ops" ? (
        <OpsDemo runCount={runCount} onNextStep={() => setRunCount((count) => count + 1)} />
      ) : (
        <EventDemo cards={cards} filter={filter} setCards={setCards} setFilter={setFilter} />
      )}
      <p className="demo-preview__note">
        固定のサンプルで動きのイメージを見せています。実際に操作できるデモは「デモを開く」から確認できます。
      </p>
    </div>
  );
}
