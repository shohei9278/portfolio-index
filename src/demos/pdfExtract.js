// 公開用デモの読み取り処理。ブラウザの中だけで動き、PDFはサーバーへ送らない。

const SAME_LINE = 4;
const TIME_RANGE = /^\d{1,2}:\d{2}\s*[-–〜~]\s*\d{1,2}:\d{2}$/;
const AFFILIATION = /大学|学部|株式会社|有限会社|研究所|研究科|病院|センター|法人/;
const PERSON_NAME = /^[一-龥々ぁ-んァ-ヶー]{1,6}[ 　][一-龥々ぁ-んァ-ヶー]{1,8}$/;

const RADICAL_TO_KANJI = { "⻑": "長", "⻘": "青", "⻝": "食", "⻄": "西", "⻤": "鬼", "⻩": "黄", "⻲": "亀" };

// PDFによっては「日」などが部首の文字で入り、空白が制御文字になっているので、通常の文字にそろえる
function normalizeGlyphs(text) {
  return text
    .replace(/[\u0000-\u001F]/g, " ")
    .replace(/[\u2E80-\u2FDF]/g, (character) =>
      RADICAL_TO_KANJI[character] ?? character.normalize("NFKC"),
    );
}

// PDFの文字は細かく分かれて届くので、同じ行で近いものを1つの塊にまとめる
function mergeIntoBlocks(items, pageHeight) {
  const glyphs = items
    .filter((item) => item.str && item.height > 0)
    .map((item) => ({
      text: normalizeGlyphs(item.str),
      x: item.transform[4],
      y: pageHeight - item.transform[5],
      width: item.width,
      height: item.height,
    }))
    .sort((a, b) => Math.round(a.y) - Math.round(b.y) || a.x - b.x);

  const merged = [];
  for (const glyph of glyphs) {
    const last = merged.at(-1);
    const end = last ? last.x + last.width : 0;
    const closeEnough =
      last &&
      Math.abs(glyph.y - last.y) < 3 &&
      glyph.x - end < Math.max(last.height, glyph.height) * 1.1;

    if (closeEnough) {
      last.text += glyph.text;
      last.width = glyph.x + glyph.width - last.x;
      last.height = Math.max(last.height, glyph.height);
    } else {
      merged.push({ ...glyph });
    }
  }

  return merged
    .map((block, index) => ({ ...block, id: index, text: block.text.trim() }))
    .filter((block) => block.text);
}

export async function loadPdf(url) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const pdf = await pdfjs.getDocument(url).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: 1.6 });
  // 読み込みが重なっても描画がぶつからないよう、毎回別のキャンバスに描く
  const canvas = window.document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvas, viewport }).promise;

  const { items } = await page.getTextContent();
  const blocks = mergeIntoBlocks(items, base.height);

  return { blocks, image: canvas, pageWidth: base.width, pageHeight: base.height };
}

function normalizeLabel(text) {
  return text.replace(/[\s:：]/g, "");
}

function valueRightOf(blocks, label) {
  const anchor = blocks.find((block) => normalizeLabel(block.text) === label);
  if (!anchor) return null;
  return (
    blocks
      .filter((block) => Math.abs(block.y - anchor.y) < SAME_LINE && block.x > anchor.x)
      .sort((a, b) => a.x - b.x)[0] ?? null
  );
}

function classifyPersonLine(text, learned) {
  if (learned[text]) return learned[text];
  if (AFFILIATION.test(text)) return "affiliation";
  if (PERSON_NAME.test(text)) return "name";
  return "unknown";
}

function extractTalks(blocks, learned, pageHeight) {
  const speakerHeader = blocks.find((block) => block.text === "演者");
  const speakerColumn = speakerHeader ? speakerHeader.x - 4 : Infinity;
  const anchors = blocks
    .filter((block) => TIME_RANGE.test(block.text))
    .sort((a, b) => a.y - b.y);

  return anchors.map((anchor, index) => {
    const bottom = anchors[index + 1]?.y ?? Math.min(anchor.y + 70, pageHeight);
    const row = blocks
      .filter(
        (block) =>
          block.y > anchor.y - 8 && block.y < bottom - 8 && block.x > anchor.x + anchor.width,
      )
      .sort((a, b) => a.y - b.y);

    const talk = { time: anchor, title: null, name: null, affiliation: null, unknown: [] };
    for (const block of row) {
      if (block.x < speakerColumn) {
        talk.title ??= block;
        continue;
      }
      const kind = classifyPersonLine(block.text, learned);
      if (kind === "unknown") talk.unknown.push(block);
      else talk[kind] ??= block;
    }
    return talk;
  });
}

function findTitle(blocks, pageHeight) {
  return blocks
    .filter((block) => block.y < pageHeight * 0.3)
    .sort((a, b) => b.height - a.height)[0];
}

// 読み取った項目を、画面と照合で使う行にする
export function extractRows(document, learned) {
  const { blocks, pageHeight } = document;
  const rows = [
    { id: "title", label: "会の名称", block: findTitle(blocks, pageHeight) },
    { id: "date", label: "日時", block: valueRightOf(blocks, "日時") },
    { id: "format", label: "形式", block: valueRightOf(blocks, "形式") },
    { id: "chair", label: "座長", block: valueRightOf(blocks, "座長") },
  ];

  const talks = extractTalks(blocks, learned, pageHeight);
  talks.forEach((talk, index) => {
    const number = index + 1;
    rows.push(
      { id: `talk${number}-title`, label: `演題${number}`, block: talk.title },
      { id: `talk${number}-name`, label: `演者${number}`, block: talk.name },
      {
        id: `talk${number}-affiliation`,
        label: `所属${number}`,
        block: talk.affiliation,
        pending: talk.unknown[0] ?? null,
      },
    );
  });
  return rows;
}

function bigrams(text) {
  const grams = [];
  for (let index = 0; index < text.length - 1; index += 1) grams.push(text.slice(index, index + 2));
  return grams;
}

function similarity(a, b) {
  const left = bigrams(a);
  const right = bigrams(b);
  if (!left.length || !right.length) return 0;
  const pool = [...right];
  let shared = 0;
  for (const gram of left) {
    const found = pool.indexOf(gram);
    if (found >= 0) {
      shared += 1;
      pool.splice(found, 1);
    }
  }
  return (2 * shared) / (left.length + right.length);
}

function normalizeForCompare(text) {
  return text.normalize("NFKC").toLowerCase().replace(/\s/g, "");
}

export function compareValues(sheetValue, pdfValue) {
  const sheet = normalizeForCompare(sheetValue);
  const pdf = normalizeForCompare(pdfValue);
  if (!pdf) return "missing";
  if (sheet === pdf) return "match";
  if (sheet.includes(pdf) || pdf.includes(sheet) || similarity(sheet, pdf) >= 0.5) return "partial";
  return "missing";
}
