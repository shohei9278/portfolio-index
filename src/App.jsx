import { useEffect } from "react";
import { ContactSection } from "./components/ContactSection.jsx";
import { cases, profile } from "./data/cases.js";
import { CasePage } from "./pages/CasePage.jsx";
import { DemoPage } from "./pages/DemoPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { Link, usePath } from "./router.jsx";

const SITE_TITLE = `${profile.nameEn}（${profile.name}）| Portfolio`;

export default function App() {
  const path = usePath();
  const slug = path.match(/^\/work\/([^/]+)$/)?.[1];
  const activeCase = cases.find((item) => item.slug === slug);
  const demoSlug = path.match(/^\/demo\/([^/]+)$/)?.[1];
  const demoCase = cases.find((item) => item.demo && item.slug === demoSlug);
  const isHome = path === "/";

  useEffect(() => {
    if (isHome) document.title = SITE_TITLE;
    else if (demoCase) document.title = `デモ: ${demoCase.title} | ${profile.nameEn}`;
    else if (activeCase) document.title = `${activeCase.title} | ${profile.nameEn}`;
    else document.title = `ページが見つかりません | ${profile.nameEn}`;
  }, [isHome, activeCase, demoCase]);

  return (
    <>
      <header className="site-header">
        <div className="wrap site-header__inner">
          <Link to="/" className="site-header__name">
            {profile.nameEn}
          </Link>
          <nav aria-label="サイト内">
            <a href="/#about" className="nav-optional">
              プロフィール
            </a>
            <a href="/#personal-title">個人開発</a>
            <a href="/#work-title">実務</a>
            <a href="#contact">連絡先</a>
          </nav>
        </div>
      </header>

      <main>
        {isHome ? (
          <HomePage />
        ) : demoCase ? (
          <DemoPage item={demoCase} key={demoCase.slug} />
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
