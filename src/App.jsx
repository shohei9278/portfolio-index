import { useEffect } from "react";
import { ContactSection } from "./components/ContactSection.jsx";
import { ExternalLink } from "./components/ExternalLink.jsx";
import { cases, profile } from "./data/cases.js";
import { CasePage } from "./pages/CasePage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { Link, usePath } from "./router.jsx";

const SITE_TITLE = `${profile.nameEn}（${profile.name}）| Portfolio`;

export default function App() {
  const path = usePath();
  const slug = path.match(/^\/work\/([^/]+)$/)?.[1];
  const activeCase = cases.find((item) => item.slug === slug);
  const isHome = path === "/";

  useEffect(() => {
    if (isHome) document.title = SITE_TITLE;
    else if (activeCase) document.title = `${activeCase.title} | ${profile.nameEn}`;
    else document.title = `ページが見つかりません | ${profile.nameEn}`;
  }, [isHome, activeCase]);

  return (
    <>
      <header className="site-header">
        <div className="wrap site-header__inner">
          <Link to="/" className="site-header__name">
            {profile.nameEn}
          </Link>
          <nav aria-label="サイト内">
            <Link to="/">作品</Link>
            <ExternalLink href={profile.github} label="header-github">
              GitHub
            </ExternalLink>
            <a href="#contact">連絡先</a>
          </nav>
        </div>
      </header>

      <main>
        {isHome ? (
          <HomePage />
        ) : activeCase ? (
          <CasePage item={activeCase} key={activeCase.slug} />
        ) : (
          <NotFoundPage />
        )}
      </main>

      <ContactSection />
    </>
  );
}
