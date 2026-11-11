import { useMemo, useState } from "react";
import { track } from "@vercel/analytics/react";
import { processRequest } from "./requestRules.js";

// 受信一覧に並ぶ架空のメール。添付の申請書は形式がそれぞれ違う
const MAILS = [
  {
    id: "m1",
    from: "企画部",
    sender: "planning",
    subject: "【制作依頼】12月サンプルセミナー 告知素材",
    body: "添付の申請書のとおり、制作をお願いします。",
    attachment: "申請書_縦型フォーム.xlsx",
    rows: [
      ["案件コード", "EV2612"],
      ["イベント名", "12月サンプルセミナー"],
      ["商材", "sample-x"],
      ["公開日", "2026/12/04"],
      ["バナー", "300x250 / 728x90"],
      ["告知メール", "1通"],
    ],
  },
  {
    id: "m2",
    from: "販促部",
    sender: "promotion",
    subject: "【制作依頼】1月キャンペーン バナー一式",
    body: "一覧の制作物をお願いします。",
    attachment: "制作物一覧.xlsx",
    rows: [
      ["No", "案件コード", "種類", "商材", "サイズ", "公開日"],
      ["1", "EV2701", "バナー", "サンプルＸ", "300x250", "2027/01/15"],
      ["2", "EV2701", "バナー", "サンプルＸ", "160x600", "2027/01/15"],
      ["3", "EV2701", "告知メール", "ｻﾝﾌﾟﾙY", "-", "2027/01/20"],
    ],
  },
  {
    id: "m3",
    from: "支社",
    sender: "branch",
    subject: "【制作依頼】2月サンプル勉強会",
    body: "公開日は調整中です。決まり次第お知らせします。",
    attachment: "依頼内容.xlsx",
    rows: [["■案件情報"], ["案件コード：EV2702"], ["商材：SAMPLE X"], ["■バナー"], ["300x250"], ["■LP"], ["スマホ版"]],
  },
  {
    id: "m4",
    from: "支社",
    sender: "branch",
    subject: "Re:【制作依頼】2月サンプル勉強会",
    body: "公開日が決まりました。\n公開日：2027/02/03",
    replyTo: "m3",
    patch: ["公開日：2027/02/03"],
  },
];

const OUTPUT_STATUS = [
  ["missing", "情報不足"],
  ["ready", "準備OK"],
  ["generated", "生成済み"],
  ["test", "テスト確認中"],
  ["done", "完了"],
];
const STATUS_LABEL = Object.fromEntries(OUTPUT_STATUS);
const WORKFLOW = ["取り込み", "申請書の読み取り", "情報の確認", "制作物の生成", "テスト確認", "完了"];

// 制作物の状況から案件の状態を決める
function deriveCaseStatus(statuses) {
  if (statuses.length && statuses.every((status) => status === "done")) return "done";
  if (statuses.includes("missing")) return "missing";
  if (statuses.length && statuses.every((status) => status === "test" || status === "done")) return "test";
  return "ready";
}

function workflowIndex(status) {
  if (status === "done") return 5;
  if (status === "test") return 4;
  if (status === "missing") return 2;
  return 3;
}

function nextStep(status, outputs, missing) {
  if (status === "missing") return { text: `申請者に確認する：${missing.join("、")}`, action: null };
  if (status === "done") return { text: "この案件はすべて完了しました。", action: null };
  const notGenerated = outputs.filter((output) => output.status === "ready").length;
  if (notGenerated) return { text: `制作物を生成する（残り${notGenerated}件）`, action: "generate" };
  if (status !== "test") return { text: "生成した制作物をテストアップして、確認に回す", action: "test" };
  return { text: "確認が済んだら、制作物を完了にする", action: "done" };
}

function confirmationMail(code, missing) {
  return [
    `案件 ${code || "（案件コード未記入）"} について、次の点を教えてください。`,
    "",
    ...missing.map((item) => `・${item}`),
    "",
    "よろしくお願いいたします。",
  ].join("\n");
}

