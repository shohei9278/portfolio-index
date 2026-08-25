import { useState } from "react";
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
            <a href={project.link} target="_blank" rel="noreferrer" key={project.id}>
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
            <a href="#portfolio-projects">
              <Icon>{">"}</Icon>
              作品一覧
            </a>
            <button type="button" onClick={() => selectDemo("event")}>
              <Icon>K</Icon>
              実務制作ツール
            </button>
          </div>
        </div>

        <div className="system-snapshot" aria-label="Portfolio summary">
          <div className="snapshot-header">
            <span>project map</span>
            <strong>{projects.length} projects</strong>
          </div>
          <div className="snapshot-route">
            <span>Portfolio</span>
            <Icon>{">"}</Icon>
            <span>Business Tool</span>
            <Icon>{">"}</Icon>
            <span>Launch</span>
          </div>
          <div className="snapshot-bars">
            <i style={{ "--value": "72%" }} />
            <i style={{ "--value": "88%" }} />
            <i style={{ "--value": "56%" }} />
          </div>
          <div className="snapshot-list">
            <span><i className="check">2</i> 公開中の個人プロダクト</span>
            <span><i className="check">1</i> 実務制作ツールの公開用デモ</span>
            <span><i className="check">OK</i> 公開URLとローカルソースを整理</span>
          </div>
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

      <section className="demo-section" aria-label="Interactive demo">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Business Tool Preview</p>
            <h2>{demoTitle}</h2>
          </div>
          <div className="demo-tabs" role="tablist" aria-label="Demo selector">
            <button type="button" className={activeDemo === "ops" ? "is-active" : ""} onClick={() => setActiveDemo("ops")}>
              <Icon>RA</Icon>
              自動化フロー
            </button>
            <button type="button" className={activeDemo === "event" ? "is-active" : ""} onClick={() => setActiveDemo("event")}>
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
            <a href={project.link} target="_blank" rel="noreferrer" key={project.id}>
              <Icon>↗</Icon>
              <span>{project.title}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
