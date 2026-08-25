import { boardColumns } from "../data/projects.js";
import { Icon } from "./Icon.jsx";

export function EventDemo({ cards, setCards, filter, setFilter }) {
  const visibleCards = cards.filter((card) => {
    if (filter === "all") return true;
    if (filter === "active") return card.status !== "done";
    return card.outputs >= 3;
  });

  function moveCard(cardId, nextStatus) {
    setCards((current) =>
      current.map((card) => (card.id === cardId ? { ...card, status: nextStatus } : card)),
    );
  }

  return (
    <div className="event-demo">
      <div className="board-toolbar">
        <div className="search-pill">
          <Icon>S</Icon>
          <span>event / mail / asset</span>
        </div>
        <div className="filter-group" aria-label="Board filters">
          {[
            ["all", "すべて"],
            ["active", "進行中"],
            ["multi", "素材多め"],
          ].map(([key, label]) => (
            <button
              type="button"
              className={filter === key ? "is-active" : ""}
              key={key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="kanban-board">
        {boardColumns.map(([key, label, tone]) => {
          const columnCards = visibleCards.filter((card) => card.status === key);

          return (
            <section
              className={`kanban-column kanban-column--${tone}`}
              key={key}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => moveCard(event.dataTransfer.getData("text/plain"), key)}
            >
              <header>
                <span>{label}</span>
                <strong>{columnCards.length}</strong>
              </header>
              <div className="kanban-card-list">
                {columnCards.map((card) => (
                  <KanbanCard card={card} key={card.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({ card }) {
  return (
    <article
      className="kanban-card"
      draggable="true"
      onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
    >
      <div className="kanban-card__top">
        <span>{card.id}</span>
        <small>{card.date}</small>
      </div>
      <h3>{card.title}</h3>
      <div className="kanban-card__meta">
        <span>
          <Icon>M</Icon>
          {card.owner}
        </span>
        <span>
          <Icon>L</Icon>
          {card.outputs}
        </span>
      </div>
    </article>
  );
}
