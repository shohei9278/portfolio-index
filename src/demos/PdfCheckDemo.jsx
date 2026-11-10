import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics/react";
import { compareValues, extractRows, loadPdf } from "./pdfExtract.js";

const SAMPLES = [
  {
    id: "format-table",
    label: "表形式",
    note: "ラベルと表で書かれた案内",
    sheet: {
      title: "第12回 サンプル技術セミナー",
      date: "2026年12月5日（土）19:00-20:00",
      chair: "山本 和也",
      "talk2-title": "PDFデータ活用の実例と課題",
      "talk2-name": "高橋 美咲",
    },
  },
  {
    id: "format-two-column",
    label: "2段組",
    note: "左に概要、右に講演。ラベルの下に値",
    sheet: {
      title: "サンプル開発者ミートアップ 2027",
      date: "2027年1月22日（金）18:30-19:30",
      chair: "中村 健",
      "talk2-name": "渡邉 彩",
    },
  },
  {
    id: "format-centered",
    label: "ラベルなし",
    note: "日時や形式に見出しがない中央ぞろえ",
    sheet: {
      title: "春のサンプル勉強会",
      date: "2027年2月10日（水）18:30〜19:30",
      format: "オンライン開催",
      "talk1-title": "はじめての業務改善",
    },
  },
  {
    id: "format-one-line",
    label: "1行形式",
    note: "演題・演者・所属が1行で、演者4人・座長2人",
    sheet: {
      chair: "加藤 誠・松本 里奈",
      "talk3-name": "山口 葵",
      "talk4-title": "現場への定着",
    },
  },
  {
    id: "format-landscape",
    label: "横並び",
    note: "横向きの資料で、講演が横に並ぶ",
    sheet: {
      format: "Web配信",
      "talk1-title": "情報を減らす設計",
      "talk3-name": "清水 舞",
    },
  },
  {
    id: "format-broken",
    label: "順番が崩れている",
    note: "文字の並びが崩れ、演題が2行に折り返されている",
    sheet: {
      chair: "藤田 誠一",
      "talk1-title": "請求データの突合を自動化した話",
      "talk2-title": "社内の問い合わせを半分にするまで",
    },
  },
];

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const PALETTES = [
  { id: "navy", label: "紺", band: "#123a73", accent: "#f2b84b", paper: "#f7f9fc" },
  { id: "green", label: "緑", band: "#0d6b58", accent: "#ffd166", paper: "#f4faf7" },
  { id: "plum", label: "紫", band: "#5b2a86", accent: "#ff9f7a", paper: "#faf6fd" },
];

const STATUS_LABEL = { match: "一致", partial: "部分一致", missing: "未検出" };
const FIELD_COLORS = { title: "#d6442a", date: "#0d7a5f", format: "#7a4fd0", chair: "#c98500" };
const TALK_COLOR = "#1f6fd1";
const BANNER_FONT = '"Hiragino Sans", "Noto Sans JP", sans-serif';

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

function drawBanner(canvas, values, palette) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, width, height);
  context.fillStyle = palette.band;
  context.fillRect(0, 0, width, 330);

  context.fillStyle = palette.accent;
  context.font = `700 30px ${BANNER_FONT}`;
  context.fillText(values.format ?? "", 60, 74);

  context.fillStyle = "#ffffff";
  context.font = `700 58px ${BANNER_FONT}`;
  wrapText(context, values.title ?? "", width - 120)
    .slice(0, 2)
    .forEach((line, index) => context.fillText(line, 60, 152 + index * 74));
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

function PdfBox({ box, document, color, pending }) {
  return (
    <i
      className={`pdf-box${pending ? " pdf-box--pending" : ""}`}
      style={{
        left: `${(box.x / document.pageWidth) * 100}%`,
        top: `${(box.y / document.pageHeight) * 100}%`,
        width: `${(box.width / document.pageWidth) * 100}%`,
        height: `${(box.height / document.pageHeight) * 100}%`,
        borderColor: color,
      }}
    />
  );
}

function pendingBox(block) {
  return { x: block.x, y: block.y - block.height, width: block.width, height: block.height };
}

