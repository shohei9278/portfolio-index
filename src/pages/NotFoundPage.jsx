import { Link } from "../router.jsx";

export function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>ページが見つかりません</h1>
      <Link to="/" className="button">
        作品一覧へ
      </Link>
    </section>
  );
}
