// 公開用デモの読み取り処理。ブラウザの中だけで動き、PDFはサーバーへ送らない。
// ラベルの有無や段組みが違うPDFから、文字の位置と書かれ方を手がかりに項目を判定する。

const SAME_LINE = 4;
const TIME_RANGE = /(\d{1,2}:\d{2})\s*[-–—〜~～]\s*(\d{1,2}:\d{2})/;
const DATE = /\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日/;
const AFFILIATION = /大学|学部|株式会社|有限会社|研究所|研究科|病院|センター|法人/;
const PERSON_NAME = /^[一-龥々ぁ-んァ-ヶー]{1,6}[ 　][一-龥々ぁ-んァ-ヶー]{1,8}$/;
const PERSON_WITH_AFFILIATION = /^(.+?)\s*[（(](.+)[)）]$/;
const FORMAT_WORD = /オンライン|Web|WEB|ウェブ|会場|ハイブリッド|現地/;
const SECTION_HEADING = /^(プログラム|program|講演|時間|演題|演者)$/i;
const RADICAL_TO_KANJI = { "⻑": "長", "⻘": "青", "⻝": "食", "⻄": "西", "⻤": "鬼", "⻩": "黄", "⻲": "亀" };

// PDFによっては「日」などが部首の文字で入り、空白が制御文字になっているので、通常の文字にそろえる
function normalizeGlyphs(text) {
  return text
    .replace(/[\u0000-\u001F]/g, " ")
    .replace(/[⺀-⿟]/g, (character) =>
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
    .sort((a, b) => a.y - b.y);

  // 文字の大きさが違うと基準線が少しずれるので、近い高さを同じ行として並べ直す
  const lines = [];
  for (const glyph of glyphs) {
    const line = lines.at(-1);
    if (line && glyph.y - line[0].y < 3) line.push(glyph);
    else lines.push([glyph]);
  }
  const ordered = lines.flatMap((line) => line.sort((a, b) => a.x - b.x));

  const merged = [];
  for (const glyph of ordered) {
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

function rawTextOf(items) {
  return items
    .map((item) => normalizeGlyphs(item.str) + (item.hasEOL ? "\n" : ""))
    .join("")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export async function loadPdf(source) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const pdf = await pdfjs.getDocument(source).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: 1.6 });
  // 読み込みが重なっても描画がぶつからないよう、毎回別のキャンバスに描く
  const canvas = window.document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvas, viewport }).promise;

  const { items } = await page.getTextContent();
  return {
    blocks: mergeIntoBlocks(items, base.height),
    rawText: rawTextOf(items),
    image: canvas,
    pageWidth: base.width,
    pageHeight: base.height,
  };
}

function compact(text) {
  return text.replace(/[\s　]/g, "");
}

