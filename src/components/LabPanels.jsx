import { LAB_HANDOFF_TOP, QUALITY_AS_OF, labAutonomy, labCheckEval, labCycle, labFlow, labHandoffs, labLinks, labPractices, labQuality, labRoutines } from "../data/cases.js";
import { labNum, labStatTiles, useLabNumbers } from "../data/labNumbers.js";
import { ExternalLink } from "./ExternalLink.jsx";

export function LabStats() {
  const n = useLabNumbers();
  return (
    <figure className="stats">
      <dl className="stats__grid">
        {labStatTiles(n).map(([label, value, unit, sub]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {value}
              <small>{unit}</small>
            </dd>
            {sub ? <dd className="stats__sub">{sub}</dd> : null}
          </div>
        ))}
      </dl>
      <figcaption>
        {n.asOf}
        時点{n.live ? "（実験の記録から自動で読み込んだ数字）" : ""}。公開した案件は、AIが作って公開した事前登録ページと小さなツールの数です。登録・利用は、事前登録とツールの利用を合わせた数です。登録・利用1件あたりの費用は、案件のために使った費用だけを登録・利用の数で割った値で、会議やアイデア出しなど案件に付かない共通の費用は含めていません。最新の数字は実験の概要ページで確かめられます。
      </figcaption>
    </figure>
  );
}

const WHO_LABEL = { ai: "AI", auto: "自動", human: "人" };

export function LabFlow({ steps = labFlow, label = "変更が本番に出るまでの流れ" }) {
  return (
    <ol className="flow" aria-label={label} style={{ "--steps": steps.length }}>
      {steps.map((step) => (
        <li className={`flow__step flow__step--${step.who}`} key={step.label}>
          <span className="flow__who">{WHO_LABEL[step.who]}</span>
          <strong>{step.label}</strong>
          <small>{step.note}</small>
        </li>
      ))}
    </ol>
  );
}