function bannerSize(size) {
  const match = size.match(/^(\d+)x(\d+)$/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}

export function RequestDemo() {
  const [cases, setCases] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [log, setLog] = useState({});
  const [showSheet, setShowSheet] = useState(false);

  const active = cases.find((item) => item.id === activeId) ?? null;
  const result = useMemo(
    () => (active ? processRequest(active.rows, active.sender) : null),
    [active],
  );

  const outputs = result
    ? result.outputs.map((output) => ({
        ...output,
        status: result.missing.length ? "missing" : (active.statuses[output.fileName] ?? "ready"),
      }))
    : [];
  const derived = deriveCaseStatus(outputs.map((output) => output.status));
  const status = active?.manualStatus ?? derived;
  const step = !result
    ? null
    : active.manualStatus
      ? {
          text: `状態を「${STATUS_LABEL[status]}」で固定しています。自動の判定では「${STATUS_LABEL[derived]}」です。`,
          action: null,
        }
      : nextStep(status, outputs, result.missing);

  function caseStatusOf(item) {
    const processed = processRequest(item.rows, item.sender);
    const statuses = processed.outputs.map((output) =>
      processed.missing.length ? "missing" : (item.statuses[output.fileName] ?? "ready"),
    );
    return item.manualStatus ?? deriveCaseStatus(statuses);
  }

  function importMail(mail) {
    track("Portfolio Action", { action: "request_demo_import", label: mail.id });
    if (mail.replyTo) {
      setCases((current) =>
        current.map((item) =>
          item.mailId === mail.replyTo
            ? { ...item, rows: [...item.rows, ...mail.patch.map((line) => [line])], replied: true }
            : item,
        ),
      );
      setActiveId(mail.replyTo);
      setLog((current) => ({ ...current, [mail.id]: "既存の案件に反映" }));
      return;
    }
    setCases((current) => [
      ...current,
      {
        id: mail.id,
        mailId: mail.id,
        mail,
        sender: mail.sender,
        rows: mail.rows.map((row) => [...row]),
        statuses: {},
        manualStatus: null,
        replied: false,
      },
    ]);
    setActiveId(mail.id);
    setShowSheet(false);
    setLog((current) => ({ ...current, [mail.id]: "案件を作成" }));
  }

  function setStatuses(fileNames, value) {
    setCases((current) =>
      current.map((item) =>
        item.id === activeId
          ? {
              ...item,
              statuses: { ...item.statuses, ...Object.fromEntries(fileNames.map((name) => [name, value])) },
            }
          : item,
      ),
    );
  }

  function runStep() {
    track("Portfolio Action", { action: "request_demo_step", label: step.action });
    if (step.action === "generate") {
      setStatuses(outputs.filter((output) => output.status === "ready").map((output) => output.fileName), "generated");
    } else if (step.action === "test") {
      setStatuses(outputs.map((output) => output.fileName), "test");
    } else if (step.action === "done") {
      setStatuses(outputs.map((output) => output.fileName), "done");
    }
  }

  function toggleManual(checked) {
    setCases((current) =>
      current.map((item) => (item.id === activeId ? { ...item, manualStatus: checked ? derived : null } : item)),
    );
  }

  function reset() {
    setCases([]);
    setActiveId(null);
    setLog({});
  }

  const parentImported = (mail) => !mail.replyTo || cases.some((item) => item.mailId === mail.replyTo);

  return (
    <div className="request-demo">
      <section className="demo-panel" aria-labelledby="inbox-title">
        <div className="demo-panel__head">
          <h2 id="inbox-title">
            <span>1</span>受信一覧
          </h2>
          <button type="button" className="demo-button demo-button--small" onClick={reset}>
            最初に戻す
          </button>
        </div>
        <ul className="inbox">
          {MAILS.map((mail) => {
            const done = Boolean(log[mail.id]);
            const ready = parentImported(mail);
            return (
              <li key={mail.id} className={done ? "is-done" : ""}>
                <div className="inbox__main">
                  <small>{mail.from}</small>
                  <strong>{mail.subject}</strong>
                  {mail.attachment ? <span className="inbox__file">📎 {mail.attachment}</span> : null}
                </div>
                {done ? (
                  <span className="inbox__state">{log[mail.id]}</span>
                ) : (
                  <button
                    type="button"
                    className="demo-button demo-button--small"
                    disabled={!ready}
                    onClick={() => importMail(mail)}
                  >
                    {ready ? "取り込む" : "元の依頼の取り込み待ち"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {cases.length ? (
        <div className="case-tabs" role="group" aria-label="取り込んだ案件">
          {cases.map((item) => (
            <button
              type="button"
              className={item.id === activeId ? "is-active" : ""}
              aria-pressed={item.id === activeId}
              key={item.id}
              onClick={() => setActiveId(item.id)}
            >
              <strong>{item.mail.subject.replace(/^【[^】]*】/, "")}</strong>
              <em className={`state state--${caseStatusOf(item)}`}>{STATUS_LABEL[caseStatusOf(item)]}</em>
            </button>
          ))}
        </div>
      ) : null}

      {active && result ? (
        <section className="case-detail" aria-label="案件の詳細">
          <div className="mock-window__bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>cases/{outputs[0]?.code || active.id}</span>
          </div>
          <div className="case-detail__body">
            <header className="case-detail__head">
              <div>
                <small>{active.mail.from}からの依頼</small>
                <h3>{active.mail.subject.replace(/^【[^】]*】/, "")}</h3>
              </div>
              <em className={`state state--${status}`}>{STATUS_LABEL[status]}</em>
            </header>

            <ol className="workflow">
              {WORKFLOW.map((label, index) => {
                const current = workflowIndex(status);
                return (
                  <li key={label} className={index < current ? "is-done" : index === current ? "is-current" : ""}>
                    {label}
                  </li>
                );
              })}
            </ol>

            <div className={`next-step next-step--${status}`}>
              <div>
                <small>次にやること</small>
                <strong>{step.text}</strong>
              </div>
              {step.action ? (
                <button type="button" className="demo-button demo-button--primary" onClick={runStep}>
                  {step.action === "generate" ? "まとめて生成" : step.action === "test" ? "テスト確認へ" : "完了にする"}
                </button>
              ) : null}
            </div>

            <div className="case-detail__grid">
              <div className="case-detail__main">
                <div className="detail-card">
                  <h4>元のメール</h4>
                  <p className="detail-card__mail">{active.mail.body}</p>
                  {active.replied ? (
                    <p className="detail-card__reply">返信を反映しました：{MAILS.find((mail) => mail.replyTo === active.mailId)?.patch.join("、")}</p>
                  ) : null}
                  <button type="button" className="text-button" onClick={() => setShowSheet((value) => !value)}>
                    📎 {active.mail.attachment}（{result.format}）{showSheet ? "を閉じる" : "を見る"}
                  </button>
                  {showSheet ? (
                    <div className="sheet-scroll">
                      <table className="sheet sheet--readonly">
                        <tbody>
                          {active.rows.map((row, index) => (
                            <tr key={index}>
                              {row.map((value, cellIndex) => (
                                <td key={cellIndex}>{value}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>

                <div className="detail-card">
                  <h4>
                    制作物<span>{outputs.length}件</span>
                  </h4>
                  <ul className="output-cards">
                    {outputs.map((output) => {
                      const size = bannerSize(output.size);
                      return (
                        <li key={output.id} className={`output-card output-card--${output.status}`}>
                          <div className="output-card__info">
                            <strong>
                              {output.typeName}・{output.product}
                              {output.size ? `・${output.size}` : ""}
                            </strong>
                            <span className="file-name">{output.fileName}</span>
                            {output.autoAdded ? <em>対の版を自動で追加</em> : null}
                          </div>
                          <span className={`state state--${output.status}`}>{STATUS_LABEL[output.status]}</span>
                          {size && ["generated", "test", "done"].includes(output.status) ? (
                            <div className="output-card__thumb" style={{ aspectRatio: `${size.width} / ${size.height}` }}>
                              {output.product}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {status === "missing" ? (
                  <div className="detail-card">
                    <h4>申請者への確認メール（下書き）</h4>
                    <pre className="mail-draft">{confirmationMail(outputs[0]?.code, result.missing)}</pre>
                    <p className="demo-panel__hint">受信一覧に返信が届いたら、取り込むと既存の案件に反映されます。</p>
                  </div>
                ) : null}
              </div>

              <aside className="case-detail__side">
                <dl className="rule-list">
                  <div>
                    <dt>申請書の形式</dt>
                    <dd>{result.format}</dd>
                  </div>
                  <div>
                    <dt>適用したルール</dt>
                    <dd>
                      {result.rule.label}
                      <small>{result.rule.note}</small>
                    </dd>
                  </div>
                  <div>
                    <dt>表記ゆれの修正</dt>
                    <dd>
                      {result.corrections.length ? (
                        result.corrections.map(([from, to]) => (
                          <span className="correction" key={from}>
                            {from} <b>→</b> {to}
                          </span>
                        ))
                      ) : (
                        <small>修正なし</small>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>足りない情報</dt>
                    <dd>{result.missing.length ? result.missing.join("、") : <small>なし</small>}</dd>
                  </div>
                </dl>
                <label className="editor-check">
                  <input
                    type="checkbox"
                    checked={active.manualStatus !== null}
                    onChange={(event) => toggleManual(event.target.checked)}
                  />
                  今の状態に手動で固定する（自動判定で上書きしない）
                </label>
              </aside>
            </div>
          </div>
        </section>
      ) : (
        <p className="demo-panel__hint">
          受信一覧のメールを「取り込む」と、添付の申請書を読み取って案件の詳細画面ができます。支社からの依頼は公開日が足りないので、返信が届くまで「情報不足」になります。
        </p>
      )}
    </div>
  );
}
