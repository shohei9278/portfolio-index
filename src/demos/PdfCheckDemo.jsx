import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics/react";
import { compareValues, extractRows, loadPdf } from "./pdfExtract.js";

const SAMPLES = [
  {
    id: "seminar-a",
    label: "サンプルA",
    sheet: {
      title: "第12回 サンプル技術セミナー",
      date: "2026年12月5日（土）19:00-20:00",
      format: "WEB配信",
      chair: "山本 和也",
      "talk1-title": "業務自動化の進め方",
      "talk1-name": "鈴木 一郎",
      "talk2-title": "PDFデータ活用の実例と課題",
      "talk2-name": "高橋 美咲",
    },
  },
  {
    id: "seminar-b",
    label: "サンプルB",
    sheet: {
      title: "サンプル開発者ミートアップ 2027",
      date: "2027年1月22日（金）18:30-19:30",
      format: "会場・Web併催",
      chair: "中村 健",
      "talk1-title": "小さく始める内製化",
      "talk1-name": "伊藤 直樹",
      "talk2-title": "現場で使われる画面設計",
      "talk2-name": "渡邉 彩",
    },
  },
];

const PALETTES = [
  { id: "navy", label: "紺", band: "#123a73", accent: "#f2b84b", paper: "#f7f9fc" },
  { id: "green", label: "緑", band: "#0d6b58", accent: "#ffd166", paper: "#f4faf7" },
  { id: "plum", label: "紫", band: "#5b2a86", accent: "#ff9f7a", paper: "#faf6fd" },
];

const STATUS_LABEL = { match: "一致", partial: "部分一致", missing: "未検出" };
const FIELD_COLORS = { title: "#d6442a", date: "#0d7a5f", format: "#7a4fd0", chair: "#c98500" };
const TALK_COLOR = "#1f6fd1";

function rowColor(id) {
  return FIELD_COLORS[id] ?? TALK_COLOR;
}

function wrapText(context, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const character of text) {
    if (context.measureText(line + character).width > maxWidth && line) {
      lines.push(line);
      line = character;
    } else {
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const BANNER_FONT = '"Hiragino Sans", "Noto Sans JP", sans-serif';

function drawBanner(canvas, values, palette) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, width, height);
  context.fillStyle = palette.band;
  context.fillRect(0, 0, width, 330);

  context.fillStyle = palette.accent;
  context.font = `700 30px ${BANNER_FONT}`;
  context.fillText(`${values.format ?? ""}`, 60, 74);

  context.fillStyle = "#ffffff";
  context.font = `700 62px ${BANNER_FONT}`;
  wrapText(context, values.title ?? "", width - 120)
    .slice(0, 2)
    .forEach((line, index) => context.fillText(line, 60, 158 + index * 80));
  context.font = `500 32px ${BANNER_FONT}`;
  context.fillText(values.date ?? "", 60, 298);

  [1, 2].forEach((number, index) => {
    const top = 396 + index * 112;
    context.fillStyle = palette.band;
    context.font = `700 32px ${BANNER_FONT}`;
    context.fillText(values[`talk${number}-title`] ?? "", 60, top);
    context.fillStyle = "#3b4452";
    context.font = `500 25px ${BANNER_FONT}`;
    const affiliation = values[`talk${number}-affiliation`];
    context.fillText(
      `${values[`talk${number}-name`] ?? ""}${affiliation ? `（${affiliation}）` : ""}`,
      60,
      top + 44,
    );
  });
}

