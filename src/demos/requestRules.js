// 公開用デモの申請書の処理。実務のルールの考え方だけを、架空の内容で再現している。

const PRODUCTS = [
  { name: "SampleX", patterns: [/^sample[-\s]?x$/i, /^サンプルx$/i], pair: "SampleX-SP" },
  { name: "SampleY", patterns: [/^sample[-\s]?y$/i, /^サンプルy$/i], pair: null },
];

const TYPES = {
  バナー: { key: "banner", extension: "png", pairs: true },
  告知メール: { key: "mail", extension: "html", pairs: false },
  LP: { key: "lp", extension: "html", pairs: true },
};

export const SENDER_RULES = {
  planning: {
    label: "企画部のルール",
    note: "案件コード始まりの名前",
    fileName: ({ code, product, type, size, date }) =>
      [code, product, type, size, date].filter(Boolean).join("_"),
  },
  promotion: {
    label: "販促部のルール",
    note: "種類始まりの名前で、版番号を付ける",
    fileName: ({ code, product, type, size, date }) =>
      [type, product, date, size, code, "v1"].filter(Boolean).join("-"),
  },
  branch: {
    label: "支社のルール",
    note: "公開日を名前に含めない",
    fileName: ({ code, product, type, size }) => [code, product, type, size].filter(Boolean).join("_"),
  },
};

function compactDate(value) {
  return value ? value.replace(/\D/g, "") : "";
}

function normalizeProduct(raw) {
  const text = (raw ?? "").normalize("NFKC").trim();
  return PRODUCTS.find((product) => product.patterns.some((pattern) => pattern.test(text))) ?? null;
}

function cell(rows, label) {
  return rows.find((row) => row[0]?.trim() === label)?.[1]?.trim() ?? "";
}

// 項目名と値が縦に並ぶ形式
function parseForm(rows) {
  const common = { code: cell(rows, "案件コード"), rawProduct: cell(rows, "商材"), date: cell(rows, "公開日") };
  const sizes = cell(rows, "バナー").split("/").map((size) => size.trim()).filter(Boolean);
  const items = sizes.map((size) => ({ ...common, typeName: "バナー", size }));
  if (cell(rows, "告知メール")) items.push({ ...common, typeName: "告知メール", size: "" });
  return { format: "縦型フォーム", items };
}

// 1行が1つの制作物の形式
function parseList(rows) {
  const [header, ...body] = rows;
  const column = (name) => header.indexOf(name);
  const items = body
    .filter((row) => row[column("種類")]?.trim())
    .map((row) => ({
      code: row[column("案件コード")]?.trim() ?? "",
      rawProduct: row[column("商材")]?.trim() ?? "",
      date: row[column("公開日")]?.trim() ?? "",
      typeName: row[column("種類")].trim(),
      size: (row[column("サイズ")] ?? "").replace("-", "").trim(),
    }));
  return { format: "一覧表", items };
}

// 「■見出し」の下に項目が続く形式
function parseGrouped(rows) {
  const common = { code: "", rawProduct: "", date: "" };
  const items = [];
  let section = "";
  for (const [text = ""] of rows) {
    const line = text.trim();
    if (!line) continue;
    if (line.startsWith("■")) {
      section = line.slice(1).trim();
      continue;
    }
    const pair = line.match(/^(案件コード|商材|公開日)[:：]\s*(.*)$/);
    if (pair) {
      common[{ 案件コード: "code", 商材: "rawProduct", 公開日: "date" }[pair[1]]] = pair[2].trim();
    } else if (TYPES[section]) {
      items.push({ typeName: section, size: line });
    }
  }
  return { format: "見出し区切り", items: items.map((item) => ({ ...item, ...common })) };
}

function detectAndParse(rows) {
  if (rows[0]?.includes("種類") && rows[0]?.includes("サイズ")) return parseList(rows);
  if (rows.some((row) => row[0]?.trim().startsWith("■"))) return parseGrouped(rows);
  return parseForm(rows);
}

// 申請書の内容から、制作物の一覧・ファイル名・足りない情報を作る
export function processRequest(rows, senderId) {
  const { format, items } = detectAndParse(rows);
  const rule = SENDER_RULES[senderId];
  const corrections = new Map();
  const missing = new Set();
  const outputs = [];

  for (const item of items) {
    const type = TYPES[item.typeName];
    const product = normalizeProduct(item.rawProduct);

    if (!item.code) missing.add("案件コードが書かれていません");
    if (!item.date) missing.add("公開日が書かれていません");
    if (!item.rawProduct) missing.add("商材が書かれていません");
    else if (!product) missing.add(`「${item.rawProduct}」が商材の一覧にありません`);
    if (!type) {
      missing.add(`「${item.typeName}」は制作物の種類にありません`);
      continue;
    }
    if (product && product.name !== item.rawProduct) corrections.set(item.rawProduct, product.name);

    const names = product ? [product.name] : [item.rawProduct || "（商材なし）"];
    const paired = Boolean(product?.pair && type.pairs);
    if (paired) names.push(product.pair);

    names.forEach((name, index) => {
      const base = rule.fileName({
        code: item.code,
        product: name,
        type: type.key,
        size: item.size,
        date: compactDate(item.date),
      });
      outputs.push({
        id: `${item.typeName}-${item.size}-${name}-${outputs.length}`,
        typeName: item.typeName,
        typeKey: type.key,
        product: name,
        size: item.size,
        code: item.code,
        fileName: `${base}.${type.extension}`,
        autoAdded: index > 0,
      });
    });
  }

  return {
    format,
    rule,
    corrections: [...corrections.entries()],
    outputs,
    missing: [...missing],
  };
}
