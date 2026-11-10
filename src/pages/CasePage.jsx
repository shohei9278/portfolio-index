import { DemoPreview } from "../components/DemoPreview.jsx";
import { ExternalLink } from "../components/ExternalLink.jsx";
import { LabFlow, LabStats } from "../components/LabPanels.jsx";
import { cases } from "../data/cases.js";
import { Link } from "../router.jsx";

function Section({ number, title, children }) {
  return (
    <section className="case-section">
      <h2>
        <span>{number}</span>
        {title}
      </h2>
      <div className="case-section__body">{children}</div>
    </section>
  );
}

function Paragraphs({ items }) {
  return items.map((text) => <p key={text}>{text}</p>);
}

function Decision({ decision, slug }) {
  const [sourceLabel, sourceHref] = decision.source;

  return (
    <article className="decision">
      <h3>{decision.title}</h3>
      <dl>
        {decision.rows.map(([label, text]) => (
          <div key={label} data-role={label}>
            <dt>{label}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
      <ExternalLink href={sourceHref} label={`${slug}-source`} className="decision__source">
        {sourceLabel}
      </ExternalLink>
    </article>
  );
}

export function CasePage({ item }) {
  const index = cases.indexOf(item);
  const nextCase = cases[(index + 1) % cases.length];

  return (
    <article className="case">
      <Link to="/" className="back-link">
        ← 作品一覧
      </Link>

      <header className="case-head">
        <p className="eyebrow">{item.kicker}</p>
        <h1>{item.title}</h1>
        <p className="case-head__lead">{item.lead}</p>
        <dl className="case-meta">
          <div>
            <dt>役割</dt>
            <dd>{item.role}</dd>
          </div>
          <div>
            <dt>時期</dt>
            <dd>{item.period}</dd>
          </div>
          <div>
            <dt>技術</dt>
            <dd>{item.stack.join(" / ")}</dd>
          </div>
        </dl>
        <div className="case-links">
          {item.links.map(([label, href]) => (
            <ExternalLink href={href} label={`${item.slug}-${label}`} key={href}>
              {label}
            </ExternalLink>
          ))}
        </div>
        {item.social ? (
          <div className="case-links case-links--social">
            <span>発信</span>
            {item.social.map(([label, href]) => (
              <ExternalLink href={href} label={`${item.slug}-${label}`} key={href}>
                {label}
              </ExternalLink>
            ))}
          </div>
        ) : null}
        {item.notice ? (
          <p className="notice" role="status">
            {item.notice}
          </p>
        ) : null}
      </header>

      <Section number="01" title="課題">
        <Paragraphs items={item.problem} />
      </Section>

      <Section number="02" title="考えたこと">
        <Paragraphs items={item.thinking} />
        {item.showFlow ? (
          <>
            <h3 className="case-subhead">変更が本番に出るまで</h3>
            <LabFlow />
          </>
        ) : null}
      </Section>

      <Section number="03" title="判断">
        <div className="decisions">
          {item.decisions.map((decision) => (
            <Decision decision={decision} slug={item.slug} key={decision.title} />
          ))}
        </div>
      </Section>

      <Section number="04" title="結果">
        {item.showStats ? <LabStats /> : null}
        <Paragraphs items={item.result} />
        {item.showDemo ? <DemoPreview /> : null}
      </Section>

      <Section number="05" title="まだできていないこと">
        <Paragraphs items={item.next} />
      </Section>

      <Link to={`/work/${nextCase.slug}`} className="next-case">
        <small>次の作品</small>
        <strong>{nextCase.title} →</strong>
      </Link>
    </article>
  );
}
