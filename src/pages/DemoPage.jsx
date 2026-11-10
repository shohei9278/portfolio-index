import { RequestDemo } from "../demos/RequestDemo.jsx";
import { PdfCheckDemo } from "../demos/PdfCheckDemo.jsx";
import { Link } from "../router.jsx";

const DEMOS = {
  "case-management": RequestDemo,
  "pdf-check": PdfCheckDemo,
};

export function DemoPage({ item }) {
  const Demo = DEMOS[item.slug];

  return (
    <article className="wrap demo-page">
      <Link to={`/work/${item.slug}`} className="back-link">
        ← 作品のページへ
      </Link>
      <header className="demo-page__head">
        <p className="case-hero__path" aria-hidden="true">
          ~/demo/{item.slug}
        </p>
        <h1>{item.title}</h1>
        <p>{item.demo.description}</p>
        <p className="demo-page__note">
          実務のツールの仕組みを、架空のサンプルデータで公開用に作り直したデモです。ブラウザの中だけで動き、入力した内容は送信されません。
        </p>
      </header>
      <Demo />
    </article>
  );
}
