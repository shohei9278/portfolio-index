import { useEffect } from "react";
import { ExternalLink } from "./components/ExternalLink.jsx";
import { cases, profile } from "./data/cases.js";
import { CasePage } from "./pages/CasePage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { Link, usePath } from "./router.jsx";

const SITE_TITLE = `${profile.name} | ポートフォリオ`;

export default function App() {
  const path = usePath();
  const slug = path.match(/^\/work\/([^/]+)$/)?.[1];
  const activeCase = cases.find((item) => item.slug === slug);
  const isHome = path === "/";

  useEffect(() => {
    if (isHome) document.title = SITE_TITLE;
    else if (activeCase) document.title = `${activeCase.title} | ${profile.name}`;
    else document.title = `ページが見つかりません | ${profile.name}`;
  }, [isHome, activeCase]);

  return (
    <div className="site">
      <header className="site-header">
        <Link to="/" className="site-header__name">
          {profile.name}
        </Link>
        <nav aria-label="サイト内">
          <Link to="/">作品</Link>
          <ExternalLink href={profile.github} label="header-github">
            GitHub
          </ExternalLink>
          <a href="#contact">連絡先</a>
        </nav>
      </header>

      <main>
        {isHome ? <HomePage /> : activeCase ? <CasePage item={activeCase} /> : <NotFoundPage />}
      </main>

      <footer className="site-footer" id="contact">
        <div>
          <p className="site-footer__label">連絡先</p>
          <a className="site-footer__mail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </div>
        <div className="site-footer__side">
          <ExternalLink href={profile.github} label="footer-github">
            GitHub
          </ExternalLink>
          <p>このサイトの実装には Claude Code を使っています。</p>
        </div>
      </footer>
    </div>
  );
}
