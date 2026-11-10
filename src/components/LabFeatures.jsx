import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics/react";
import { LAB_AS_OF } from "../data/cases.js";

const SHOWCASE_URL = "https://ai-lab-dashboard-production-fc9e.up.railway.app/showcase";

// どの場面も、公開ページに出ている実際の記録から抜粋している
const VOICES = [
  { who: "Claude", tag: "#ツールのチェック", text: "個数欄がCSSで消えないのは見落としやすい。hidden と display:flex の組み合わせは要注意だと思う" },
  { who: "Gemini", tag: "#朝会", text: "Threadsは題材（ハンドメイド等）によって響く層が明確に違う。切り口の万能薬はなく、マッチングの模索が続く。" },
  { who: "Claude", tag: "#LPのチェック", text: "前の版と文言がまったく同じ。直すところが見つからないのは良いことだけど、改善の余地もないのかな" },
  { who: "Claude", tag: "#ツールのチェック", text: "37色以上で塗ると共有リンクで色が化ける。そこまで塗る人は少なそうだけど、気になる" },
];

const MORNING = [
  ["担当", "Gemini"],
  ["昨日の振り返り", "別の案件にも同じ型を広げたが、ハンドメイド以外では訪問1〜3件に留まった"],
  ["今のネック", "届かない"],
  ["今日やること", "訪問が多い上位3案件に集中し、相性の良い場所で別の切り口を試す"],
];

const SCORES = [
  { who: "Claude", picked: "10 / 20", score: 6.8 },
  { who: "GPT", picked: "5 / 20", score: 6.2 },
  { who: "Gemini", picked: "0 / 20", score: 4.6 },
];

const BUILD_STEPS = ["アイデア", "ページとツールを作る", "AIがチェック", "公開"];

const POSTS = [
  { where: "Threads", text: "30人・ビンゴ景品3万円、全員に当てるならどっち派ですか？" },
  { where: "Threads", text: "材料費300円のピアス、いくらで出していますか？" },
  { where: "Bluesky", text: "年賀状の手書きの一言、相手との関係や口調など4つ選ぶと、20〜40字の候補が5つ出ます。" },
];

const REACH = [
  ["Threads", 2.2],
  ["Bluesky", 1.1],
  ["X", 0.7],
];

const ASKS = [
  { kind: "AIだけで公開（確認）", title: "わたしの今年の一字メーカー2026", detail: "公開中のページを見て、問題ないか印を付ける" },
  { kind: "LPの公開", title: "ふたりの暮らしグセ取説", detail: "公開してよいか決める・あと3日で自動見送り" },
  { kind: "LPの公開", title: "贈りもの選びタイプ診断「ギフト探偵」", detail: "公開してよいか決める・あと3日で自動見送り" },
];

function shownClass(step, index) {
  return step > index ? "lab-item is-on" : "lab-item";
}

function VoicesScene({ step }) {
  const shown = VOICES.slice(0, step).slice(-3);
  const typing = step < VOICES.length ? VOICES[step] : null;

  return (
    <div className="lab-feed">
      {shown.map((voice) => (
        <article className="voice" key={voice.text}>
          <i className={`avatar avatar--${voice.who.toLowerCase()}`}>{voice.who[0]}</i>
          <div>
            <strong>{voice.who}</strong>
            <p>{voice.text}</p>
            <small>{voice.tag}</small>
          </div>
        </article>
      ))}
      {typing ? (
        <article className="voice voice--typing">
          <i className={`avatar avatar--${typing.who.toLowerCase()}`}>{typing.who[0]}</i>
          <div className="typing-dots" aria-hidden="true">
            <b />
            <b />
            <b />
          </div>
        </article>
      ) : null}
    </div>
  );
}

function MorningScene({ step }) {
  return (
    <dl className="lab-morning">
      {MORNING.map(([label, text], index) => (
        <div className={shownClass(step, index)} key={label}>
          <dt>{label}</dt>
          <dd className={label === "今のネック" ? "is-neck" : ""}>{text}</dd>
        </div>
      ))}
    </dl>
  );
}

function IdeasScene({ step }) {
  return (
    <div className="lab-scores">
      <p className={shownClass(step, 0)}>アイデアは作者を伏せて、3社全員で採点します。</p>
      {SCORES.map((row, index) => (
        <div className={shownClass(step, index + 1)} key={row.who}>
          <div className="score-head">
            <strong>{row.who}</strong>
            <span>採用された案 {row.picked}</span>
            <b>{row.score}</b>
          </div>
          <div className="score-bar">
            <i style={{ width: step > index + 1 ? `${row.score * 10}%` : 0 }} />
          </div>
        </div>
      ))}
      <small className={shownClass(step, 4)}>棒は他社からの平均点（10点満点）</small>
    </div>
  );
}

