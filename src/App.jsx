import { useState } from "react";
import { track } from "@vercel/analytics/react";
import { EventDemo } from "./components/EventDemo.jsx";
import { Icon } from "./components/Icon.jsx";
import { OpsDemo } from "./components/OpsDemo.jsx";
import { ProjectCard } from "./components/ProjectCard.jsx";
import { initialCards, projects } from "./data/projects.js";

const projectGroups = [
  {
    id: "portfolio",
    eyebrow: "Portfolio",
    title: "公開中のポートフォリオ",
    description: "個人開発として公開しているプロダクト。外部URLからそのまま確認できます。",
  },
  {
    id: "work-demo",
    eyebrow: "Business Tool",
    title: "実務制作ツールのポートフォリオ版",
    description:
      "実際に業務で作成したツールを、固有名詞と実データだけ差し替えて公開用にしたものです。何の作業をどう効率化したかを、動く画面で見せます。",
  },
];

const reviewGuide = [
  {
    badge: "5 min",
    title: "まず見る順番",
    body: "AI Job Dashboard、TechScope AIで個人開発の設計を確認し、実務制作ツールのデモで業務自動化の実装範囲を確認できます。",
  },
  {
    badge: "WORK",
    title: "実務ツールの見どころ",
    body: "依頼メール、添付PDF、案件ボード、PDF解析、定型バナー生成、納品ZIPまでの一連の流れを動く画面で見せています。",
  },
  {
    badge: "SAFE",
    title: "公開用の配慮",
    body: "会社名、実メール、個人名、ローカルパスは掲載せず、サンプルPDFと匿名データで処理の流れだけ確認できる構成です。",
  },
];

const profileLinks = [
  ["GitHub", "https://github.com/shohei9278"],
  ["作品を見る", "#portfolio-projects"],
];

function trackPortfolioAction(action, label) {
  track("Portfolio Action", { action, label });
}

