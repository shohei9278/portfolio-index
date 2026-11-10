import { LabStats } from "../components/LabPanels.jsx";
import { BrowserFrame, CaseVisual, Reveal } from "../components/Visuals.jsx";
import { cases, featuredCase, personalCases, profile, workCases } from "../data/cases.js";
import { Link } from "../router.jsx";

const READING_STEPS = ["課題", "考えたこと", "判断", "結果", "まだできていないこと"];

function Summary({ summary }) {
  return (
    <dl className="summary">
      {[
        ["課題", summary.problem],
        ["判断", summary.decision],
        ["結果", summary.result],
      ].map(([label, text]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  );
}

function SectionHead({ english, title, id, children }) {
  return (
    <Reveal className="section-head">
      <p className="section-head__en" aria-hidden="true">
        {english}
      </p>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{children}</p>
      </div>
    </Reveal>
  );
}

function caseNumber(item) {
  return String(cases.indexOf(item) + 1).padStart(2, "0");
}

export function HomePage() {
  const heroImages = [featuredCase, ...personalCases, ...workCases].filter((item) => item.image);

  return (
    <>
      <section className="hero wrap">
        <div className="hero__copy">
          <p className="hero__name">{profile.name} Portfolio</p>
          <h1>作って終わりにせず、動かした結果まで見ています。</h1>
          <p className="hero__lead">
            個人開発と業務ツールの開発で、何を課題と考え、何を判断し、どうなったかをまとめました。
            うまくいっていない結果も、そのまま載せています。
          </p>
          <a href="#personal-title" className="button">
            作品を見る
          </a>
        </div>
        <div className="hero__visual" aria-hidden="true">
          {heroImages.map((item, index) => (
            <BrowserFrame
              image={item.image}
              eager
              decorative
              className={`hero__frame hero__frame--${index + 1}`}
              key={item.slug}
            />
          ))}
        </div>
      </section>

      <section className="guide wrap" aria-label="作品の読み方">
        <p>すべての作品を、この順番で書いています。</p>
        <ol>
          {READING_STEPS.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap section" aria-labelledby="personal-title">
        <SectionHead english="Personal" title="個人開発" id="personal-title">
          自分で課題を決めて、作って公開しているものです。
        </SectionHead>
      </section>

      <section className="band tone-ink" aria-labelledby="featured-title">
        <div className="wrap featured">
          <Reveal className="featured__copy">
            <p className="featured__tag">
              <span>{caseNumber(featuredCase)}</span>いちばん見てほしいもの
            </p>
            <h3 id="featured-title">{featuredCase.title}</h3>
            <p>{featuredCase.lead}</p>
            <Link to={`/work/${featuredCase.slug}`} className="button button--light">
              運用の設計と判断を読む
            </Link>
          </Reveal>
          <Reveal className="featured__visual">
            <CaseVisual item={featuredCase} />
          </Reveal>
          <Reveal className="featured__summary">
            <Summary summary={featuredCase.summary} />
          </Reveal>
          <Reveal className="featured__stats">
            <LabStats />
          </Reveal>
        </div>
      </section>

      <section className="wrap works" aria-label="その他の個人開発">
        {personalCases.map((item) => (
          <Reveal key={item.slug}>
            <Link to={`/work/${item.slug}`} className="work-card">
              <div className={`work-card__stage tone-${item.tone}`}>
                <CaseVisual item={item} />
              </div>
              <div className="work-card__body">
                <p className="work-card__meta">
                  <span>{caseNumber(item)}</span>
                  {item.kicker}
                </p>
                <h3>{item.title}</h3>
                <Summary summary={item.summary} />
                <span className="more">詳しく読む</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>

      <section className="band tone-sand" aria-labelledby="work-title">
        <div className="wrap section section--band">
          <SectionHead english="At Work" title="実務" id="work-title">
            仕事で作ったツールは、そのままでは公開できません。ここでは実務で作った2つのツールを組み合わせて、
            会社の情報を含まない公開用のデモにしたものを載せています。
          </SectionHead>

          {workCases.map((item) => (
            <Reveal key={item.slug}>
              <Link to={`/work/${item.slug}`} className="work-wide">
                <div className="work-wide__visual">
                  <CaseVisual item={item} />
                </div>
                <div className="work-wide__body">
                  <p className="work-card__meta">
                    <span>{caseNumber(item)}</span>
                    <em className="demo-badge">公開用デモ</em>
                  </p>
                  <h3>{item.title}</h3>
                  <Summary summary={item.summary} />
                  <span className="more">詳しく読む</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
