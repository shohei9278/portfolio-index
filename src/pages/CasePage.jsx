import { useEffect } from "react";
import { ExternalLink } from "../components/ExternalLink.jsx";
import { LabShowcase } from "../components/LabOffice.jsx";
import { useLabNumbers } from "../data/labNumbers.js";
import { LabAutonomy, LabCycle, LabFlow, LabHandoffs, LabPractices, LabQuality, LabRoutines, LabStats } from "../components/LabPanels.jsx";
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

// 数字を読み込んで作る文（AI Product Lab の結果など）
function NumbersText({ make }) {
  return <p>{make(useLabNumbers())}</p>;
}

function Paragraphs({ items }) {
  return items.map((item, i) =>
    typeof item === "function" ? (
      <NumbersText make={item} key={i} />
    ) : typeof item === "string" ? (
      <p key={item}>{item}</p>
    ) : (
      <div className="thinking-group" key={item.title}>
        <h3 className="case-subhead">{item.title}</h3>
        {item.items.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
    ),
  );
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
  // 「/work/ai-product-lab#quality」のように来たときは、描画のあとでその位置へ移動する
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) window.document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [item]);

  const index = cases.indexOf(item);
  const nextCase = cases[(index + 1) % cases.length];
  const prevCase = cases[(index - 1 + cases.length) % cases.length];

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
            <CaseVisual item={item} eager zoomable />
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
            {item.role ? (
              <div>
                <dt>役割</dt>
                <dd>{item.role}</dd>
              </div>
            ) : null}
            {item.period ? (
              <div>
                <dt>時期</dt>
                <dd>{item.period}</dd>
              </div>
            ) : null}
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

        {item.showOffice ? (
          <section className="case-features">
            <h2>オフィスの中</h2>
            <LabShowcase />
          </section>
        ) : null}

        {item.showAutonomy ? (
          <section className="case-features" id="autonomy">
            <h2>人の手を、どこまで手放せるか</h2>
            <p className="case-features__lead">
              目標は、人が寝ていても回り、壊れても自分で戻り、AIが自分のコードを育てていく会社です。人の手が要った場面を見つけるたびに、次はAIが自分でできる仕組みに置き換えています。
            </p>
            <LabAutonomy />
          </section>
        ) : null}

        {item.showPractices ? (
          <section className="case-features" id="practices">
            <h2>AI開発の言葉で見ると</h2>
            <p className="case-features__lead">
              Evals・ハルシネーション対策・ガードレールなど、AIを使った開発でよく話題になることを、この実験では実際にどう形にしているかの一覧です。どれも、コードや PR、公開しているページで確かめられます。
            </p>
            <LabPractices />
          </section>
        ) : null}

        {item.showCycle ? (
          <section className="case-features" id="cycle">
            <h2>毎日、自分で回す</h2>
            <p className="case-features__lead">
              毎朝、担当のAIが前の日の結果を振り返り、その日の手を決めて、自分で実行します。人が指示しなくても、計画・実行・計測・振り返りが毎日回っています。
            </p>
            <LabCycle />
          </section>
        ) : null}

        {item.showRoutines ? (
          <section className="case-features" id="routines">
            <h2>自分で直して、自分で作る</h2>
            <p className="case-features__lead">
              ダッシュボードが、クラウドの Claude Code（ルーティン）に仕事を頼みます。人が入るのは、主に、AIの社員の提案から直すものを選ぶことと、自動では進めない変更・止まったものの判断です。
            </p>
            <LabRoutines />
            <LabHandoffs />
          </section>
        ) : null}

        {item.showQuality ? (
          <section className="case-features" id="quality">
            <h2>テストとCI/CD</h2>
            <p className="case-features__lead">
              コードはAIが書くので、壊れたものが本番に出ないことを仕組みで守っています。人がマージする前と、本番に出たあとの両方で自動で確かめます。
            </p>
            <LabQuality />
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
              <BrowserFrame image={item.gallery} zoomable />
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

      <nav className="case-pager wrap" aria-label="ほかの作品">
        <Link to={`/work/${prevCase.slug}`} className="case-pager__prev">
          <small>← 前の作品</small>
          <span>{prevCase.shortTitle ?? prevCase.title}</span>
        </Link>
        <a href="/#personal-title" className="case-pager__list">
          作品一覧
        </a>
      </nav>

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
