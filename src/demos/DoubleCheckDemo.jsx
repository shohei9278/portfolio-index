import { useMemo, useState } from "react";
import { track } from "../analytics.js";
import {
  SCREENS,
  SHEET_COLUMNS,
  SHEET_ROWS,
  checkScreen,
  diffChars,
  findRowsById,
  readId,
} from "./checkRules.js";

function cloneScreens() {
  return SCREENS.map((screen) => ({
    ...screen,
    fields: screen.fields.map((field) => ({ ...field })),
  }));
}

// スペースの違いは見落としやすいので、記号にして見せる
function showSpace(character) {
  if (character === " ") return "␣";
  if (character === "　") return "□";
  return character;
}

function DiffText({ parts }) {
  return (
    <span className="diff-text">
      {parts.map((part, index) =>
        part.changed ? (
          <mark key={index}>{showSpace(part.text)}</mark>
        ) : (
          <span key={index}>{showSpace(part.text)}</span>
        ),
      )}
    </span>
  );
}

export function DoubleCheckDemo() {
  const [rowNumber, setRowNumber] = useState(SHEET_ROWS[0].row);
  const [screenId, setScreenId] = useState(SCREENS[0].id);
  const [screens, setScreens] = useState(cloneScreens);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState({});

  const row = SHEET_ROWS.find((item) => item.row === rowNumber);
  const screen = screens.find((item) => item.id === screenId);
  const screenIdValue = readId(screen.fields.find((field) => field.key === "id"));
  const idMismatch = screenIdValue && screenIdValue !== row.id;
  const candidates = useMemo(() => (idMismatch ? findRowsById(screenIdValue) : []), [idMismatch, screenIdValue]);
  const mismatchCount = results ? results.filter((result) => !result.match).length : 0;

  function selectScreen(id) {
    setScreenId(id);
    setResults(null);
  }

  function selectRow(number) {
    setRowNumber(number);
    setResults(null);
  }

  function updateField(index, value) {
    setResults(null);
    setScreens((current) =>
      current.map((item) =>
        item.id === screenId
          ? { ...item, fields: item.fields.map((field, i) => (i === index ? { ...field, value } : field)) }
          : item,
      ),
    );
  }

  function runCheck() {
    track("Portfolio Action", { action: "double_check_run", label: screenId });
    const checked = checkScreen(screen, row);
    setResults(checked);
    setProgress((current) => ({
      ...current,
      [row.id]: { ...current[row.id], [screenId]: checked.every((result) => result.match) ? "ok" : "ng" },
    }));
  }

  function reset() {
    setScreens(cloneScreens());
    setResults(null);
    setProgress({});
    setRowNumber(SHEET_ROWS[0].row);
    setScreenId(SCREENS[0].id);
  }

  const rowProgress = progress[row.id] ?? {};

  return (
    <div className="check-demo">
      <div className="check-demo__grid">
        <section className="demo-panel" aria-labelledby="check-sheet">
          <div className="demo-panel__head">
            <h2 id="check-sheet">
              <span>1</span>管理シート
            </h2>
            <button type="button" className="demo-button demo-button--small" onClick={reset}>
              最初に戻す
            </button>
          </div>
          <p className="demo-panel__hint">比較元にする行を選びます。</p>
          <div className="sheet-scroll">
            <table className="check-sheet">
              <thead>
                <tr>
                  <th>行</th>
                  {SHEET_COLUMNS.map(([key, label]) => (
                    <th key={key}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHEET_ROWS.map((item) => (
                  <tr
                    key={item.row}
                    className={item.row === rowNumber ? "is-selected" : ""}
                    onClick={() => selectRow(item.row)}
                  >
                    <td>
                      <button type="button" aria-pressed={item.row === rowNumber} onClick={() => selectRow(item.row)}>
                        {item.row}
                      </button>
                    </td>
                    {SHEET_COLUMNS.map(([key]) => (
                      <td key={key}>{item[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="check-progress">
            <p>
              <strong>{row.id}</strong> のチェック状況
            </p>
            <ul>
              {SCREENS.map((item) => (
                <li key={item.id} className={`check-progress__${rowProgress[item.id] ?? "none"}`}>
                  <b>{rowProgress[item.id] === "ok" ? "✓" : rowProgress[item.id] === "ng" ? "!" : "—"}</b>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="demo-panel" aria-labelledby="check-screen">
          <h2 id="check-screen">
            <span>2</span>照合する画面
          </h2>
          <div className="demo-switch" role="group" aria-label="照合する画面">
            {SCREENS.map((item) => (
              <button
                type="button"
                className={item.id === screenId ? "is-active" : ""}
                aria-pressed={item.id === screenId}
                key={item.id}
                onClick={() => selectScreen(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mock-window">
            <div className="mock-window__bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>{screen.window}</span>
            </div>
            <div className="mock-window__body">
              {screen.fields.map((field, index) => (
                <label key={field.label}>
                  <span>{field.label}</span>
                  <input value={field.value} onChange={(event) => updateField(index, event.target.value)} />
                </label>
              ))}
            </div>
          </div>
          <p className="demo-panel__hint">画面の値は書き換えられます。直してからもう一度チェックできます。</p>
        </section>
      </div>

      <section className="demo-panel" aria-labelledby="check-result">
        <div className="demo-panel__head">
          <h2 id="check-result">
            <span>3</span>サイドパネルでチェック
          </h2>
          <button type="button" className="demo-button demo-button--primary" onClick={runCheck}>
            チェックする
          </button>
        </div>

        {idMismatch ? (
          <div className="check-warning" role="status">
            <p>
              {screen.idSource}のID <strong>{screenIdValue}</strong> と、選んだ行のID <strong>{row.id}</strong>{" "}
              が違います。別の行と比べている可能性があります。
            </p>
            {candidates.map((candidate) => (
              <button type="button" className="demo-button demo-button--small" key={candidate.row} onClick={() => selectRow(candidate.row)}>
                シートの{candidate.row}行目を使う
              </button>
            ))}
          </div>
        ) : null}

        {results ? (
          <>
            <p className={`check-summary${mismatchCount ? " is-ng" : " is-ok"}`}>
              {mismatchCount ? `${mismatchCount}か所が違います` : "すべて一致しています"}
            </p>
            <div className="check-results">
              {results.map((result) => {
                const diff = diffChars(result.expected, result.actual);
                return (
                  <div className={`check-result${result.match ? "" : " is-ng"}`} key={result.label}>
                    <span className="check-result__status">{result.match ? "一致" : "違う"}</span>
                    <strong>{result.label}</strong>
                    <span className="check-result__values">
                      <small>シート</small>
                      {result.match ? result.expected : <DiffText parts={diff.left} />}
                      <br />
                      <small>画面</small>
                      {result.match ? result.actual : <DiffText parts={diff.right} />}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="demo-panel__hint">␣ は半角スペース、□ は全角スペースです。</p>
          </>
        ) : (
          <p className="demo-panel__hint">
            「チェックする」を押すと、選んだ行と画面の内容を項目ごとに照合します。テストメールでは、件名のIDから別の行を見ていることにも気づけます。
          </p>
        )}
      </section>
    </div>
  );
}