function boxOf(...blocks) {
  const list = blocks.filter(Boolean);
  if (!list.length) return null;
  const left = Math.min(...list.map((block) => block.x));
  const right = Math.max(...list.map((block) => block.x + block.width));
  const top = Math.min(...list.map((block) => block.y - block.height));
  const bottom = Math.max(...list.map((block) => block.y));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

// 「形式」のようなラベルの値を、同じ塊・右隣・すぐ下の順に探す
function findLabeled(blocks, labels) {
  const spaced = labels.map((label) => [...label].join("[\\s　]*")).join("|");
  const pattern = new RegExp(`^\\s*(?:${spaced})[\\s　]*[:：]?[\\s　]*(.*)$`);
  for (const block of blocks) {
    const match = block.text.match(pattern);
    if (!match) continue;
    if (match[1]) return { text: match[1].trim(), block };

    const right = blocks
      .filter((other) => Math.abs(other.y - block.y) < SAME_LINE && other.x > block.x)
      .sort((a, b) => a.x - b.x)[0];
    if (right) return { text: right.text, block: right };
    const below = blocks
      .filter(
        (other) =>
          other.y > block.y && other.y - block.y < 30 && Math.abs(other.x - block.x) < 6,
      )
      .sort((a, b) => a.y - b.y)[0];
    if (below) return { text: below.text, block: below };
  }
  return null;
}

// いちばん大きい文字を会の名称とし、折り返された次の行もつなげる
function findTitle(blocks, pageHeight) {
  const upper = blocks.filter((block) => block.y < pageHeight * 0.42);
  const first = [...upper].sort((a, b) => b.height - a.height)[0];
  if (!first) return null;
  const parts = [first];
  for (const block of [...upper].sort((a, b) => a.y - b.y)) {
    const last = parts.at(-1);
    if (
      block.y > last.y &&
      block.y - last.y < last.height * 1.9 &&
      Math.abs(block.height - last.height) < 0.5 &&
      Math.abs(block.x - last.x) < 4
    ) {
      parts.push(block);
    }
  }
  return { text: parts.map((part) => part.text).join(" "), blocks: parts };
}

// 日付の次の行に時間だけが折り返されている場合も、日時としてまとめる
function findDate(blocks) {
  const block = blocks.find((item) => DATE.test(item.text));
  if (!block) return null;
  const text = block.text
    .slice(block.text.search(DATE))
    .split(/\s*／\s*/)[0]
    .trim();
  if (TIME_RANGE.test(text)) return { text, blocks: [block] };

  const timeLine = blocks.find(
    (other) =>
      other.y > block.y &&
      other.y - block.y < 30 &&
      Math.abs(other.x - block.x) < 6 &&
      TIME_RANGE.test(other.text),
  );
  return timeLine
    ? { text: `${text}${timeLine.text.trim()}`, blocks: [block, timeLine] }
    : { text, blocks: [block] };
}

function findFormat(blocks, titleBlocks) {
  const labeled = findLabeled(blocks, ["形式", "開催形式"]);
  if (labeled) return labeled;

  const inDate = blocks.find((block) => DATE.test(block.text) && block.text.includes("／"));
  if (inDate) return { text: inDate.text.split(/\s*／\s*/).at(-1).trim(), block: inDate };

  const block = blocks.find(
    (item) => !titleBlocks.includes(item) && item.text.length <= 16 && FORMAT_WORD.test(item.text) && !DATE.test(item.text),
  );
  return block ? { text: block.text, block } : null;
}

function cleanPerson(text) {
  return text
    .replace(/\s*(先生|氏|様)$/, "")
    .replace(/[（(].*?[)）]/g, "")
    .trim();
}

function findChair(blocks) {
  const found = findLabeled(blocks, ["座長", "総合司会", "司会"]);
  if (!found) return null;
  const text = found.text
    .split(/[・、,]/)
    .map(cleanPerson)
    .filter(Boolean)
    .join("・");
  return { text, block: found.block };
}

function isTimeAnchor(block) {
  return TIME_RANGE.test(block.text) && !DATE.test(block.text);
}

function regionOf(anchor, anchors, blocks, pageHeight) {
  const sameLine = anchors.filter(
    (other) => other !== anchor && Math.abs(other.y - anchor.y) < SAME_LINE,
  );
  const rightEdge = Math.min(
    Infinity,
    ...sameLine.filter((other) => other.x > anchor.x).map((other) => other.x - 4),
  );
  const below = anchors
    .filter((other) => other.y > anchor.y + SAME_LINE && other.x < rightEdge)
    .map((other) => other.y);
  const bottom = below.length ? Math.min(...below) - 8 : Math.min(anchor.y + 100, pageHeight * 0.94);

  // 時間より完全に左にある文字が同じ範囲にあれば、段組みとみなして左の段を除く
  const hasLeftColumn = blocks.some(
    (block) =>
      block.y > anchor.y - 8 && block.y < bottom && block.x + block.width < anchor.x - 12,
  );
  const leftEdge = sameLine.length > 0 || hasLeftColumn ? anchor.x - 8 : 0;

  return blocks.filter(
    (block) =>
      block !== anchor &&
      block.y > anchor.y - 8 &&
      block.y < bottom &&
      block.x >= leftEdge &&
      block.x < rightEdge,
  );
}

function stripMarkup(text) {
  return text
    .replace(/^【[^】]*】\s*/, "")
    .replace(/^[「『]|[」』]$/g, "")
    .trim();
}

function segmentsOf(anchor, region) {
  const inline = anchor.text.replace(TIME_RANGE, "").replace(/^【[^】]*】/, "").trim();
  const sources = [
    ...(inline ? [{ block: anchor, text: inline }] : []),
    ...region.map((block) => ({ block, text: block.text })),
  ];
  return sources.flatMap(({ block, text }) =>
    text
      .split(/\s*／\s*/)
      .map((part) => ({ block, text: stripMarkup(part) }))
      .filter((part) => part.text && !SECTION_HEADING.test(compact(part.text))),
  );
}

function readTalk(anchor, region, learned) {
  const talk = { name: null, affiliation: null, titleParts: [], unknown: [] };
  const unmatched = [];

  for (const { block, text } of segmentsOf(anchor, region)) {
    const labeled = text.match(/^(演題|演者|講師|登壇者)[:：\s]*(.+)$/);
    const body = labeled ? labeled[2] : text;
    const withAffiliation = body.match(PERSON_WITH_AFFILIATION);

    if (labeled?.[1] === "演題") {
      talk.titleParts.push({ text: stripMarkup(body), block });
    } else if (withAffiliation && PERSON_NAME.test(cleanPerson(withAffiliation[1]))) {
      talk.name = { text: cleanPerson(withAffiliation[1]), block };
      const affiliation = withAffiliation[2].trim();
      if (AFFILIATION.test(affiliation) || learned[affiliation]) {
        talk.affiliation = { text: affiliation, block };
      } else {
        talk.unknown.push({ text: affiliation, block });
      }
    } else if (learned[body] === "affiliation" || AFFILIATION.test(body)) {
      talk.affiliation ??= { text: body, block };
    } else if (PERSON_NAME.test(cleanPerson(body))) {
      talk.name ??= { text: cleanPerson(body), block };
    } else {
      unmatched.push({ text: body, block });
    }
  }

  const sorted = unmatched.sort((a, b) => a.block.y - b.block.y);
  const titleX = sorted[0]?.block.x;
  for (const item of sorted) {
    const belowNameInSameColumn =
      talk.name &&
      item.block.y > talk.name.block.y + SAME_LINE &&
      Math.abs(item.block.x - talk.name.block.x) < 10;
    if (Math.abs(item.block.x - titleX) < 14 && !belowNameInSameColumn) talk.titleParts.push(item);
    else talk.unknown.push(item);
  }
  return talk;
}

// 読み取った項目を、画面と照合で使う行にする
export function extractRows(document, learned) {
  const { blocks, pageHeight } = document;
  const title = findTitle(blocks, pageHeight);
  const date = findDate(blocks);
  const format = findFormat(blocks, title?.blocks ?? []);
  const chair = findChair(blocks);
  const usedAsDate = new Set(date?.blocks ?? []);

  const row = (id, label, found, pending = null) => ({
    id,
    label,
    value: found?.text ?? "",
    box: found ? boxOf(...(found.blocks ?? [found.block])) : null,
    pending,
  });

  const rows = [
    row("title", "会の名称", title),
    row("date", "日時", date),
    row("format", "形式", format),
    row("chair", "座長", chair),
  ];

  const anchors = blocks
    .filter((block) => isTimeAnchor(block) && !usedAsDate.has(block))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  anchors.forEach((anchor, index) => {
    const number = index + 1;
    const talk = readTalk(anchor, regionOf(anchor, anchors, blocks, pageHeight), learned);
    rows.push(
      row(`talk${number}-time`, `時間${number}`, {
        text: anchor.text.match(TIME_RANGE)[0],
        block: anchor,
      }),
      row(`talk${number}-title`, `演題${number}`, {
        text: talk.titleParts.map((part) => part.text).join(""),
        blocks: talk.titleParts.map((part) => part.block),
      }),
      row(`talk${number}-name`, `演者${number}`, talk.name),
      row(
        `talk${number}-affiliation`,
        `所属${number}`,
        talk.affiliation,
        talk.affiliation ? null : (talk.unknown[0] ?? null),
      ),
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
