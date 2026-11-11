import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics/react";

const TIME_RANGE = /(\d{1,2}:\d{2})\s*[-–—〜~～]\s*(\d{1,2}:\d{2})/;
const WIDTH = 1200;
const HEIGHT = 675;
const FONT = '"Hiragino Sans", "Noto Sans JP", sans-serif';

const PALETTES = [
  { id: "navy", label: "紺", band: "#123a73", accent: "#f2b84b", paper: "#f7f9fc" },
  { id: "green", label: "緑", band: "#0d6b58", accent: "#ffd166", paper: "#f4faf7" },
  { id: "plum", label: "紫", band: "#5b2a86", accent: "#ff9f7a", paper: "#faf6fd" },
];

// 読み取った値から、編集画面の初期値を作る
export function jobFromValues(values) {
  const dateValue = values.date ?? "";
  const time = dateValue.match(TIME_RANGE);
  const talks = [];
  for (let number = 1; values[`talk${number}-title`] !== undefined; number += 1) {
    talks.push({
      time: values[`talk${number}-time`] ?? "",
      title: values[`talk${number}-title`] ?? "",
      name: values[`talk${number}-name`] ?? "",
      affiliation: values[`talk${number}-affiliation`] ?? "",
    });
  }
  return {
    format: values.format ?? "",
    title: values.title ?? "",
    baseSize: 56,
    date: time ? dateValue.slice(0, time.index).trim() : dateValue,
    time: time ? time[0] : "",
    timeOnNewLine: false,
    note: "",
    noteSize: 20,
    chair: { role: "座長", name: values.chair ?? "", honorific: "先生", affiliation: "" },
    talks,
    titleSizes: [],
  };
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

function person(name, honorific, affiliation) {
  if (!name) return "";
  return `${name} ${honorific}${affiliation ? `（${affiliation}）` : ""}`;
}

// 決まったレイアウトに流し込む。収まらなければ false を返す
function drawBanner(canvas, job, palette) {
  const context = canvas.getContext("2d");
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const sizeOfLine = (index) =>
    job.titleSizes.find((item) => Number(item.line) === index + 1)?.size || job.baseSize;

  context.font = `700 ${job.baseSize}px ${FONT}`;
  const titleLines = wrapText(context, job.title, WIDTH - 120).slice(0, 3);
  let y = 64;
  const titleHeight = titleLines.reduce((sum, _, index) => sum + Number(sizeOfLine(index)) * 1.25, 0);
  const bandHeight = 64 + 34 + titleHeight + (job.timeOnNewLine ? 84 : 46) + 28;

  context.fillStyle = palette.band;
  context.fillRect(0, 0, WIDTH, bandHeight);

  context.fillStyle = palette.accent;
  context.font = `700 28px ${FONT}`;
  context.fillText(job.format, 60, y);
  y += 34;

  context.fillStyle = "#ffffff";
  titleLines.forEach((line, index) => {
    const size = Number(sizeOfLine(index));
    context.font = `700 ${size}px ${FONT}`;
    y += size * 1.25;
    context.fillText(line, 60, y - size * 0.25);
  });

  context.font = `500 30px ${FONT}`;
  y += 40;
  if (job.timeOnNewLine) {
    context.fillText(job.date, 60, y);
    y += 38;
    context.fillText(job.time, 60, y);
  } else {
    context.fillText(`${job.date} ${job.time}`.trim(), 60, y);
  }

  y = bandHeight + 44;
  const chairLine = person(job.chair.name, job.chair.honorific, job.chair.affiliation);
  if (chairLine) {
    context.fillStyle = "#3b4452";
    context.font = `600 24px ${FONT}`;
    context.fillText(`${job.chair.role}：${chairLine}`, 60, y);
    y += 40;
  }
  if (job.note) {
    context.fillStyle = "#5b6472";
    context.font = `500 ${job.noteSize}px ${FONT}`;
    context.fillText(job.note, 60, y);
    y += Number(job.noteSize) + 20;
  }

  for (const talk of job.talks) {
    context.fillStyle = palette.band;
    context.font = `700 22px ${FONT}`;
    context.fillText(talk.time, 60, y + 4);
    context.font = `700 28px ${FONT}`;
    context.fillText(talk.title, 230, y + 4);
    context.fillStyle = "#3b4452";
    context.font = `500 22px ${FONT}`;
    context.fillText(person(talk.name, "先生", talk.affiliation), 230, y + 38);
    y += 74;
  }

  return y - 30 <= HEIGHT;
}

function Field({ label, error, children }) {
  return (
    <label className={`editor-field${error ? " has-error" : ""}`}>
      <span>{label}</span>
      {children}
      {error ? <small>入力してください</small> : null}
    </label>
  );
}

export function BannerEditor({ initialJob }) {
  const canvasRef = useRef(null);
  const [job, setJob] = useState(initialJob);
  const [rendered, setRendered] = useState(initialJob);
  const [autoRender, setAutoRender] = useState(true);
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);
  const [fits, setFits] = useState(true);
  const palette = PALETTES.find((item) => item.id === paletteId);

  useEffect(() => {
    if (!autoRender) return undefined;
    const timer = window.setTimeout(() => setRendered(job), 500);
    return () => window.clearTimeout(timer);
  }, [job, autoRender]);

  useEffect(() => {
    setFits(drawBanner(canvasRef.current, rendered, palette));
  }, [rendered, palette]);

  const errors = {
    title: !job.title.trim(),
    date: !job.date.trim(),
    talks: job.talks.map((talk) => ({ title: !talk.title.trim(), name: !talk.name.trim() })),
  };
  const errorCount =
    Number(errors.title) +
    Number(errors.date) +
    errors.talks.reduce((sum, talk) => sum + Number(talk.title) + Number(talk.name), 0);

  function update(patch) {
    setJob((current) => ({ ...current, ...patch }));
  }

  function updateChair(patch) {
    setJob((current) => ({ ...current, chair: { ...current.chair, ...patch } }));
  }

  function updateTalk(index, patch) {
    setJob((current) => ({
      ...current,
      talks: current.talks.map((talk, i) => (i === index ? { ...talk, ...patch } : talk)),
    }));
  }

  function updateTitleSize(index, patch) {
    setJob((current) => ({
      ...current,
      titleSizes: current.titleSizes.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function download() {
    track("Portfolio Action", { action: "pdf_demo_download" });
    const link = window.document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "banner.png";
    link.click();
  }

  return (
    <div className="banner-editor">
      <div className="banner-editor__form">
        <p className={`editor-status${errorCount ? " is-ng" : " is-ok"}`}>
          {errorCount ? `未入力の項目が${errorCount}件あります` : "必須の項目はそろっています"}
        </p>

        <fieldset className="editor-card">
          <legend>基本</legend>
          <Field label="イベント名" error={errors.title}>
            <input value={job.title} onChange={(event) => update({ title: event.target.value })} />
          </Field>
          <div className="editor-row">
            <Field label="形式">
              <input value={job.format} onChange={(event) => update({ format: event.target.value })} />
            </Field>
            <Field label="基本の文字サイズ">
              <input
                type="number"
                min="32"
                max="72"
                value={job.baseSize}
                onChange={(event) => update({ baseSize: Number(event.target.value) || 56 })}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="editor-card">
          <legend>イベント名の行ごとの文字サイズ</legend>
          {job.titleSizes.length === 0 ? <p className="demo-panel__hint">まだ指定はありません。</p> : null}
          {job.titleSizes.map((item, index) => (
            <div className="editor-row editor-row--action" key={index}>
              <Field label="対象の行">
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={item.line}
                  onChange={(event) => updateTitleSize(index, { line: Number(event.target.value) })}
                />
              </Field>
              <Field label="文字サイズ">
                <input
                  type="number"
                  min="24"
                  max="80"
                  value={item.size}
                  onChange={(event) => updateTitleSize(index, { size: Number(event.target.value) })}
                />
              </Field>
              <button
                type="button"
                className="editor-remove"
                onClick={() => update({ titleSizes: job.titleSizes.filter((_, i) => i !== index) })}
              >
                削除
              </button>
            </div>
          ))}
          <button
            type="button"
            className="demo-button demo-button--small"
            onClick={() => update({ titleSizes: [...job.titleSizes, { line: 2, size: 40 }] })}
          >
            行の指定を追加
          </button>
        </fieldset>

        <fieldset className="editor-card">
          <legend>日時</legend>
          <div className="editor-row">
            <Field label="日付" error={errors.date}>
              <input value={job.date} onChange={(event) => update({ date: event.target.value })} />
            </Field>
            <Field label="時間">
              <input value={job.time} onChange={(event) => update({ time: event.target.value })} />
            </Field>
          </div>
          <label className="editor-check">
            <input
              type="checkbox"
              checked={job.timeOnNewLine}
              onChange={(event) => update({ timeOnNewLine: event.target.checked })}
            />
            時間を改行して表示する
          </label>
          <div className="editor-row">
            <Field label="注釈">
              <input
                value={job.note}
                placeholder="例：各講演は質疑応答を含みます"
                onChange={(event) => update({ note: event.target.value })}
              />
            </Field>
            <Field label="注釈の文字サイズ">
              <input
                type="number"
                min="14"
                max="32"
                value={job.noteSize}
                onChange={(event) => update({ noteSize: Number(event.target.value) || 20 })}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="editor-card">
          <legend>司会</legend>
          <div className="editor-row">
            <Field label="役職">
              <select value={job.chair.role} onChange={(event) => updateChair({ role: event.target.value })}>
                <option value="座長">座長</option>
                <option value="総合司会">総合司会</option>
              </select>
            </Field>
            <Field label="敬称">
              <select
                value={job.chair.honorific}
                onChange={(event) => updateChair({ honorific: event.target.value })}
              >
                <option value="先生">先生</option>
                <option value="さん">さん</option>
              </select>
            </Field>
          </div>
          <div className="editor-row">
            <Field label="名前">
              <input value={job.chair.name} onChange={(event) => updateChair({ name: event.target.value })} />
            </Field>
            <Field label="所属">
              <input
                value={job.chair.affiliation}
                onChange={(event) => updateChair({ affiliation: event.target.value })}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="editor-card">
          <legend>講演</legend>
          {job.talks.map((talk, index) => (
            <div className="editor-talk" key={index}>
              <div className="editor-talk__head">
                <strong>講演{index + 1}</strong>
                <button
                  type="button"
                  className="editor-remove"
                  onClick={() => update({ talks: job.talks.filter((_, i) => i !== index) })}
                >
                  削除
                </button>
              </div>
              <div className="editor-row">
                <Field label="時間">
                  <input value={talk.time} onChange={(event) => updateTalk(index, { time: event.target.value })} />
                </Field>
                <Field label="演者" error={errors.talks[index].name}>
                  <input value={talk.name} onChange={(event) => updateTalk(index, { name: event.target.value })} />
                </Field>
              </div>
              <Field label="タイトル" error={errors.talks[index].title}>
                <input value={talk.title} onChange={(event) => updateTalk(index, { title: event.target.value })} />
              </Field>
              <Field label="所属">
                <input
                  value={talk.affiliation}
                  onChange={(event) => updateTalk(index, { affiliation: event.target.value })}
                />
              </Field>
            </div>
          ))}
          <button
            type="button"
            className="demo-button demo-button--small"
            onClick={() => update({ talks: [...job.talks, { time: "", title: "", name: "", affiliation: "" }] })}
          >
            講演を追加
          </button>
        </fieldset>
      </div>

      <div className="banner-editor__preview">
        <div className="editor-preview-head">
          <strong>プレビュー</strong>
          <label className="editor-check">
            <input type="checkbox" checked={autoRender} onChange={(event) => setAutoRender(event.target.checked)} />
            編集から0.5秒で自動で反映
          </label>
          {!autoRender ? (
            <button type="button" className="demo-button demo-button--small" onClick={() => setRendered(job)}>
              反映する
            </button>
          ) : null}
        </div>
        <canvas
          ref={canvasRef}
          className="banner-canvas"
          width={WIDTH}
          height={HEIGHT}
          aria-label="編集内容で作った定型バナーのプレビュー"
        />
        {!fits ? <p className="editor-warning">講演の数や文字の大きさが多く、バナーに収まっていません。</p> : null}
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
          <button type="button" className="demo-button" onClick={download} disabled={errorCount > 0}>
            PNGで保存
          </button>
        </div>
        <p className="demo-panel__hint">デザインは固定で、変えられるのは配色だけです。必須の項目がそろうと保存できます。</p>
      </div>
    </div>
  );
}
