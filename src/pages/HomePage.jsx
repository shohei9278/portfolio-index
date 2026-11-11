import { useEffect } from "react";
import { AboutSection } from "../components/AboutSection.jsx";
import { CodeTerminal } from "../components/CodeTerminal.jsx";
import { LabFeatures } from "../components/LabFeatures.jsx";
import { LabStats } from "../components/LabPanels.jsx";
import { BrowserFrame, BuildBadge, CaseVisual, Reveal } from "../components/Visuals.jsx";
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
        <span style={{ "--chars": english.length }}>{english}</span>
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

  // 作品ページから「/#about」のように来たときは、描画のあとでその位置へ移動する
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) window.document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
  }, []);

  return (
    <>
      <section className="band tone-ink hero-band">
        <div className="wrap hero">
          <div className="hero__copy">
            <p className="hero__name">
              {profile.nameEn}
              <span> / フルスタックエンジニア</span>
            </p>
            <h1>作って終わりにせず、動かした結果まで見ています。</h1>
            <p className="hero__lead">
              業務のルールを整理して、Webツール、データ処理、AIを使った自動化まで実装します。
              個人開発と業務ツールの開発で、何を課題と考え、何を判断し、どうなったかをまとめました。
              AIにコードを任せた作品と、自分で書いた作品があり、うまくいっていない結果もそのまま載せています。
            </p>
            <div className="hero__actions">
              <a href="#personal-title" className="button button--light">
                作品を見る
              </a>
              <a href="#work-title" className="hero__sub-link">
                実務のデモを試す →
              </a>
            </div>
          </div>
          <div className="hero__visual">
            {heroImages.slice(0, 2).map((item, index) => (
              <div aria-hidden="true" className={`hero__frame hero__frame--${index + 1}`} key={item.slug}>
                <BrowserFrame image={item.image} eager decorative />
              </div>
            ))}
            <CodeTerminal />
          </div>
        </div>
      </section>

      <AboutSection />

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
        <SectionHead english="./personal" title="個人開発" id="personal-title">
          自分で課題を決めて、作って公開しているものです。AI Product Lab はAIにコードを書かせて自分はレビューに回る実験、ほかの2つは基本的に自分でコードを書いたものです。
        </SectionHead>
      </section>

      <section className="band tone-ink" aria-labelledby="featured-title">
        <div className="wrap featured">
          <Reveal className="featured__copy">
            <p className="featured__tag">
              <span>{caseNumber(featuredCase)}</span>いちばん見てほしいもの
            </p>
            <h3 id="featured-title">{featuredCase.title}</h3>
            <p className="featured__build">
              <BuildBadge build={featuredCase.build} />
            </p>
            <p>{featuredCase.lead}</p>
            <ul className="agents" aria-label="社員のAI">
              <li>claude</li>
              <li>gpt</li>
              <li>gemini</li>
            </ul>
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
          <div className="featured__features">
            <h4>AIの社員がしていること</h4>
            <LabFeatures />
          </div>
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
                  <BuildBadge build={item.build} />
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
          <SectionHead english="./at-work" title="実務" id="work-title">
            仕事で作ったツールは、そのままでは公開できません。ここでは実務で作ったツールの仕組みを、
            架空のデータで動く公開用のデモとして作り直しています。内容を載せられない仕事は、概要だけを紹介します。
          </SectionHead>

          {workCases.filter((item) => item.demo).map((item) => (
            <Reveal key={item.slug}>
              <Link to={`/work/${item.slug}`} className="work-wide">
                <div className="work-wide__visual">
                  <CaseVisual item={item} />
                </div>
                <div className="work-wide__body">
                  <p className="work-card__meta">
                    <span>{caseNumber(item)}</span>
                    <em className="demo-badge">公開用デモ</em>
                    <BuildBadge build={item.build} />
                  </p>
                  <h3>{item.title}</h3>
                  <Summary summary={item.summary} />
                  <span className="more">考えたことを読む</span>
                </div>
              </Link>
              <Link to={`/demo/${item.slug}`} className="button work-wide__try">
                デモを試す
              </Link>
            </Reveal>
          ))}

          <Reveal className="work-compact">
            <h3 className="work-compact__title">そのほかの実務（概要のみ）</h3>
            <ul>
              {workCases
                .filter((item) => !item.demo)
                .map((item) => (
                  <li key={item.slug}>
                    <Link to={`/work/${item.slug}`} className="compact-card">
                      <p className="work-card__meta">
                        <span>{caseNumber(item)}</span>
                        <BuildBadge build={item.build} />
                      </p>
                      <h4>{item.title}</h4>
                      <p className="compact-card__text">{item.summary.result}</p>
                      <ul className="compact-card__stack">
                        {item.stack.slice(0, 5).map((tech) => (
                          <li key={tech}>{tech}</li>
                        ))}
                      </ul>
                      <span className="more">詳しく読む</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