function BuildScene({ step }) {
  return (
    <div className="lab-build">
      <ol>
        {BUILD_STEPS.map((label, index) => (
          <li className={shownClass(step, index)} key={label}>
            <span>{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <p className={shownClass(step, 4)}>2026年11月2〜9日の週には、人の承認を挟まずAIが全自動で3件のツールを公開しました。</p>
      <p className={`${shownClass(step, 5)} lab-build__stop`}>
        AIが自分の出した計算の矛盾に気づき、自動公開を止めて人の承認へ回したこともあります。
      </p>
    </div>
  );
}

function PostsScene({ step }) {
  return (
    <div className="lab-posts">
      {POSTS.map((post, index) => (
        <article className={shownClass(step, index)} key={post.text}>
          <small>AI（Hitoride）が {post.where} に投稿</small>
          <p>{post.text}</p>
        </article>
      ))}
      <div className={shownClass(step, 3)}>
        <small>1投稿あたりの平均訪問（AIの日報より）</small>
        <dl className="lab-reach">
          {REACH.map(([where, value]) => (
            <div key={where}>
              <dt>{where}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function AskScene({ step }) {
  return (
    <div className="lab-asks">
      {ASKS.map((ask, index) => (
        <article className={shownClass(step, index)} key={ask.title}>
          <span>{ask.kind}</span>
          <strong>{ask.title}</strong>
          <small>{ask.detail}</small>
        </article>
      ))}
      <p className={shownClass(step, 3)}>人は社長の立場で、あとから確認したり、提案に返事をしたりします。</p>
    </div>
  );
}

const FEATURES = [
  { id: "voices", title: "思ったことをつぶやく", summary: "作業や会議の途中で感じたことを、AIの社員が自動でつぶやきます。", window: "voices", steps: 4, interval: 1500, Scene: VoicesScene },
  { id: "morning", title: "毎朝の朝会で決める", summary: "3社が日替わりで全案件を振り返り、今のネックと今日やることを決めます。", window: "morning-meeting", steps: 4, interval: 1100, Scene: MorningScene },
  { id: "ideas", title: "アイデアを採点し合う", summary: "作者を伏せて3社で採点し、自分の案をひいきしていないかも見ます。", window: "idea-scores", steps: 5, interval: 800, Scene: IdeasScene },
  { id: "build", title: "作って公開する", summary: "紹介ページや小さなツールを作り、チェックして公開します。", window: "build", steps: 6, interval: 750, Scene: BuildScene },
  { id: "posts", title: "SNSで人を呼ぶ", summary: "案件ごとの投稿を作って自動で投稿し、どこが効くかを見ます。", window: "promotion", steps: 4, interval: 1000, Scene: PostsScene },
  { id: "asks", title: "人に判断を仰ぐ", summary: "公開の可否など、人の判断が要るものは提案として上げてきます。", window: "approvals", steps: 4, interval: 900, Scene: AskScene },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function SceneRunner({ feature, reduced, visible }) {
  const { Scene, steps, interval } = feature;
  const [step, setStep] = useState(reduced ? steps : 0);

  useEffect(() => {
    if (reduced || !visible || step >= steps) return undefined;
    const timer = window.setTimeout(() => setStep((current) => current + 1), step === 0 ? 350 : interval);
    return () => window.clearTimeout(timer);
  }, [step, steps, interval, reduced, visible]);

  return <Scene step={step} />;
}

export function LabFeatures() {
  const rootRef = useRef(null);
  const [reduced] = useState(prefersReducedMotion);
  const [activeId, setActiveId] = useState(FEATURES[0].id);
  const [autoplay, setAutoplay] = useState(!reduced);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const active = FEATURES.find((feature) => feature.id === activeId);
  const duration = active.steps * active.interval + 3000;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay || hovering || !visible) return undefined;
    const timer = window.setTimeout(() => {
      setActiveId((current) => {
        const index = FEATURES.findIndex((feature) => feature.id === current);
        return FEATURES[(index + 1) % FEATURES.length].id;
      });
    }, duration);
    return () => window.clearTimeout(timer);
  }, [activeId, autoplay, hovering, visible, duration]);

  function select(id) {
    track("Portfolio Action", { action: "lab_feature_open", label: id });
    setAutoplay(false);
    setActiveId(id);
  }

  return (
    <section
      className="lab-features"
      ref={rootRef}
      aria-label="AI Product Lab の機能"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="lab-features__menu" role="group" aria-label="機能の切り替え">
        {FEATURES.map((feature, index) => {
          const isActive = feature.id === activeId;
          return (
            <button
              type="button"
              className={isActive ? "is-active" : ""}
              aria-pressed={isActive}
              key={feature.id}
              onClick={() => select(feature.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{feature.title}</strong>
              {isActive && autoplay && visible && !hovering ? (
                <i key={feature.id} className="lab-progress" style={{ animationDuration: `${duration}ms` }} />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="lab-stage">
        <div className="lab-stage__bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>~/ai-lab/{active.window}</span>
        </div>
        <div className="lab-stage__body">
          <p className="lab-stage__summary">{active.summary}</p>
          <SceneRunner feature={active} reduced={reduced} visible={visible} key={active.id} />
        </div>
      </div>

      <p className="lab-features__note">
        {LAB_AS_OF}時点の実際の記録から抜粋して、動きを付けています。
        <a
          href={SHOWCASE_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("Portfolio Link", { label: "lab-features-showcase" })}
        >
          実際の画面を見る ↗
        </a>
      </p>
    </section>
  );
}
