import { links, opsSteps } from "../data/projects.js";
import { Icon } from "./Icon.jsx";

export function OpsDemo({ runCount, onNextStep }) {
  const activeIndex = (runCount - 1) % opsSteps.length;

  return (
    <div className="ops-demo">
      <div className="ops-left">
        <div className="demo-panel-head">
          <span>
            <Icon>*</Icon>
            添付PDFから定型バナーへ
          </span>
          <button type="button" onClick={onNextStep}>
            <Icon>{">"}</Icon>
            次の工程
          </button>
        </div>
        <div className="step-rail">
          {opsSteps.map(([title, detail, stepIcon], index) => {
            const statusClass = index < activeIndex ? " is-done" : index === activeIndex ? " is-active" : "";

            return (
              <div className={`step-item${statusClass}`} key={title}>
                <span>{stepIcon}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ops-workspace">
        <div className="file-drop">
          <span className="file-icon">PDF</span>
          <div>
            <strong>件名つきの依頼メールと添付PDF</strong>
            <span>フォーム送信で受信箱へ入り、案件カードと定型バナーの編集データに変換</span>
          </div>
        </div>
        <div className="sample-input-grid">
          <div>
            <span>メールサンプル</span>
            <strong>件名: オンライン講演 定型バナー制作依頼</strong>
            <small>本文の追加依頼は、CTAなどの差し替え指示として反映</small>
          </div>
          <div>
            <span>添付PDFビューア</span>
            <strong>案件ごとに違う案内PDFを表示して解析</strong>
            <small>日時、形式、講演タイトル、登壇者を定型バナー枠へ反映</small>
          </div>
        </div>
        <div className="mapping-table" aria-label="Mock mapping table">
          <div className="table-row table-head">
            <span>Step</span>
            <span>Result</span>
            <span>Status</span>
          </div>
          <div className="table-row">
            <span>メール解析</span>
            <span>案件名 / 期限 / 添付 / 必要物を抽出</span>
            <strong>done</strong>
          </div>
          <div className="table-row">
            <span>案件作成</span>
            <span>管理カードと詳細画面に自動転記</span>
            <strong>done</strong>
          </div>
          <div className="table-row">
            <span>PDF解析・定型バナー生成</span>
            <span>抽出値を決まったレイアウトの各枠へ流し込み</span>
            <strong>live</strong>
          </div>
          <div className="table-row">
            <span>納品ZIP作成</span>
            <span>生成バナー、入稿データ、納品メモをZIP化</span>
            <strong>ready</strong>
          </div>
        </div>
        <div className="output-row">
          <div>
            <span className="inline-icon">OK</span>
            <span>起票、PDF解析、定型バナー流し込み、納品データ作成までを一本化</span>
            <strong>ready</strong>
          </div>
          <a href={links.event} target="_blank" rel="noreferrer">
            <Icon>↗</Icon>
            Open automation demo
          </a>
        </div>
      </div>
    </div>
  );
}
