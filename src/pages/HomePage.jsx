import { LabStats } from "../components/LabPanels.jsx";
import { featuredCase, otherCases, profile } from "../data/cases.js";
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

      <section className="featured" aria-labelledby="featured-title">
        <div className="featured__head">
          <p className="eyebrow">いちばん見てほしいもの</p>
          <h2 id="featured-title">{featuredCase.title}</h2>
          <p>{featuredCase.lead}</p>
        </div>
        <Summary summary={featuredCase.summary} />
        <LabStats />
        <Link to={`/work/${featuredCase.slug}`} className="button">
          運用の設計と判断を読む
        </Link>
      </section>

      <section className="works" aria-labelledby="works-title">
        <h2 id="works-title">その他の作品</h2>
        <ul>
          {otherCases.map((item) => (
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
      </section>
    </>
  );
}