export function PdfCheckDemo() {
  const canvasRef = useRef(null);
  const bannerRef = useRef(null);
  const [source, setSource] = useState({ sample: SAMPLES[0] });
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const [learned, setLearned] = useState({});
  const [edits, setEdits] = useState({});
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);

  const palette = PALETTES.find((item) => item.id === paletteId);
  const sheet = source.sample?.sheet ?? null;

  useEffect(() => {
    let cancelled = false;
    setDocument(null);
    setError("");
    setEdits({});
    const pdfSource = source.sample ? `/samples/${source.sample.id}.pdf` : { data: source.data };
    loadPdf(pdfSource)
      .then((result) => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        canvas.width = result.image.width;
        canvas.height = result.image.height;
        canvas.getContext("2d").drawImage(result.image, 0, 0);
        setDocument(result);
      })
      .catch(() => {
        if (!cancelled) setError("PDFを読み込めませんでした。別のファイルでお試しください。");
      });
    return () => {
      cancelled = true;
    };
  }, [source]);

  const rows = useMemo(
    () => (document ? extractRows(document, learned) : []),
    [document, learned],
  );

  const values = useMemo(
    () => Object.fromEntries(rows.map((row) => [row.id, edits[row.id] ?? row.value])),
    [rows, edits],
  );

  useEffect(() => {
    if (document) drawBanner(bannerRef.current, values, palette);
  }, [document, values, palette]);

  const pendingRows = rows.filter((row) => row.pending && !row.value);
  const noText = document && document.blocks.length === 0;
  const comparisons = sheet
    ? rows
        .filter((row) => sheet[row.id] !== undefined)
        .map((row) => ({
          ...row,
          sheetValue: sheet[row.id],
          status: compareValues(sheet[row.id], values[row.id]),
        }))
    : [];

  function teach(text, kind) {
    track("Portfolio Action", { action: "pdf_demo_teach" });
    setLearned((current) => ({ ...current, [text]: kind }));
  }

  async function uploadPdf(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("20MBまでのPDFでお試しください。");
      return;
    }
    track("Portfolio Action", { action: "pdf_demo_upload" });
    setSource({ data: new Uint8Array(await file.arrayBuffer()), fileName: file.name });
  }

  function downloadBanner() {
    track("Portfolio Action", { action: "pdf_demo_download" });
    const link = window.document.createElement("a");
    link.href = bannerRef.current.toDataURL("image/png");
    link.download = "banner.png";
    link.click();
  }

  return (
    <div className="pdf-demo">
      <div className="format-tabs" role="group" aria-label="読み取るPDFの形式">
        {SAMPLES.map((item, index) => (
          <button
            type="button"
            className={item.id === source.sample?.id ? "is-active" : ""}
            aria-pressed={item.id === source.sample?.id}
            key={item.id}
            onClick={() => setSource({ sample: item })}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.label}</strong>
            <small>{item.note}</small>
          </button>
        ))}
        <label className={`format-upload${source.fileName ? " is-active" : ""}`}>
          <input type="file" accept="application/pdf" onChange={uploadPdf} />
          <span>+</span>
          <strong>自分のPDFを試す</strong>
          <small>{source.fileName ?? "1ページ目を読みます。ブラウザの外には送りません"}</small>
        </label>
      </div>

      {error ? <p className="demo-error">{error}</p> : null}
      {noText ? (
        <p className="demo-error">文字の情報がないPDFです。画像だけのPDFは、このデモでは読み取れません。</p>
      ) : null}

      <div className="demo-toolbar">
        <p className="demo-panel__hint">
          形式が違っても、同じ項目に整理されます。判定できないものは無理に埋めません。
        </p>
        <p className="demo-counter">学習済みの判断: {Object.keys(learned).length}件</p>
      </div>

      <div className="pdf-demo__top">
        <section className="demo-panel" aria-labelledby="pdf-step-1">
          <h2 id="pdf-step-1">
            <span>1</span>元のPDF
          </h2>
          <p className="demo-panel__hint">色の枠が、判定した項目の位置です。</p>
          <div className="pdf-page">
            <canvas ref={canvasRef} aria-label="読み取り対象のPDF" />
            {document
              ? rows
                  .filter((row) => row.box)
                  .map((row) => (
                    <PdfBox box={row.box} color={rowColor(row.id)} document={document} key={row.id} />
                  ))
              : null}
            {document
              ? pendingRows.map((row) => (
                  <PdfBox box={pendingBox(row.pending)} document={document} key={`${row.id}-p`} pending />
                ))
              : null}
            {!document && !error ? <p className="pdf-loading">読み取り中…</p> : null}
          </div>
        </section>

        <section className="demo-panel" aria-labelledby="pdf-step-raw">
          <h2 id="pdf-step-raw">
            <span>2</span>単純に文字を抜き出すと
          </h2>
          <p className="demo-panel__hint">PDFの中に入っている順番のままの文字です。</p>
          <pre className="raw-text">{document?.rawText}</pre>
        </section>

        <section className="demo-panel" aria-labelledby="pdf-step-2">
          <h2 id="pdf-step-2">
            <span>3</span>位置から整理すると
          </h2>
          <p className="demo-panel__hint">
            {pendingRows.length > 0
              ? `判定できない文字が${pendingRows.length}件あります。教えると次から自動で判定します。`
              : "内容は自由に直せます。"}
          </p>
          <div className="field-list">
            {rows.map((row) => (
              <div className="field" key={row.id}>
                <label htmlFor={`field-${row.id}`}>
                  <i style={{ background: rowColor(row.id) }} />
                  {row.label}
                </label>
                {row.pending && !row.value ? (
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
                    placeholder="要確認"
                    onChange={(event) =>
                      setEdits((current) => ({ ...current, [row.id]: event.target.value }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="pdf-demo__bottom">
        <section className="demo-panel" aria-labelledby="pdf-step-3">
          <h2 id="pdf-step-3">
            <span>4</span>定型バナーを作る
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
            <span>5</span>シートと照合する
          </h2>
          <p className="demo-panel__hint">
            {sheet ? "管理シートの値と比べて、見るべき箇所を絞ります。" : "サンプルのPDFで試せます。"}
          </p>
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
