import { labScreens, labStaff } from "../data/cases.js";
import { labStaffScore, useLabNumbers } from "../data/labNumbers.js";
import { BrowserFrame } from "./Visuals.jsx";

// 社員の id（cases.js の key）と、数字の入口の id
const STAFF_ID = { claude: "anthropic", gpt: "openai", gemini: "google" };

export function LabStaff() {
  const n = useLabNumbers();
  return (
    <div className="lab-staff">
      <ul>
        {labStaff.map((member) => {
          const score = labStaffScore(n, STAFF_ID[member.key]);
          return (
          <li className={`staff-card staff-card--${member.key}`} key={member.key}>
            <img src={member.robot} alt="" width="60" height="88" loading="lazy" />
            <div>
              <p className="staff-card__name">
                {member.name}
                <small>{member.company}</small>
              </p>
              <p className="staff-card__job">{member.job}</p>
              {score ? (
                <p className="staff-card__score">
                  選ばれた案 <strong>{score.picked}</strong>
                  <span>{score.bias}</span>
                </p>
              ) : null}
            </div>
          </li>
          );
        })}
      </ul>
      <p className="lab-staff__note">
        アイデアは作者を伏せて3社全員で採点します。「選ばれた案」と、自分の案に甘いか辛いかは {n.asOf} 時点の実験の概要ページの値です。
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
