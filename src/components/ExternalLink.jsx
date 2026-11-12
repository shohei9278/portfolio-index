import { track } from "../analytics.js";

export function ExternalLink({ href, label, children, ...props }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => track("Portfolio Link", { label })}
      {...props}
    >
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}
