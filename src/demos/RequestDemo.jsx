import { useMemo, useState } from "react";
import { track } from "@vercel/analytics/react";
import { processRequest } from "./requestRules.js";

const SAMPLES = [
  {
    id: "form",
    label: "企画部から",
    note: "項目が縦に並ぶ申請書",
    sender: "planning",
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
    id: "list",
    label: "販促部から",
    note: "1行が1つの制作物の一覧表",
    sender: "promotion",
    rows: [
      ["No", "案件コード", "種類", "商材", "サイズ", "公開日"],
      ["1", "EV2701", "バナー", "サンプルＸ", "300x250", "2027/01/15"],
      ["2", "EV2701", "バナー", "サンプルＸ", "160x600", "2027/01/15"],
      ["3", "EV2701", "告知メール", "ｻﾝﾌﾟﾙY", "-", "2027/01/20"],
    ],
  },
  {
    id: "grouped",
    label: "支社から",
    note: "見出しで区切られ、情報が足りない申請書",
    sender: "branch",
    rows: [
      ["■案件情報"],
      ["案件コード：EV2702"],
      ["商材：SAMPLE X"],
      ["■バナー"],
      ["300x250"],
      ["■LP"],
      ["スマホ版"],
    ],
  },
];

function cloneRows(rows) {
  return rows.map((row) => [...row]);
}

function bannerSize(size) {
  const match = size.match(/^(\d+)x(\d+)$/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
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

export function RequestDemo() {
  const [sampleId, setSampleId] = useState(SAMPLES[0].id);
  const [sheets, setSheets] = useState(() =>
    Object.fromEntries(SAMPLES.map((sample) => [sample.id, cloneRows(sample.rows)])),
  );
  const [generated, setGenerated] = useState(false);

  const sample = SAMPLES.find((item) => item.id === sampleId);
  const rows = sheets[sampleId];
  const result = useMemo(() => processRequest(rows, sample.sender), [rows, sample.sender]);
  const ready = result.missing.length === 0;
  const code = result.outputs[0]?.code ?? "";

  function selectSample(id) {
    setSampleId(id);
    setGenerated(false);
  }

  function updateCell(rowIndex, columnIndex, value) {
    setGenerated(false);
    setSheets((current) => ({
      ...current,
      [sampleId]: current[sampleId].map((row, index) =>
        index === rowIndex
          ? row.map((cellValue, cellIndex) => (cellIndex === columnIndex ? value : cellValue))
          : row,
      ),
    }));
  }

  function reset() {
    setGenerated(false);
    setSheets((current) => ({ ...current, [sampleId]: cloneRows(sample.rows) }));
  }

  return (
    <div className="request-demo">
      <div className="format-tabs format-tabs--three" role="group" aria-label="申請書の形式">
        {SAMPLES.map((item, index) => (
          <button
            type="button"
            className={item.id === sampleId ? "is-active" : ""}
            aria-pressed={item.id === sampleId}
            key={item.id}
            onClick={() => selectSample(item.id)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.label}</strong>
            <small>{item.note}</small>
          </button>
        ))}
      </div>

      <div className="request-demo__top">
        <section className="demo-panel" aria-labelledby="request-step-1">
          <div className="demo-panel__head">
            <h2 id="request-step-1">
              <span>1</span>添付の申請書
            </h2>
            <button type="button" className="demo-button demo-button--small" onClick={reset}>
              元に戻す
            </button>
          </div>
          <p className="demo-panel__hint">セルを書き換えると、結果もその場で変わります。</p>
          <div className="sheet-scroll">
            <table className="sheet">
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={`${sampleId}-${rowIndex}`}>
                    {row.map((value, columnIndex) => (
                      <td key={columnIndex}>
                        <input
                          aria-label={`${rowIndex + 1}行${columnIndex + 1}列`}
                          value={value}
                          onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="demo-panel" aria-labelledby="request-step-2">
          <h2 id="request-step-2">
            <span>2</span>業務のルールで整理
          </h2>
          <dl className="rule-list">
            <div>
              <dt>読み取った形式</dt>
              <dd>{result.format}</dd>
            </div>
            <div>
              <dt>差出人ごとのルール</dt>
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
              <dt>案件の状態</dt>
              <dd>
                <em className={ready ? "state state--ready" : "state state--missing"}>
                  {ready ? "準備OK" : "情報不足"}
                </em>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="demo-panel" aria-labelledby="request-step-3">
        <h2 id="request-step-3">
          <span>3</span>作る制作物とファイル名
          <b className="demo-panel__count">{result.outputs.length}件</b>
        </h2>
        <div className="sheet-scroll">
          <table className="output-table">
            <thead>
              <tr>
                <th>種類</th>
                <th>商材</th>
                <th>サイズ</th>
                <th>ファイル名（自動）</th>
              </tr>
            </thead>
            <tbody>
              {result.outputs.map((output) => (
                <tr key={output.id} className={output.autoAdded ? "is-auto" : ""}>
                  <td>{output.typeName}</td>
                  <td>
                    {output.product}
                    {output.autoAdded ? <em>対の版を自動で追加</em> : null}
                  </td>
                  <td>{output.size || "—"}</td>
                  <td className="file-name">{output.fileName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="request-demo__bottom">
        <section className="demo-panel" aria-labelledby="request-step-4">
          <h2 id="request-step-4">
            <span>4</span>足りない情報
          </h2>
          {ready ? (
            <p className="demo-panel__hint">不足はありません。公開日のセルを空にすると、ここに確認事項が出ます。</p>
          ) : (
            <>
              <ul className="missing-list">
                {result.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="demo-panel__hint">申請者への確認メールも、その内容で下書きします。</p>
              <pre className="mail-draft">{confirmationMail(code, result.missing)}</pre>
            </>
          )}
        </section>

        <section className="demo-panel" aria-labelledby="request-step-5">
          <h2 id="request-step-5">
            <span>5</span>案件から制作物を作る
          </h2>
          <button
            type="button"
            className="demo-button demo-button--primary"
            disabled={!ready}
            onClick={() => {
              track("Portfolio Action", { action: "request_demo_generate" });
              setGenerated(true);
            }}
          >
            {ready ? "バナーを生成する" : "情報がそろうと生成できます"}
          </button>
          {generated && ready ? (
            <div className="generated">
              {result.outputs
                .filter((output) => bannerSize(output.size))
                .map((output) => {
                  const size = bannerSize(output.size);
                  return (
                    <figure key={output.id}>
                      <div
                        className="generated__banner"
                        style={{ aspectRatio: `${size.width} / ${size.height}` }}
                      >
                        <strong>{output.product}</strong>
                        <small>{output.code}</small>
                      </div>
                      <figcaption>{output.fileName}</figcaption>
                    </figure>
                  );
                })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
