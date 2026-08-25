import { jobTrend } from "../data/projects.js";
import { Icon } from "./Icon.jsx";

export function ProjectCard({ project, activeDemo, onSelectDemo }) {
  const activeClass =
    project.demo === activeDemo || (project.id === "integrated" && activeDemo === "event") ? " is-active" : "";

  return (
    <article className={`project-card project-card--${project.accent}${activeClass}`}>
      <div className="project-card__visual" aria-hidden="true">
        <MiniPreview project={project} />
      </div>
      <div className="project-card__body">
        <div className="project-card__titleline">
          <span className="project-icon">{project.icon}</span>
          <div>
            <p>{project.subtitle}</p>
            <h3>{project.title}</h3>
          </div>
        </div>
        <p className="project-summary">{project.summary}</p>
        <div className="metric-row">
          {project.metrics.map(([value, label]) => (
            <span key={`${project.id}-${label}`}>
              <strong>{value}</strong>
              {label}
            </span>
          ))}
        </div>
        <div className="stack-row">
          {project.stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        {project.readmePoints?.length ? (
          <div className="readme-panel">
            <div>
              <Icon>MD</Icon>
              <strong>{project.readmeTitle || "README要約"}</strong>
            </div>
            <ul>
              {project.readmePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {project.architecture ? <p>{project.architecture}</p> : null}
          </div>
        ) : null}
        <div className="card-actions">
          {project.demo ? (
            <button type="button" onClick={() => onSelectDemo(project.demo)}>
              <Icon>{">"}</Icon>
              動きを見る
            </button>
          ) : null}
          <a href={project.link} target="_blank" rel="noreferrer">
            <Icon>↗</Icon>
            {project.linkLabel || "開く"}
          </a>
          {project.repo ? (
            <a href={project.repo} target="_blank" rel="noreferrer">
              <Icon>GH</Icon>
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MiniPreview({ project }) {
  if (project.id === "integrated") {
    return (
      <div className="mini-delivery">
        <span>MAIL</span>
        <span>PDF</span>
        <span>PNG</span>
        <span>ZIP</span>
        <i />
      </div>
    );
  }

  if (project.id === "techscope") {
    return (
      <div className="mini-learning">
        <span>Learn</span>
        <span>Skill</span>
        <span>Article</span>
        <i>AI</i>
      </div>
    );
  }

  if (project.id === "event") {
    return (
      <div className="mini-board">
        <span />
        <span />
        <span />
        <i />
      </div>
    );
  }

  if (project.id === "jobs") {
    return (
      <div className="mini-chart">
        {jobTrend.map((value) => (
          <span key={value} style={{ "--height": `${value / 1.6}px` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="mini-pipeline">
      <span />
      <span />
      <span />
      <i />
    </div>
  );
}