export function PdfCheckDemo() {
  const canvasRef = useRef(null);
  const bannerRef = useRef(null);
  const [sampleId, setSampleId] = useState(SAMPLES[0].id);
  const [document, setDocument] = useState(null);
  const [failed, setFailed] = useState(false);
  const [learned, setLearned] = useState({});
  const [edits, setEdits] = useState({});
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);

  const sample = SAMPLES.find((item) => item.id === sampleId);
  const palette = PALETTES.find((item) => item.id === paletteId);

  useEffect(() => {
    let cancelled = false;
    setDocument(null);
    setFailed(false);
    setEdits({});
    loadPdf(`/samples/${sampleId}.pdf`)
      .then((result) => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        canvas.width = result.image.width;
        canvas.height = result.image.height;
        canvas.getContext("2d").drawImage(result.image, 0, 0);
        setDocument(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sampleId]);

  const rows = useMemo(
    () => (document ? extractRows(document, learned) : []),
    [document, learned],
  );

  const values = useMemo(
    () =>
      Object.fromEntries(rows.map((row) => [row.id, edits[row.id] ?? row.block?.text ?? ""])),
    [rows, edits],
  );

  useEffect(() => {
    if (document) drawBanner(bannerRef.current, values, palette);
  }, [document, values, palette]);

  const pendingCount = rows.filter((row) => row.pending && !row.block).length;
  const learnedCount = Object.keys(learned).length;
  const comparisons = rows
    .filter((row) => sample.sheet[row.id] !== undefined)
    .map((row) => ({
      ...row,
      sheetValue: sample.sheet[row.id],
      status: compareValues(sample.sheet[row.id], values[row.id]),
    }));

  function teach(text, kind) {
    track("Portfolio Action", { action: "pdf_demo_teach" });
    setLearned((current) => ({ ...current, [text]: kind }));
  }

  function downloadBanner() {
    track("Portfolio Action", { action: "pdf_demo_download" });
    const link = window.document.createElement("a");
    link.href = bannerRef.current.toDataURL("image/png");
    link.download = `${sampleId}-banner.png`;
    link.click();
  }

  return (
    <div className="pdf-demo">
      <div className="demo-toolbar">
        <div className="demo-switch" role="group" aria-label="読み取るPDF">
          {SAMPLES.map((item) => (
            <button
              type="button"
              className={item.id === sampleId ? "is-active" : ""}
              aria-pressed={item.id === sampleId}
              key={item.id}
              onClick={() => setSampleId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="demo-counter">学習済みの判断: {learnedCount}件</p>
      </div>

      {failed ? <p className="demo-error">PDFを読み込めませんでした。再読み込みしてください。</p> : null}

      <div className="pdf-demo__grid">
        <section className="demo-panel" aria-labelledby="pdf-step-1">
          <h2 id="pdf-step-1">
            <span>1</span>PDFを読み取る
          </h2>
          <p className="demo-panel__hint">色の枠が、文字の位置から判定した項目です。</p>
          <div className="pdf-page">
            <canvas ref={canvasRef} aria-label="サンプルの案内PDF" />
            {document
              ? rows
                  .filter((row) => row.block)
                  .map((row) => (
                    <i
                      className="pdf-box"
                      key={row.id}
                      style={{
                        left: `${(row.block.x / document.pageWidth) * 100}%`,
                        top: `${((row.block.y - row.block.height) / document.pageHeight) * 100}%`,
                        width: `${(row.block.width / document.pageWidth) * 100}%`,
                        height: `${(row.block.height * 1.25) / document.pageHeight * 100}%`,
                        borderColor: rowColor(row.id),
                      }}
                    />
                  ))
              : null}
            {document
              ? rows
                  .filter((row) => row.pending && !row.block)
                  .map((row) => (
                    <i
                      className="pdf-box pdf-box--pending"
                      key={`${row.id}-pending`}
                      style={{
                        left: `${(row.pending.x / document.pageWidth) * 100}%`,
                        top: `${((row.pending.y - row.pending.height) / document.pageHeight) * 100}%`,
                        width: `${(row.pending.width / document.pageWidth) * 100}%`,
                        height: `${(row.pending.height * 1.25) / document.pageHeight * 100}%`,
                      }}
                    />
                  ))
              : null}
            {!document && !failed ? <p className="pdf-loading">読み取り中…</p> : null}
          </div>
        </section>

        <section className="demo-panel" aria-labelledby="pdf-step-2">
          <h2 id="pdf-step-2">
            <span>2</span>確認して直す
          </h2>
          <p className="demo-panel__hint">
            {pendingCount > 0
              ? `判定できなかった文字が${pendingCount}件あります。教えると次から自動で判定します。`
              : "すべて判定できました。内容は自由に直せます。"}
          </p>
          <div className="field-list">
            {rows.map((row) => (
              <div className="field" key={row.id}>
                <label htmlFor={`field-${row.id}`}>
                  <i style={{ background: rowColor(row.id) }} />
                  {row.label}
                </label>
                {row.pending && !row.block ? (
                  <div className="field__teach">
                    <strong>「{row.pending.text}」は？</strong>
                    <button type="button" onClick={() => teach(row.pending.text, "affiliation")}>
                      所属として覚える
                    </button>
                  </div>
                ) : (
                  <input
                    id={`field-${row.id}`}
                    value={values[row.id] ?? ""}
                    onChange={(event) =>
                      setEdits((current) => ({ ...current, [row.id]: event.target.value }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="demo-panel" aria-labelledby="pdf-step-3">
          <h2 id="pdf-step-3">
            <span>3</span>定型バナーを作る
          </h2>
          <p className="demo-panel__hint">デザインは固定で、変えられるのは配色だけです。</p>
          <canvas
            ref={bannerRef}
            className="banner-canvas"
            width="1200"
            height="628"
            aria-label="読み取った内容で作った定型バナー"
          />
          <div className="demo-toolbar">
            <div className="demo-switch" role="group" aria-label="配色">
              {PALETTES.map((item) => (
                <button
                  type="button"
                  className={item.id === paletteId ? "is-active" : ""}
                  aria-pressed={item.id === paletteId}
                  key={item.id}
                  onClick={() => setPaletteId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button type="button" className="demo-button" onClick={downloadBanner} disabled={!document}>
              PNGで保存
            </button>
          </div>
        </section>

        <section className="demo-panel" aria-labelledby="pdf-step-4">
          <h2 id="pdf-step-4">
            <span>4</span>シートと照合する
          </h2>
          <p className="demo-panel__hint">管理シートの値と比べて、見るべき箇所を絞ります。</p>
          <div className="compare-list">
            {comparisons.map((row) => (
              <div className="compare" key={row.id}>
                <span className="compare__label">{row.label}</span>
                <span className={`compare__status compare__status--${row.status}`}>
                  {STATUS_LABEL[row.status]}
                </span>
                <span className="compare__values">
                  <small>シート</small> {row.sheetValue}
                  <br />
                  <small>PDF</small> {values[row.id] || "—"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