export default function App() {
  const [activeDemo, setActiveDemo] = useState("event");
  const [opsRunCount, setOpsRunCount] = useState(1);
  const [cards, setCards] = useState(() => initialCards.map((card) => ({ ...card })));
  const [filter, setFilter] = useState("all");
  const activeProject = projects.find((project) => project.demo === activeDemo) || projects[0];
  const demoTitle = activeDemo === "event" ? "案件ボードの進行イメージ" : activeProject.title;

  function selectDemo(nextDemo) {
    setActiveDemo(nextDemo);
    requestAnimationFrame(() => {
      document.querySelector(".demo-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className="portfolio">
      <section className="topbar" aria-label="Portfolio header">
        <div className="brand-lockup">
          <span className="brand-mark">PI</span>
          <div>
            <p>Portfolio Index</p>
            <h1>ポートフォリオ一覧</h1>
          </div>
        </div>
        <nav className="top-actions" aria-label="Project links">
          {projects.map((project) => (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              key={project.id}
              onClick={() => trackPortfolioAction("top_project_open", project.id)}
            >
              <span>{project.title}</span>
              <Icon>↗</Icon>
            </a>
          ))}
        </nav>
      </section>

      <section className="intro-grid">
        <div className="intro-copy">
          <p className="eyebrow">Portfolio Hub</p>
          <h2>公開プロダクトと、実務で作った業務ツールを一箇所に。</h2>
          <p>
            個人開発のプロダクトは公開URLへ、実務で作成したツールは会社名や実データを外した公開用デモへ案内します。
            何を作ったのか、どの業務をどこまで自動化したのかが分かる一覧にしました。
          </p>
          <div className="intro-actions">
            <a href="#portfolio-projects" onClick={() => trackPortfolioAction("intro_scroll", "portfolio-projects")}>
              <Icon>{">"}</Icon>
              作品一覧
            </a>
            <button
              type="button"
              onClick={() => {
                trackPortfolioAction("intro_demo_open", "event");
                selectDemo("event");
              }}
            >
              <Icon>K</Icon>
              実務制作ツール
            </button>
          </div>
        </div>

        <div className="system-snapshot" aria-label="Portfolio summary">
          <div className="snapshot-header">
            <span>掲載内容</span>
            <strong>{projects.length} projects</strong>
          </div>
          <div className="snapshot-route">
            <span>公開URL</span>
            <Icon>{">"}</Icon>
            <span>GitHub</span>
            <Icon>{">"}</Icon>
            <span>動くデモ</span>
          </div>
          <div className="snapshot-projects">
            {projects.map((project) => (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                key={project.id}
                onClick={() => trackPortfolioAction("snapshot_project_open", project.id)}
              >
                <span className={`snapshot-project-icon snapshot-project-icon--${project.accent}`}>{project.icon}</span>
                <div>
                  <strong>{project.title}</strong>
                  <small>{project.group === "work-demo" ? "業務ツールの公開用デモ" : "公開中の個人プロダクト"}</small>
                </div>
                <Icon>↗</Icon>
              </a>
            ))}
          </div>
          <div className="snapshot-list">
            <span><i className="check">2</i> 個人開発プロダクト</span>
            <span><i className="check">1</i> 実務制作ツールのポートフォリオ版</span>
            <span><i className="check">GH</i> 各カードからGitHubも確認可能</span>
          </div>
        </div>
      </section>

      <section className="review-guide" aria-label="見てほしいポイント">
        <div className="review-guide__heading">
          <div>
            <p className="eyebrow">Review Points</p>
            <h2>見てほしいポイント</h2>
          </div>
          <p>公開URLだけで動作確認できるものと、GitHubで実装範囲を確認できるものを整理しています。</p>
        </div>
        <div className="review-guide__cards">
          {reviewGuide.map((item) => (
            <article className="review-guide__card" key={item.title}>
              <span>{item.badge}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hosting-notice" aria-label="初回表示について">
        <Icon>i</Icon>
        <div>
          <strong>初回表示に時間がかかる場合があります</strong>
          <p>
            AI Job Dashboard、TechScope AIなどは無料ホスティング環境を利用しているため、
            バックエンドがスリープ中の場合は初回表示や一部機能の応答に少し時間がかかることがあります。
          </p>
        </div>
      </section>

      <div className="project-sections" id="portfolio-projects">
        {projectGroups.map((group) => {
          const groupProjects = projects.filter((project) => project.group === group.id);

          return (
            <section className="project-section" aria-label={group.title} key={group.id}>
              <div className="project-section__heading">
                <div>
                  <p className="eyebrow">{group.eyebrow}</p>
                  <h2>{group.title}</h2>
                </div>
                <p>{group.description}</p>
              </div>
              <div className="project-grid">
                {groupProjects.map((project) => (
                  <ProjectCard
                    activeDemo={activeDemo}
                    key={project.id}
                    project={project}
                    onSelectDemo={selectDemo}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="profile-strip" aria-label="About">
        <div>
          <p className="eyebrow">About</p>
          <h2>業務の流れを理解して、使える形まで作ることを重視しています。</h2>
        </div>
        <div className="profile-strip__body">
          <p>
            Reactの画面設計、API連携、データ保存、PDFや画像生成まわりの自動化を組み合わせて、
            手作業で繰り返していた業務をデモとして見える形にしています。
          </p>
          <div className="profile-links">
            {profileLinks.map(([label, href]) => (
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                key={label}
                onClick={() => trackPortfolioAction("profile_link_open", label)}
              >
                <Icon>{href.startsWith("http") ? "↗" : ">"}</Icon>
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="demo-section" aria-label="Interactive demo">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Business Tool Preview</p>
            <h2>{demoTitle}</h2>
          </div>
          <div className="demo-tabs" role="tablist" aria-label="Demo selector">
            <button
              type="button"
              className={activeDemo === "ops" ? "is-active" : ""}
              onClick={() => {
                trackPortfolioAction("demo_tab_open", "ops");
                setActiveDemo("ops");
              }}
            >
              <Icon>RA</Icon>
              自動化フロー
            </button>
            <button
              type="button"
              className={activeDemo === "event" ? "is-active" : ""}
              onClick={() => {
                trackPortfolioAction("demo_tab_open", "event");
                setActiveDemo("event");
              }}
            >
              <Icon>EV</Icon>
              ボード操作
            </button>
          </div>
        </div>
        {activeDemo === "ops" ? (
          <OpsDemo runCount={opsRunCount} onNextStep={() => setOpsRunCount((count) => count + 1)} />
        ) : (
          <EventDemo cards={cards} filter={filter} setCards={setCards} setFilter={setFilter} />
        )}
      </section>

      <section className="launch-strip" aria-label="Launch links">
        <div>
          <p className="eyebrow">Launch</p>
          <h2>各プロジェクトを開く</h2>
        </div>
        <div className="launch-links">
          {projects.map((project) => (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              key={project.id}
              onClick={() => trackPortfolioAction("launch_project_open", project.id)}
            >
              <Icon>↗</Icon>
              <span>{project.title}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