export function LabQuality() {
  const { stages, runs } = labQuality;
  return (
    <div className="quality">
      <ol className="quality__stages">
        {stages.map((stage) => (
          <li className="quality__stage" key={stage.when}>
            <p className="quality__when">
              {stage.when}
              <small>{stage.tool}</small>
            </p>
            <ol className="quality__steps">
              {stage.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {stage.notes.map((note) => (
              <p className="quality__note" key={note}>
                {note}
              </p>
            ))}
            {stage.links.length ? (
              <p className="quality__links">
                {stage.links.map(([label, href]) => (
                  <ExternalLink href={href} label={`quality-${label}`} key={href}>
                    {label}
                  </ExternalLink>
                ))}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      <LabCheckEval />
      <figure className="quality__runs">
        <dl>
          <div>
            <dt>CIの実行</dt>
            <dd>
              {runs.total}
              <small>回</small>
            </dd>
          </div>
          <div>
            <dt>成功</dt>
            <dd>
              {runs.success}
              <small>回</small>
            </dd>
          </div>
          <div>
            <dt>失敗して止めた</dt>
            <dd>
              {runs.failure}
              <small>回</small>
            </dd>
          </div>
        </dl>
        <figcaption>
          {runs.since}から{QUALITY_AS_OF}までの ci.yml の実行です（残りは途中で取り消したものなど）。{runs.note}
          <ExternalLink href={runs.href} label="quality-runs">
            実行の記録
          </ExternalLink>
        </figcaption>
      </figure>
    </div>
  );
}

export function LabRoutines() {
  const n = useLabNumbers();
  const r = n.routines;
  const live = {
    fix: `頼んだ ${labNum(r.asked)}件 → マージ ${labNum(r.merged)}件（${n.asOf}時点）`,
    review: `見直しで出した提案 ${labNum(r.reviewed)}件 → PR にしてマージ ${labNum(r.reviewMerged)}件（${n.asOf}時点）`,
    tools: `作ったツール ${labNum(r.tools)}件・公開 ${labNum(r.published)}件（うち人の承認なし ${labNum(r.autoPublished)}件。${n.asOf}時点）`,
  };
  return (
    <div className="routines">
      {labRoutines.map((routine) => (
        <article className="routines__card" key={routine.title}>
          <h3>{routine.title}</h3>
          <LabFlow steps={routine.steps} label={`${routine.title}の流れ`} />
          {routine.live ? <p className="practices__fact">{live[routine.live]}</p> : null}
          {routine.notes.map((note) => (
            <p className="routines__note" key={note}>
              {note}
            </p>
          ))}
          <p className="quality__links">
            {routine.links.map(([text, href]) => (
              <ExternalLink href={href} label={`routines-${text}`} key={href}>
                {text}
              </ExternalLink>
            ))}
          </p>
        </article>
      ))}
    </div>
  );
}

function HandoffList({ items, start = 1 }) {
  return (
    <ol className="handoffs__list" start={start}>
      {items.map(([before, after]) => (
        <li key={before}>
          <p className="handoffs__before">
            <span>前</span>
            {before}
          </p>
          <span className="handoffs__arrow" aria-hidden="true">
            →
          </span>
          <p className="handoffs__after">
            <span>いま</span>
            {after}
          </p>
        </li>
      ))}
    </ol>
  );
}

// 主な4件を見せ、残りは開いて見る（ページが長くなりすぎないように）
export function LabHandoffs() {
  const n = useLabNumbers();
  const top = labHandoffs.slice(0, LAB_HANDOFF_TOP);
  const rest = labHandoffs.slice(LAB_HANDOFF_TOP);
  return (
    <div className="handoffs">
      <h3>人の手を、仕組みに置き換えてきた</h3>
      <HandoffList items={top} />
      {rest.length ? (
        <details className="handoffs__more">
          <summary>ほかの置き換え（{rest.length}件）を見る</summary>
          <HandoffList items={rest} start={top.length + 1} />
        </details>
      ) : null}
      <p className="routines__note">
        それでも、改善の記録では、人が見つけた・決めた改善が{labNum(n.improvements.human)}件、AIの社員の提案で入った改善が{labNum(n.improvements.aiDone)}件です（{n.asOf}時点）。{n.improvements.human > n.improvements.aiDone ? "まだ人が見つけるほうが多い段階です。" : ""}
      </p>
    </div>
  );
}

export function LabCycle() {
  const { steps, weekly, example } = labCycle;
  return (
    <div className="cycle">
      <div className="cycle__loop">
        <LabFlow steps={steps} label="毎日の計画と振り返りの流れ" />
        <p className="cycle__back">↺ 振り返りを、次の朝の計画に入れる</p>
      </div>
      <div className="cycle__example">
        <h3>{example.title}</h3>
        <dl>
          {example.rows.map(([label, text]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        <p className="quality__links">
          <ExternalLink href={labLinks.diary} label="cycle-diary">
            AIの日報
          </ExternalLink>
        </p>
      </div>
      <p className="routines__note">{weekly}</p>
    </div>
  );
}

function LabCheckEval() {
  const { ng, ok, date, rows } = labCheckEval;
  return (
    <div className="check-eval">
      <h3>AIのチェックも、正解のある例で試す</h3>
      <p className="routines__note">
        人を通らずに公開するときの最後の砦は、AIの公開前チェックです。問題を1つだけ入れたページ{ng}件と、問題のないページ{ok}件を、本番と同じ指示でチェックさせ、止めるべきものを止め、通すべきものを通せるかを測っています（{date}、AIごとの最新）。AIだけで公開できる件数にも上限があり、超えた分は人の判断に回します。
      </p>
      <ul className="check-eval__list">
        {rows.map((row) => (
          <li key={row.model}>
            <strong>{row.model}</strong>
            <Meter label="問題のあるページを止めた" value={row.stopped} total={ng} />
            <Meter label="問題のないページを通した" value={row.passed} total={ok} />
          </li>
        ))}
      </ul>
      <p className="quality__links">
        <ExternalLink href={labLinks.lab} label="quality-check-eval">
          AIの成績
        </ExternalLink>
      </p>
    </div>
  );
}

function Meter({ label, value, total }) {
  return (
    <div className="check-eval__meter">
      <span>{label}</span>
      <span className="check-eval__value">
        {value} / {total}
      </span>
      <span className="check-eval__bar" aria-hidden="true">
        <span style={{ width: `${(value / total) * 100}%` }} className={value === total ? "is-full" : undefined} />
      </span>
    </div>
  );
}

// 人の手を、どこまで手放したか: 目を引く見出しのカードと、仕事ごとにAIか人かを並べた地図
export function LabAutonomy() {
  const n = useLabNumbers();
  const live = {
    autoPublish: `人の承認なし ${labNum(n.autoPublish.published)}/${labNum(n.totals.published)}件`,
  };
  return (
    <div className="autonomy">
      <ul className="autonomy__headlines">
        {labAutonomy.headlines.map((h) => (
          <li className="autonomy__card" key={h.title}>
            <span className="autonomy__kicker">{h.kicker}</span>
            <h3>{h.title}</h3>
            <p>{h.body}</p>
          </li>
        ))}
      </ul>
      <div className="autonomy__map">
        <h3>どこまで任せているか</h3>
        <ul aria-label="仕事ごとに、AIが自分でするか、人が決めるか">
          {labAutonomy.map.map((m) => (
            <li className={`autonomy__chip autonomy__chip--${m.who}`} key={m.label}>
              <span>{m.who === "human" ? "人" : "AI"}</span>
              {m.label}
              {m.live ? <small>{live[m.live]}</small> : null}
            </li>
          ))}
        </ul>
      </div>
      <div className="autonomy__kept">
        <h3>あえて人に残しているもの</h3>
        <ul>
          {labAutonomy.kept.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}


// AI開発でよく使う言葉で見ると: 言葉ごとに、この実験でしていることと、確かめられる所（コード・PR・ページ）を並べる
export function LabPractices() {
  const n = useLabNumbers();
  const live = {
    human: `人が見つけた・決めた記録 ${labNum(n.improvements.human)}件（${n.asOf}）`,
    cost: `AIの費用 これまで ${labNum(n.totals.aiCostJpy)}円（${n.asOf}）`,
  };
  return (
    <div className="practices">
      {labPractices.map((g) => (
        <div className="practices__group" key={g.group}>
          <h3>{g.group}</h3>
          <ul className="practices__cards">
            {g.items.map((x) => (
              <li className="practices__card" key={x.term}>
                <p className="practices__term">
                  <strong>{x.term}</strong>
                  <span>{x.ja}</span>
                </p>
                <p>{x.body}</p>
                {x.fact || x.live ? <p className="practices__fact">{x.fact ?? live[x.live]}</p> : null}
                <p className="practices__links">
                  {x.links.map(([label, href]) =>
                    href.startsWith("#") ? (
                      <a href={href} key={href}>
                        {label}
                      </a>
                    ) : (
                      <ExternalLink href={href} label={`practices-${x.term}-${label}`} key={href}>
                        {label}
                      </ExternalLink>
                    ),
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
