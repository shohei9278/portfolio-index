import { useEffect, useRef, useState } from "react";

export function Reveal({ as: Tag = "div", className = "", children, ...props }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal${shown ? " is-shown" : ""} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function BrowserFrame({ image, eager = false, decorative = false, className = "" }) {
  return (
    <figure className={`browser ${className}`}>
      <div className="browser__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{image.domain}</span>
      </div>
      <img
        src={image.src}
        alt={decorative ? "" : image.alt}
        width="1400"
        height="875"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </figure>
  );
}

const LOOP_STEPS = ["学ぶ", "記録する", "スキル抽出", "次の提案", "日報"];
const LOOP = { cx: 320, cy: 200, rx: 225, ry: 132 };

function loopPoint(degrees) {
  const radians = (degrees * Math.PI) / 180;
  return [LOOP.cx + LOOP.rx * Math.cos(radians), LOOP.cy + LOOP.ry * Math.sin(radians)];
}

export function LearningLoop() {
  const stepAngle = 360 / LOOP_STEPS.length;

  return (
    <svg
      className="loop"
      viewBox="0 0 640 400"
      role="img"
      aria-label="学ぶ、記録する、スキル抽出、次の提案、日報、の順に学習が循環する図"
    >
      <ellipse cx={LOOP.cx} cy={LOOP.cy} rx={LOOP.rx} ry={LOOP.ry} className="loop__track" />
      {LOOP_STEPS.map((_, index) => {
        const angle = -90 + stepAngle * index + stepAngle / 2;
        const [x, y] = loopPoint(angle);
        const radians = (angle * Math.PI) / 180;
        const tangent =
          (Math.atan2(LOOP.ry * Math.cos(radians), -LOOP.rx * Math.sin(radians)) * 180) / Math.PI;
        return (
          <path
            key={angle}
            className="loop__arrow"
            d="M-7 -7 L7 0 L-7 7 Z"
            transform={`translate(${x} ${y}) rotate(${tangent})`}
          />
        );
      })}
      <text x={LOOP.cx} y={LOOP.cy - 4} className="loop__center">
        Learning
      </text>
      <text x={LOOP.cx} y={LOOP.cy + 30} className="loop__sub">
        記録が次の提案になる
      </text>
      {LOOP_STEPS.map((label, index) => {
        const [x, y] = loopPoint(-90 + stepAngle * index);
        return (
          <g key={label} transform={`translate(${x} ${y})`}>
            <rect x="-62" y="-24" width="124" height="48" rx="24" className="loop__node" />
            <text y="7" className="loop__label">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function BuildBadge({ build }) {
  if (!build) return null;
  return <span className={`build-badge build-badge--${build.kind}`}>{build.label}</span>;
}

const CRM_DATA = ["取引先", "訪問記録", "承認済み資料", "メール送信履歴", "配信の同意", "アンケート", "イベント"];

export function CrmFlow() {
  return (
    <figure className="crm-flow" aria-label="Salesforce のデータを Veeva CRM 上のツールで取得し、営業担当者の画面にまとめる仕組みの図">
      <div className="crm-flow__col">
        <p className="crm-flow__label">Salesforce のデータ</p>
        <ul>
          {CRM_DATA.map((label, index) => (
            <li key={label} style={{ "--i": index }}>
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="crm-flow__arrow" aria-hidden="true" />
      <div className="crm-flow__col">
        <p className="crm-flow__label">Veeva CRM 上のツール</p>
        <div className="crm-flow__tool">
          <span>Vue / React の画面</span>
          <strong>ダッシュボード</strong>
          <strong>メール配信</strong>
        </div>
      </div>
      <div className="crm-flow__arrow" aria-hidden="true" />
      <div className="crm-flow__col">
        <p className="crm-flow__label">営業担当者</p>
        <div className="crm-flow__user">
          <strong>訪問の予定と履歴</strong>
          <strong>同意を確かめて配信</strong>
        </div>
      </div>
      <figcaption>仕組みの説明図です。実際の画面ではありません。</figcaption>
    </figure>
  );
}

const POWER_LANES = [
  {
    title: "QAアプリ",
    steps: [
      ["Power Apps", "質問を入力"],
      ["SharePoint", "FAQを検索"],
      ["Power Automate", "見つからなければ"],
      ["OpenAI API", "回答を生成・要約"],
      ["Teams", "未回答を管理者へ通知"],
    ],
  },
  {
    title: "承認アプリ",
    steps: [
      ["Power Apps", "申請フォーム"],
      ["SharePoint", "申請を保存"],
      ["Power Automate", "承認者へ依頼"],
      ["承認・却下", "承認者が判断"],
      ["通知", "申請者へ結果"],
    ],
  },
];

export function PowerFlow() {
  return (
    <figure className="power-flow" aria-label="QAアプリと承認アプリの処理の流れの図">
      {POWER_LANES.map((lane) => (
        <div className="power-flow__lane" key={lane.title}>
          <p className="crm-flow__label">{lane.title}</p>
          <ol>
            {lane.steps.map(([tool, action], index) => (
              <li key={tool + action} style={{ "--i": index }}>
                <strong>{tool}</strong>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <figcaption>仕組みの説明図です。実際の画面ではありません。</figcaption>
    </figure>
  );
}

export function AzureFlow() {
  return (
    <figure className="crm-flow" aria-label="ローカルの Python の処理を書き直して Azure 環境へ移す取り組みの図">
      <div className="crm-flow__col">
        <p className="crm-flow__label">移行前</p>
        <div className="crm-flow__user">
          <strong>ローカルの Python</strong>
          <span className="azure-flow__note">約50ファイル・Excel や CSV を処理</span>
        </div>
      </div>
      <div className="crm-flow__arrow" aria-hidden="true" />
      <div className="crm-flow__col">
        <p className="crm-flow__label">取り組んだこと</p>
        <ul>
          {["Azure 向けに書き直し", "出力ファイルの対応", "予測ロジックの見直し", "想定外の値の扱い", "処理後データの確認", "エラーログの改善"].map(
            (label, index) => (
              <li key={label} style={{ "--i": index }}>
                {label}
              </li>
            ),
          )}
        </ul>
      </div>
      <div className="crm-flow__arrow" aria-hidden="true" />
      <div className="crm-flow__col">
        <p className="crm-flow__label">移行後</p>
        <div className="crm-flow__tool">
          <span>Azure</span>
          <strong>Azure Functions</strong>
          <strong>Blob Storage</strong>
          <strong>Power BI に出力</strong>
        </div>
      </div>
      <figcaption>取り組みの範囲を説明する図です。実際の構成図ではありません。</figcaption>
    </figure>
  );
}

const RESEARCH_STEPS = [
  ["一覧", "医療機関のリスト"],
  ["検索API", "候補のURLを集める"],
  ["AI", "公式サイトを選ぶ"],
  ["HTML / PDF", "本文を取り出す"],
  ["AI", "件数を項目ごとに抽出"],
  ["CSV", "根拠のURL付きで出力"],
];

export function ResearchFlow() {
  return (
    <figure className="power-flow power-flow--six" aria-label="公開情報からAIで件数を集めて表にする流れの図">
      <div className="power-flow__lane">
        <p className="crm-flow__label">サンプルの処理の流れ</p>
        <ol>
          {RESEARCH_STEPS.map(([tool, action], index) => (
            <li key={action} style={{ "--i": index }}>
              <strong>{tool}</strong>
              <span>{action}</span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption>仕組みの説明図です。実際の画面ではありません。</figcaption>
    </figure>
  );
}

export function CaseVisual({ item, eager = false }) {
  if (item.figure === "learning-loop") return <LearningLoop />;
  if (item.figure === "crm-flow") return <CrmFlow />;
  if (item.figure === "power-flow") return <PowerFlow />;
  if (item.figure === "azure-flow") return <AzureFlow />;
  if (item.figure === "research-flow") return <ResearchFlow />;
  return <BrowserFrame image={item.image} eager={eager} />;
}
