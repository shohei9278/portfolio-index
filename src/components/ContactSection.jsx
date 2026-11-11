import { useState } from "react";
import { track } from "@vercel/analytics/react";
import { profile } from "../data/cases.js";
import { ExternalLink } from "./ExternalLink.jsx";

function composeMail(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("name");
  const company = form.get("company");
  const lines = [`お名前: ${name}`];
  if (company) lines.push(`会社名: ${company}`);
  lines.push("", form.get("message"));

  const subject = encodeURIComponent(`ポートフォリオからのお問い合わせ（${name}）`);
  const body = encodeURIComponent(lines.join("\n"));
  track("Portfolio Action", { action: "contact_compose" });
  window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
}

// トップでは問い合わせフォームまで出し、作品やデモのページでは連絡先だけの短い形にする
export function ContactSection({ compact = false }) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <footer className={`site-footer tone-ink${compact ? " site-footer--compact" : ""}`} id="contact">
      <div className={`wrap contact${compact ? " contact--compact" : ""}`}>
        <div className="contact__info">
          <p className="contact__title" aria-hidden="true">
            ./contact
          </p>
          <h2>連絡先</h2>
          <p>
            {profile.name}（{profile.nameEn}）へのご連絡は、フォームかメールでお願いします。
          </p>
          <div className="contact__mail">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <button type="button" onClick={copyAddress}>
              {copied ? "コピーしました" : "コピー"}
            </button>
          </div>
          <div className="contact__links">
            <ExternalLink href={profile.github} label="footer-github">
              GitHub
            </ExternalLink>
            <ExternalLink href={profile.note} label="footer-note">
              note
            </ExternalLink>
          </div>
        </div>

        {compact ? (
          <a href="/#contact" className="button button--light contact__to-form">
            フォームで連絡する
          </a>
        ) : (
        <form className="contact-form" onSubmit={composeMail}>
          <label>
            <span>お名前</span>
            <input name="name" autoComplete="name" required />
          </label>
          <label>
            <span>
              会社名<small>任意</small>
            </span>
            <input name="company" autoComplete="organization" />
          </label>
          <label>
            <span>内容</span>
            <textarea name="message" rows="5" required />
          </label>
          <button type="submit" className="button button--light">
            メールを作成する
          </button>
          <p>お使いのメールアプリが開きます。入力した内容はこのサイトに保存されません。</p>
        </form>
        )}

        <p className="contact__credit">このサイトの実装には Claude Code を使っています。</p>
      </div>
    </footer>
  );
}
