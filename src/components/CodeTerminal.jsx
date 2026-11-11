import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics/react";

// AI Product Lab の実際の修正（コミット e3c21d8）を短くして再現している
const COMMIT_URL = "https://github.com/shohei9278/ai-lab-dashboard/commit/e3c21d8";

// speed: 1文字あたりの時間（ms）。0 は1行まとめて表示する
const ALL_LINES = [
  { kind: "cmd", text: "$ claude", speed: 45, pause: 350 },
  { kind: "human", text: "> 集客の件数が 4/3件 になってる。分母と分子あってる？", speed: 38, pause: 650 },
  { kind: "ai", text: "● 分母が古い設定のまま。分子も実際の判定と数え方が違う", speed: 0, pause: 650 },
  { kind: "ai", text: "● src/lib/sns.ts を編集", speed: 0, pause: 350 },
  { kind: "comment", text: "+ // 画面の表示と判定をそろえる", wide: true, speed: 16, pause: 80 },
  { kind: "add", text: "+ export function postQuota(platform: string) {", wide: true, speed: 16, pause: 80 },
  { kind: "add", text: "+   if (plannedToday())", wide: true, speed: 16, pause: 40 },
  { kind: "add", text: "+     return { ...safetyQuota(platform), planned: true };", wide: true, speed: 16, pause: 40 },
  { kind: "add", text: "+   return { used: recentAutoPosts(platform).n,", wide: true, speed: 16, pause: 40 },
  { kind: "add", text: "+     cap: getSettings().autoPostPerDay, planned: false };", wide: true, speed: 16, pause: 40 },
  { kind: "add", text: "+ }", wide: true, speed: 16, pause: 550 },
  { kind: "add", text: "+ export function postQuota(platform) { … }", narrow: true, speed: 16, pause: 550 },
  { kind: "cmd", text: "$ git commit", speed: 45, pause: 450 },
  { kind: "dim", text: "[e3c21d8] 4 files changed, 30 insertions(+), 12 deletions(-)", speed: 0, pause: 650 },
  { kind: "ok", text: "✓ 本番の表示  4/3件 → 1/10", speed: 0, pause: 5000 },
];

// スマホでは、コードの行を1行にまとめて短くする
const IS_NARROW = window.matchMedia("(max-width: 760px)").matches;
const LINES = ALL_LINES.filter((line) => (IS_NARROW ? !line.wide : !line.narrow));

const FINISHED = { line: LINES.length - 1, chars: LINES.at(-1).text.length };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CodeTerminal() {
  const rootRef = useRef(null);
  const [reduced] = useState(prefersReducedMotion);
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState(reduced ? FINISHED : { line: 0, chars: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return undefined;

    const current = LINES[position.line];
    const lineDone = position.chars >= current.text.length;
    const delay = lineDone ? current.pause : current.speed;

    const timer = window.setTimeout(() => {
      setPosition(({ line, chars }) => {
        if (chars < LINES[line].text.length) {
          return { line, chars: LINES[line].speed === 0 ? LINES[line].text.length : chars + 1 };
        }
        return line + 1 < LINES.length ? { line: line + 1, chars: 0 } : { line: 0, chars: 0 };
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [position, visible, reduced]);

  return (
    <figure className="terminal" ref={rootRef}>
      <div className="terminal__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>~/ai-lab — claude</span>
      </div>
      <pre className="terminal__body" aria-hidden="true">
        {LINES.map((line, index) => {
          const shown =
            index < position.line
              ? line.text.length
              : index === position.line
                ? position.chars
                : 0;
          return (
            <span className={`terminal__line terminal__line--${line.kind}`} key={line.text}>
              {line.text.slice(0, shown)}
              {index === position.line ? <b className="terminal__caret" /> : null}
              <span className="terminal__rest">{line.text.slice(shown)}</span>
            </span>
          );
        })}
      </pre>
      <figcaption>
        AI Product Lab の実際の修正を短くして再現しています（
        <a
          href={COMMIT_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("Portfolio Link", { label: "hero-commit" })}
        >
          コミット e3c21d8
        </a>
        ）
      </figcaption>
    </figure>
  );
}
