import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "../analytics.js";
import { BannerEditor, jobFromValues } from "./BannerEditor.jsx";
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

const STATUS_LABEL = { match: "一致", partial: "部分一致", missing: "未検出" };
const FIELD_COLORS = { title: "#d6442a", date: "#0d7a5f", format: "#7a4fd0", chair: "#c98500" };
const TALK_COLOR = "#1f6fd1";
function rowColor(id) {
  return FIELD_COLORS[id] ?? TALK_COLOR;
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
  const [source, setSource] = useState({ sample: SAMPLES[0] });
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const [learned, setLearned] = useState({});
  const [edits, setEdits] = useState({});
  const [editorKey, setEditorKey] = useState(0);
  const [editorJob, setEditorJob] = useState(null);
  const editorRef = useRef(null);

  const sheet = source.sample?.sheet ?? null;

  useEffect(() => {
    let cancelled = false;
    setDocument(null);
    setError("");
    setEdits({});
    setEditorJob(null);
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

  function openEditor() {
    track("Portfolio Action", { action: "pdf_demo_open_editor" });
    setEditorJob(jobFromValues(values));
    setEditorKey((key) => key + 1);
    window.requestAnimationFrame(() =>
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
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
          <button type="button" className="demo-button demo-button--primary" onClick={openEditor} disabled={!document}>
            この内容で編集画面を開く
          </button>
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

      <section className="demo-panel" aria-labelledby="pdf-step-editor" ref={editorRef}>
        <h2 id="pdf-step-editor">
          <span>5</span>定型バナーの編集画面
        </h2>
        {editorJob ? (
          <BannerEditor initialJob={editorJob} key={editorKey} />
        ) : (
          <p className="demo-panel__hint">
            「この内容で編集画面を開く」を押すと、読み取った内容が入った編集画面がここに開きます。
          </p>
        )}
      </section>

      <div className="pdf-demo__bottom">
        <section className="demo-panel" aria-labelledby="pdf-step-4">
          <h2 id="pdf-step-4">
            <span>4</span>シートと照合する
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
