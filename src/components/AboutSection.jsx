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
    items: ["Node.js", "NestJS", "Prisma", "SQL"],
    works: ["ai-job-dashboard", "techscope-ai"],
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
              AIがコードを書けるようになり、何を作るかを決める上流工程がより大事になると考えています。課題の整理、要件定義、設計といった上流に軸足を置き、AIも使いながら実装まで見られるエンジニアとして働きたいです。
            </p>
          </div>
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
