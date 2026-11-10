import { useSyncExternalStore } from "react";

const CHANGE_EVENT = "portfolio:navigate";

function subscribe(onChange) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function currentPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

export function usePath() {
  return useSyncExternalStore(subscribe, currentPath);
}

export function Link({ to, onClick, children, ...props }) {
  function handleClick(event) {
    onClick?.(event);
    const isPlainClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (!isPlainClick || event.defaultPrevented) return;

    event.preventDefault();
    window.history.pushState(null, "", to);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    window.scrollTo(0, 0);
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
