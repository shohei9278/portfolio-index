import { ExternalLink } from "../components/ExternalLink.jsx";
import { LabFeatures } from "../components/LabFeatures.jsx";
import { LabFlow, LabStats } from "../components/LabPanels.jsx";
import { BrowserFrame, BuildBadge, CaseVisual, Reveal } from "../components/Visuals.jsx";
import { CATEGORY_LABELS, cases } from "../data/cases.js";
import { Link } from "../router.jsx";

function Section({ number, title, children }) {
  return (
    <Reveal as="section" className="case-section">
      <h2 className="case-section__label">
        <span aria-hidden="true">{number}</span>
        {title}
      </h2>
      <div className="case-section__body">{children}</div>
    </Reveal>
  );
}

function Paragraphs({ items }) {
  return items.map((text) => <p key={text}>{text}</p>);
}

function Decision({ decision, index, slug }) {
  const [sourceLabel, sourceHref] = decision.source ?? [];

  return (
    <article className="decision">
      <p className="decision__index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </p>
      <div>
        <h3>{decision.title}</h3>
        <dl>
          {decision.rows.map(([label, text]) => (
            <div key={label} data-role={label}>
              <dt>{label}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        {decision.source ? (
          <ExternalLink href={sourceHref} label={`${slug}-source`} className="decision__source">
            {sourceLabel}
          </ExternalLink>
        ) : null}
      </div>
    </article>
  );
}

export function CasePage({ item }) {
  const index = cases.indexOf(item);
  const nextCase = cases[(index + 1) % cases.length];

  return (
    <article>
      <header className={`band case-hero tone-${item.tone}`}>
        <div className="wrap">
          <Link to="/" className="back-link">
            ← 作品一覧
          </Link>
          <p className="case-hero__path" aria-hidden="true">
            ~/works/{item.slug}
          </p>
          <p className="case-hero__kicker">
            <span>{CATEGORY_LABELS[item.category]}</span>
            {item.kicker}
          </p>
          <h1>{item.title}</h1>
          <p className="case-hero__lead">{item.lead}</p>
          <div className="case-hero__visual">
            <CaseVisual item={item} eager />
          </div>
        </div>
      </header>

      <div className="wrap case-body">
        <div className="case-facts">
          {item.build ? (
            <div className="build-note">
              <p className="build-note__title">コードの書き方</p>
              <div>
                <BuildBadge build={item.build} />
                <p>{item.build.detail}</p>
              </div>
            </div>
          ) : null}
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
          {item.links.length || item.demo ? (
          <div className="case-links">
            {item.demo ? (
              <Link to={`/demo/${item.slug}`} className="case-links__primary">
                デモを試す
              </Link>
            ) : null}
            {item.links.map(([label, href]) => (
              <ExternalLink href={href} label={`${item.slug}-${label}`} key={href}>
                {label}
              </ExternalLink>
            ))}
          </div>
          ) : null}
          {item.social ? (
            <div className="case-social">
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
        </div>

        {item.showFeatures ? (
          <section className="case-features">
            <h2>AIの社員がしていること</h2>
            <LabFeatures />
          </section>
        ) : null}

        {item.sections ? (
          item.sections.map((section, index) => (
            <Section number={String(index + 1).padStart(2, "0")} title={section.title} key={section.title}>
              {section.paragraphs ? <Paragraphs items={section.paragraphs} /> : null}
              {section.list ? (
                <ul className="plain-list">
                  {section.list.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              ) : null}
            </Section>
          ))
        ) : (
          <>
        <Section number="01" title="課題">
          <div className="lead-text">
            <Paragraphs items={item.problem} />
          </div>
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
            {item.decisions.map((decision, decisionIndex) => (
              <Decision
                decision={decision}
                index={decisionIndex}
                slug={item.slug}
                key={decision.title}
              />
            ))}
          </div>
        </Section>

        <Section number="04" title="結果">
          {item.showStats ? <LabStats /> : null}
          <Paragraphs items={item.result} />
          {item.gallery ? (
            <div className="case-gallery">
              <BrowserFrame image={item.gallery} />
              <p>{item.gallery.caption}</p>
            </div>
          ) : null}
        </Section>

        <Section number="05" title="まだできていないこと">
          <Paragraphs items={item.next} />
        </Section>
          </>
        )}
      </div>

      <Link to={`/work/${nextCase.slug}`} className={`band next-case tone-${nextCase.tone}`}>
        <span className="wrap">
          <small>次の作品</small>
          <strong>{nextCase.title}</strong>
          <span className="next-case__arrow" aria-hidden="true">
            →
          </span>
        </span>
      </Link>
    </article>
  );
}
