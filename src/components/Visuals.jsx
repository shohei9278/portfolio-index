import { useEffect, useRef, useState } from "react";

export function Reveal({ as: Tag = "div", className = "", children, ...props }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal${shown ? " is-shown" : ""} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function BrowserFrame({ image, eager = false, decorative = false, className = "" }) {
  return (
    <figure className={`browser ${className}`}>
      <div className="browser__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{image.domain}</span>
      </div>
      <img
        src={image.src}
        alt={decorative ? "" : image.alt}
        width="1400"
        height="875"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </figure>
  );
}

const LOOP_STEPS = ["学ぶ", "記録する", "スキル抽出", "次の提案", "日報"];
const LOOP = { cx: 320, cy: 200, rx: 225, ry: 132 };

function loopPoint(degrees) {
  const radians = (degrees * Math.PI) / 180;
  return [LOOP.cx + LOOP.rx * Math.cos(radians), LOOP.cy + LOOP.ry * Math.sin(radians)];
}

export function LearningLoop() {
  const stepAngle = 360 / LOOP_STEPS.length;

  return (
    <svg
      className="loop"
      viewBox="0 0 640 400"
      role="img"
      aria-label="学ぶ、記録する、スキル抽出、次の提案、日報、の順に学習が循環する図"
    >
      <ellipse cx={LOOP.cx} cy={LOOP.cy} rx={LOOP.rx} ry={LOOP.ry} className="loop__track" />
      {LOOP_STEPS.map((_, index) => {
        const angle = -90 + stepAngle * index + stepAngle / 2;
        const [x, y] = loopPoint(angle);
        const radians = (angle * Math.PI) / 180;
        const tangent =
          (Math.atan2(LOOP.ry * Math.cos(radians), -LOOP.rx * Math.sin(radians)) * 180) / Math.PI;
        return (
          <path
            key={angle}
            className="loop__arrow"
            d="M-7 -7 L7 0 L-7 7 Z"
            transform={`translate(${x} ${y}) rotate(${tangent})`}
          />
        );
      })}
      <text x={LOOP.cx} y={LOOP.cy - 4} className="loop__center">
        Learning
      </text>
      <text x={LOOP.cx} y={LOOP.cy + 30} className="loop__sub">
        記録が次の提案になる
      </text>
      {LOOP_STEPS.map((label, index) => {
        const [x, y] = loopPoint(-90 + stepAngle * index);
        return (
          <g key={label} transform={`translate(${x} ${y})`}>
            <rect x="-62" y="-24" width="124" height="48" rx="24" className="loop__node" />
            <text y="7" className="loop__label">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CaseVisual({ item, eager = false }) {
  if (item.figure === "learning-loop") return <LearningLoop />;
  return <BrowserFrame image={item.image} eager={eager} />;
}
