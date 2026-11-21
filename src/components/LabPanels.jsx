import { LAB_AS_OF, QUALITY_AS_OF, labCheckEval, labCycle, labFlow, labHandoffs, labLinks, labQuality, labRoutines, labStats } from "../data/cases.js";
import { ExternalLink } from "./ExternalLink.jsx";

export function LabStats() {
  return (
    <figure className="stats">
      <dl className="stats__grid">
        {labStats.map(([label, value, unit, sub]) => (
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
        {LAB_AS_OF}
        時点。公開した案件は、AIが作って公開した事前登録ページと小さなツールの数です。登録・利用は、事前登録とツールの利用を合わせた数です。成果1件は、案件のために使った費用を登録・利用の数で割った値です。最新の数字は実験の概要ページで確かめられます。
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
  return (
    <div className="routines">
      {labRoutines.map((routine) => (
        <article className="routines__card" key={routine.title}>
          <h3>{routine.title}</h3>
          <LabFlow steps={routine.steps} label={`${routine.title}の流れ`} />
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

export function LabHandoffs() {
  return (
    <div className="handoffs">
      <h3>人の手を、仕組みに置き換えてきた</h3>
      <ol className="handoffs__list">
        {labHandoffs.map(([before, after]) => (
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
      <p className="routines__note">
        それでも、改善の記録では、人が見つけた・決めた改善が99件、AIの社員の提案で入った改善が32件です（{LAB_AS_OF}時点）。まだ人が見つけるほうが多い段階です。
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
