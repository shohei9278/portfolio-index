import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics/react";

const MAILS = [
  {
    id: "m1",
    subject: "【制作依頼】12月セミナー 告知素材",
    from: "企画担当",
    body: "12月のセミナーの告知素材をお願いします。\n納期: 2026/11/20\n制作物: バナー, 告知メール, 特設ページ",
  },
  {
    id: "m2",
    subject: "【制作依頼】1月イベント バナー",
    from: "広報担当",
    body: "1月のイベントのバナーを作りたいです。\n制作物: バナー, 告知メール",
  },
  {
    id: "m3",
    subject: "Re:【制作依頼】12月セミナー 告知素材",
    from: "企画担当",
    body: "日程の都合で、納期を変更させてください。\n納期: 2026/11/18",
  },
];

const OUTPUT_STATUSES = [
  ["missing", "情報不足"],
  ["ready", "準備OK"],
  ["test", "テスト確認中"],
  ["done", "完了"],
];

const STATUS_LABEL = Object.fromEntries(OUTPUT_STATUSES);
const TEST_OR_ABOVE = new Set(["test", "done"]);

function parseMail(mail) {
  const isReply = /^Re:/i.test(mail.subject);
  const title = mail.subject.replace(/^Re:\s*/i, "").replace(/^【[^】]*】\s*/, "");
  const due = mail.body.match(/納期:\s*([\d/]+)/)?.[1] ?? null;
  const outputs = mail.body
    .match(/制作物:\s*(.+)/)?.[1]
    .split(/[,、]/)
    .map((name) => name.trim());
  return { isReply, title, due, outputs: outputs ?? [] };
}

// 制作物の状況から案件の進捗を判定する
export function deriveCaseStatus(outputs) {
  const statuses = outputs.map((output) => output.status);
  if (statuses.every((status) => status === "done")) return "done";
  if (statuses.includes("missing")) return "missing";
  if (statuses.every((status) => TEST_OR_ABOVE.has(status))) return "test";
  return "ready";
}

function createCase(mail, parsed) {
  return {
    id: mail.id,
    title: parsed.title,
    due: parsed.due,
    updated: false,
    manualStatus: null,
    outputs: parsed.outputs.map((name) => ({
      name,
      status: parsed.due ? "ready" : "missing",
    })),
  };
}

function applyMail(cases, mail) {
  const parsed = parseMail(mail);
  const existing = cases.find((item) => item.title === parsed.title);
  if (parsed.isReply && existing) {
    return {
      cases: cases.map((item) =>
        item === existing ? { ...item, due: parsed.due ?? item.due, updated: true } : item,
      ),
      result: "続きとして反映",
    };
  }
  return { cases: [...cases, createCase(mail, parsed)], result: "案件を作成" };
}

function highlightBody(body) {
  return body.split("\n").map((line) => {
    const match = line.match(/^(納期|制作物):\s*(.+)$/);
    return (
      <span className="mail__line" key={line}>
        {match ? (
          <>
            {match[1]}: <mark>{match[2]}</mark>
          </>
        ) : (
          line
        )}
      </span>
    );
  });
}

function caseStatus(item) {
  return item.manualStatus ?? deriveCaseStatus(item.outputs);
}

