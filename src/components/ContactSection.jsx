import { useState } from "react";
import { track } from "../analytics.js";
import { profile } from "../data/cases.js";
import { ExternalLink } from "./ExternalLink.jsx";

// フォームの送り先（Formspree）。https://formspree.io/f/<ID> の <ID>（公開しても困らない値）
// 前はメールアプリを開いていたが、メールアプリを設定していないパソコンでは Outlook の初期設定が開いてしまうため、
// サイトからそのまま送る形にした（運営者が決めた）
const FORMSPREE_ID = "mjywlzny";

async function sendForm(form) {
  form.set("_subject", `ポートフォリオからのお問い合わせ（${form.get("name")}）`);
  const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: "POST",
    body: form,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`送信に失敗しました（${res.status}）`);
}

// トップでは問い合わせフォームまで出し、作品やデモのページでは連絡先だけの短い形にする
// メールアドレスは載せず、連絡はフォームからにする（送れなかったときだけ、案内の文にアドレスを出す。運営者が決めた）
export function ContactSection({ compact = false }) {
  // idle / sending / sent / error
  const [status, setStatus] = useState("idle");

  async function onSubmit(event) {
    event.preventDefault();
    const el = event.currentTarget;
    const form = new FormData(el);
    // 人には見えない欄に入力があれば、いたずらの送信とみなして送らない（送れたように見せる）
    if (form.get("_gotcha")) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      await sendForm(form);
      track("Portfolio Action", { action: "contact_send" });
      el.reset();
      setStatus("sent");
    } catch {
      track("Portfolio Action", { action: "contact_send_error" });
      setStatus("error");
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
            {profile.name}（{profile.nameEn}）へのご連絡は、フォームからお願いします。
          </p>
          <div className="contact__links">
            <ExternalLink href={profile.github} label="footer-github">
              GitHub
            </ExternalLink>
            <ExternalLink href={profile.zenn} label="footer-zenn">
              Zenn
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
        <form className="contact-form" onSubmit={onSubmit}>
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
            <span>メールアドレス</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <span>内容</span>
            <textarea name="message" rows="5" required />
          </label>
          {/* いたずらの送信よけ。人には見えず、読み上げもされない欄 */}
          <div className="contact-form__trap" aria-hidden="true">
            <label>
              <span>この欄は空のままにしてください</span>
              <input name="_gotcha" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <button type="submit" className="button button--light" disabled={status === "sending"}>
            {status === "sending" ? "送信しています…" : "送信する"}
          </button>
          <p className="contact-form__status" role="status" aria-live="polite">
            {status === "sent"
              ? "送信しました。ありがとうございます。返信は、入力いただいたメールアドレスにお送りします。"
              : status === "error"
                ? `送信できませんでした。お手数ですが、${profile.email} に直接お送りください。`
                : ""}
          </p>
          <p>送信した内容は、フォームの送信サービス（Formspree）を通して、メールで届きます。このサイトには保存されません。</p>
        </form>
        )}

        <p className="contact__credit">このサイトの実装には Claude Code を使っています。</p>
      </div>
    </footer>
  );
}
