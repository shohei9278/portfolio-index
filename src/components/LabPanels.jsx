import { LAB_AS_OF, labFlow, labStats } from "../data/cases.js";

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
      <figcaption>{LAB_AS_OF}時点。最新の数字は実験の概要ページで確かめられます。</figcaption>
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
