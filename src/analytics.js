import { track as vercelTrack } from "@vercel/analytics/react";

// GA4 は本番のURLで開いたときだけ読み込む。PRごとのプレビューや手元の確認では送らない
const GA_ID = "G-Q9KV78SQY7";
const PRODUCTION_HOST = "portfolio-index-ten.vercel.app";

const gaEnabled = typeof window !== "undefined" && window.location.hostname === PRODUCTION_HOST;

function gtag() {
  // gtag.js は arguments オブジェクトをそのまま受け取る（配列にすると動かない）
  window.dataLayer.push(arguments);
}

export function initAnalytics() {
  if (!gaEnabled || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = gtag;
  gtag("js", new Date());
  // 閲覧は GA4 の自動計測に任せる。ページを読み直さない画面の切り替えも、
  // GA4 の「ブラウザの履歴イベントに基づくページの変更」で数えられる（自分でも送ると二重になる）
  gtag("config", GA_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

// 操作の記録は Vercel Analytics と GA4 の両方に送る
export function track(name, props = {}) {
  vercelTrack(name, props);
  if (!gaEnabled || !window.gtag) return;
  const event = name === "Portfolio Link" ? "link_click" : props.action ?? "portfolio_action";
  window.gtag("event", event, { label: props.label });
}
