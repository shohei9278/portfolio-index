import { LAB_AS_OF, QUALITY_AS_OF, labFlow, labQuality, labStats } from "../data/cases.js";
import { ExternalLink } from "./ExternalLink.jsx";

export function LabStats() {
  return (
    <figure className="stats">
      <dl className="stats__grid">
        {labStats.map(([label, value, unit]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {value}
              <small>{unit}</small>
            </dd>
          </div>
        ))}
      </dl>
      <figcaption>
        {LAB_AS_OF}
        時点。公開した案件は、AIが作って公開した事前登録ページと小さなツールの数です。登録・利用は、事前登録とツールの利用を合わせた数です。最新の数字は実験の概要ページで確かめられます。
      </figcaption>
    </figure>
  );
}

const WHO_LABEL = { ai: "AI", auto: "自動", human: "人" };

export function LabFlow() {
  return (
    <ol className="flow" aria-label="変更が本番に出るまでの流れ">
      {labFlow.map((step) => (
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
