import { LabStats } from "../components/LabPanels.jsx";
import { featuredCase, personalCases, profile, workCases } from "../data/cases.js";
import { Link } from "../router.jsx";

function Summary({ summary }) {
  return (
    <dl className="summary">
      <div>
        <dt>課題</dt>
        <dd>{summary.problem}</dd>
      </div>
      <div>
        <dt>判断</dt>
        <dd>{summary.decision}</dd>
      </div>
      <div>
        <dt>結果</dt>
        <dd>{summary.result}</dd>
      </div>
    </dl>
  );
}

function WorkList({ items }) {
  return (
    <ul className="works">
      {items.map((item) => (
        <li key={item.slug}>
          <Link to={`/work/${item.slug}`} className="work-row">
            <span className="work-row__title">
              <small>{item.kicker}</small>
              <strong>{item.title}</strong>
            </span>
            <Summary summary={item.summary} />
            <span className="work-row__more">詳しく読む →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="hero__name">{profile.name} のポートフォリオ</p>
        <h1>作って終わりにせず、動かした結果まで見ています。</h1>
        <p className="hero__lead">
          個人開発と業務ツールの開発で、何を課題と考え、何を判断し、どうなったかをまとめました。
          うまくいっていない結果も、そのまま載せています。
        </p>
      </section>

      <section className="category" aria-labelledby="personal-title">
        <div className="category__head">
          <h2 id="personal-title">個人開発</h2>
          <p>自分で課題を決めて、作って公開しているものです。</p>
        </div>

        <div className="featured">
          <div className="featured__head">
            <p className="eyebrow">いちばん見てほしいもの</p>
            <h3>{featuredCase.title}</h3>
            <p>{featuredCase.lead}</p>
          </div>
          <Summary summary={featuredCase.summary} />
          <LabStats />
          <Link to={`/work/${featuredCase.slug}`} className="button">
            運用の設計と判断を読む
          </Link>
        </div>

        <WorkList items={personalCases} />
      </section>

      <section className="category" aria-labelledby="work-title">
        <div className="category__head">
          <h2 id="work-title">実務</h2>
          <p>
            仕事で作ったツールは、そのままでは公開できません。ここでは実務で作った2つのツールを組み合わせて、
            会社の情報を含まない公開用のデモにしたものを載せています。
          </p>
        </div>

        <WorkList items={workCases} />
      </section>
    </>
  );
}
