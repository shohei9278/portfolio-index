import { useEffect, useRef, useState } from "react";
import { LAB_AS_OF, labScreens, labStaff } from "../data/cases.js";
import { BrowserFrame } from "./Visuals.jsx";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

// ドット絵のオフィスを本番で再生した動画。動きを減らす設定の人には静止画だけを出す
export function OfficeVideo({ item, eager = false }) {
  const { image, video } = item;
  const reduce = usePrefersReducedMotion();
  const ref = useRef(null);

  // 画面の外にあるときは止めておく
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <figure className="browser office-video">
      <div className="browser__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{image.domain}</span>
      </div>
      {reduce ? (
        <img src={image.src} alt={image.alt} width="1352" height="904" loading={eager ? "eager" : "lazy"} />
      ) : (
        <video
          ref={ref}
          src={video.src}
          poster={image.src}
          width="1352"
          height="904"
          muted
          loop
          playsInline
          autoPlay
          preload={eager ? "auto" : "metadata"}
          aria-label={video.alt}
        />
      )}
      <figcaption className="office-video__caption">{video.caption}</figcaption>
    </figure>
  );
}

export function LabStaff() {
  return (
    <div className="lab-staff">
      <ul>
        {labStaff.map((member) => (
          <li className={`staff-card staff-card--${member.key}`} key={member.key}>
            <img src={member.robot} alt="" width="60" height="88" loading="lazy" />
            <div>
              <p className="staff-card__name">
                {member.name}
                <small>{member.company}</small>
              </p>
              <p className="staff-card__job">{member.job}</p>
              <p className="staff-card__score">
                選ばれた案 <strong>{member.picked}</strong>
                <span>{member.bias}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="lab-staff__note">
        アイデアは作者を伏せて3社全員で採点します。「選ばれた案」と、自分の案に甘いか辛いかは {LAB_AS_OF} 時点の実験の概要ページの値です。
      </p>
    </div>
  );
}

export function LabScreens() {
  return (
    <div className="lab-screens">
      {labScreens.map((screen) => (
        <figure className={`lab-screens__item lab-screens__item--${screen.key}`} key={screen.key}>
          <BrowserFrame image={screen} zoomable />
          <figcaption>{screen.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function LabShowcase() {
  return (
    <>
      <h4 className="lab-block__title">社員</h4>
      <LabStaff />
      <h4 className="lab-block__title">本物の画面</h4>
      <LabScreens />
    </>
  );
}