export function CaseBoardDemo() {
  const [imported, setImported] = useState({});
  const [cases, setCases] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMailId, setSelectedMailId] = useState(MAILS[0].id);
  const [running, setRunning] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const selected = cases.find((item) => item.id === selectedId) ?? null;
  const selectedMail = MAILS.find((mail) => mail.id === selectedMailId);
  const finished = Object.keys(imported).length === MAILS.length;

  function importMail(mail) {
    setSelectedMailId(mail.id);
    setCases((current) => {
      const { cases: next, result } = applyMail(current, mail);
      setImported((state) => ({ ...state, [mail.id]: result }));
      return next;
    });
    if (!parseMail(mail).isReply) setSelectedId((current) => current ?? mail.id);
  }

  function runImport() {
    track("Portfolio Action", { action: "case_demo_import" });
    setRunning(true);
    MAILS.forEach((mail, index) => {
      timers.current.push(window.setTimeout(() => importMail(mail), 500 + index * 900));
    });
    timers.current.push(window.setTimeout(() => setRunning(false), 500 + MAILS.length * 900));
  }

  function reset() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setRunning(false);
    setImported({});
    setCases([]);
    setSelectedId(null);
    setSelectedMailId(MAILS[0].id);
  }

  function updateSelected(update) {
    setCases((current) => current.map((item) => (item.id === selectedId ? update(item) : item)));
  }

  function setOutputStatus(name, status) {
    updateSelected((item) => ({
      ...item,
      outputs: item.outputs.map((output) => (output.name === name ? { ...output, status } : output)),
    }));
  }

  return (
    <div className="case-demo">
      <div className="demo-toolbar">
        <button
          type="button"
          className="demo-button demo-button--primary"
          onClick={runImport}
          disabled={running || finished}
        >
          {running ? "取り込み中…" : finished ? "取り込み済み" : "サンプルで試す（メールを取り込む）"}
        </button>
        <button type="button" className="demo-button" onClick={reset}>
          最初に戻す
        </button>
      </div>

      <div className="case-demo__grid">
        <section className="demo-panel" aria-labelledby="case-step-1">
          <h2 id="case-step-1">
            <span>1</span>依頼メール
          </h2>
          <ul className="mail-list">
            {MAILS.map((mail) => (
              <li key={mail.id}>
                <button
                  type="button"
                  className={mail.id === selectedMailId ? "is-active" : ""}
                  onClick={() => setSelectedMailId(mail.id)}
                >
                  <strong>{mail.subject}</strong>
                  <small>{imported[mail.id] ?? "未取り込み"}</small>
                </button>
              </li>
            ))}
          </ul>
          <div className="mail">
            <p className="mail__from">差出人: {selectedMail.from}</p>
            {highlightBody(selectedMail.body)}
            <p className="demo-panel__hint">色付きの部分を読み取って、案件の項目に入れます。</p>
          </div>
        </section>

        <section className="demo-panel" aria-labelledby="case-step-2">
          <h2 id="case-step-2">
            <span>2</span>案件ボード
          </h2>
          <div className="board">
            {OUTPUT_STATUSES.map(([key, label]) => {
              const columnCases = cases.filter((item) => caseStatus(item) === key);
              return (
                <div className={`board__column board__column--${key}`} key={key}>
                  <h3>
                    {label}
                    <span>{columnCases.length}</span>
                  </h3>
                  {columnCases.map((item) => (
                    <button
                      type="button"
                      className={`case-card${item.id === selectedId ? " is-active" : ""}`}
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <strong>{item.title}</strong>
                      <small>納期 {item.due ?? "未定"}</small>
                      {item.updated ? <em>メールの続きを反映</em> : null}
                      {item.manualStatus ? <em>手動で固定中</em> : null}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          {cases.length === 0 ? (
            <p className="demo-panel__hint">
              上のボタンを押すと、メールから案件が自動でできます。同じ件名の「Re:」は、新しい案件にせず続きとして反映します。
            </p>
          ) : null}
        </section>
      </div>

      <section className="demo-panel" aria-labelledby="case-step-3">
        <h2 id="case-step-3">
          <span>3</span>制作物の状況を変える
        </h2>
        {selected ? (
          <>
            <p className="demo-panel__hint">
              「{selected.title}」の制作物です。状況を変えると、案件の列が自動で動きます。
            </p>
            <div className="outputs">
              {selected.outputs.map((output) => (
                <div className="output" key={output.name}>
                  <label htmlFor={`output-${output.name}`}>{output.name}</label>
                  <select
                    id={`output-${output.name}`}
                    value={output.status}
                    onChange={(event) => setOutputStatus(output.name, event.target.value)}
                  >
                    {OUTPUT_STATUSES.map(([key, label]) => (
                      <option value={key} key={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="case-demo__result">
              <p>
                自動判定の結果: <strong>{STATUS_LABEL[deriveCaseStatus(selected.outputs)]}</strong>
              </p>
              <label>
                <input
                  type="checkbox"
                  checked={selected.manualStatus !== null}
                  onChange={(event) =>
                    updateSelected((item) => ({
                      ...item,
                      manualStatus: event.target.checked ? deriveCaseStatus(item.outputs) : null,
                    }))
                  }
                />
                今の列に手動で固定する（自動判定で上書きしない）
              </label>
            </div>
          </>
        ) : (
          <p className="demo-panel__hint">取り込んだ案件を選ぶと、ここで操作できます。</p>
        )}
      </section>
    </div>
  );
}
