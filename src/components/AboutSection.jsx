import { cases, profile } from "../data/cases.js";
import { Link } from "../router.jsx";
import { ExternalLink } from "./ExternalLink.jsx";
import { Reveal } from "./Visuals.jsx";

// 経歴と技術は、職務経歴書（2026年9月7日時点）の内容に合わせている
const CAREER = [
  ["2017", "Web制作", "Webサイトのデザインとコーディング"],
  ["2018", "製薬業界向けのCRM", "Veeva CRM / Salesforce のコンテンツ制作と運用、その自動化"],
  ["2021", "フリーランス", "フロントエンドとバックエンドの開発、データ処理、AI活用、業務の自動化"],
];

const SKILLS = [
  {
    label: "フロントエンド",
    items: ["React", "Vue.js", "TypeScript", "JavaScript"],
    works: ["ai-job-dashboard", "double-check", "crm-tools"],
  },
  {
    label: "バックエンド",
    items: ["Node.js", "NestJS", "Prisma", "SQL", "PHP（WordPress）"],
    works: ["ai-job-dashboard", "techscope-ai", "medical-site"],
  },
  {
    label: "データ・AI",
    items: ["Python", "pandas", "Azure OpenAI Service", "LLM"],
    works: ["azure-migration", "ai-product-lab"],
  },
  {
    label: "CRM",
    items: ["Salesforce", "Veeva CRM", "Veeva Vault"],
    works: ["crm-tools"],
  },
  {
    label: "業務の自動化",
    items: ["Power Apps", "Power Automate", "Chrome拡張機能"],
    works: ["power-apps", "double-check", "case-management"],
  },
  {
    label: "クラウド・運用",
    items: ["Azure", "Vercel", "GitHub Actions", "Docker"],
    works: ["azure-migration", "ai-product-lab"],
  },
];

function titleOf(slug) {
  return cases.find((item) => item.slug === slug)?.shortTitle ?? cases.find((item) => item.slug === slug)?.title;
}

export function AboutSection() {
  return (
    <section className="wrap about" id="about" aria-labelledby="about-title">
      <Reveal className="about__head">
        <p className="about__en" aria-hidden="true">
          ./about
        </p>
        <h2 id="about-title">
          {profile.name}
          <small>フルスタックエンジニア</small>
        </h2>
      </Reveal>

      <Reveal className="about__grid">
        <div className="about__text">
          <p>
            2017年にWebサイトのデザインとコーディングからキャリアを始め、2018年からは製薬業界向けのCRM（Veeva CRM /
            Salesforce）のコンテンツ制作と運用、その自動化に携わってきました。
          </p>
          <p>
            2021年からはフリーランスとして、フロントエンドとバックエンドの開発、Python でのデータ処理、LLM
            を使った仕組みづくり、Power Platform での業務改善を手がけています。「仕組みで効率化する」ことを軸にしています。
          </p>
          <div className="about__next">
            <p className="about__label">これからやりたいこと</p>
            <p>
              生成AIで、コードを書く速さは誰でも上げられるようになりました。これから差が出るのは、何を作るかを決めることと、AIが作ったものを本番で安心して使える品質にすることだと考えています。
            </p>
            <p>
              これまで製薬業界の業務ツールや自動化で、現場のルールを整理して仕組みにすることを続けてきました。AI Product Lab では、AIに実装を任せたときのレビュー、テスト、費用と安全の管理を、実際に運用しながら作っています。
            </p>
            <p>
              今後は、業務の課題整理と要件定義から関わり、AIを組み込んだ機能や業務の仕組みを、設計からリリース後の改善まで担うエンジニアとして、事業に貢献したいです。
            </p>
          </div>
          <dl className="about__wish">
            <div>
              <dt>希望する働き方</dt>
              <dd>正社員</dd>
            </div>
          </dl>
          <div className="about__links">
            <a href="#contact">連絡先</a>
            <ExternalLink href={profile.github} label="about-github">
              GitHub
            </ExternalLink>
          </div>
        </div>

        <ol className="career">
          {CAREER.map(([year, title, detail]) => (
            <li key={year}>
              <span>{year}〜</span>
              <div>
                <strong>{title}</strong>
                <p>{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal>
        <h3 className="about__label">使える技術</h3>
        <dl className="skills">
          {SKILLS.map((group) => (
            <div key={group.label}>
              <dt>{group.label}</dt>
              <dd>
                <ul className="skills__items">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="skills__works">
                  {group.works.map((slug) => (
                    <Link to={`/work/${slug}`} key={slug}>
                      {titleOf(slug)}
                    </Link>
                  ))}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
