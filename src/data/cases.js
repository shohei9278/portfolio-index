// 掲載する内容は、公開ページ、公開リポジトリ、本人の説明で確かめられる事実だけにする。
// 作品の画像は2026年11月10日に撮影した実際の画面。
// AI Product Lab の数字は手で写したものなので、更新するときは LAB_AS_OF と labStats を一緒に直す。

export const profile = {
  name: "中原 翔平",
  email: "sn920708@gmail.com",
  github: "https://github.com/shohei9278",
};

const LAB = "https://ai-lab-dashboard-production-fc9e.up.railway.app";
const LAB_REPO = "https://github.com/shohei9278/ai-lab-dashboard";
const JOB_REPO = "https://github.com/shohei9278/ai-job-dashboard";
const TECHSCOPE_REPO = "https://github.com/shohei9278/techscope-ai";
const ROUTINE_REPO = "https://github.com/shohei9278/event-operations-demo";

export const LAB_AS_OF = "2026年11月10日";

export const labStats = [
  ["AIが出したアイデア", "102", "件"],
  ["進めた案件", "17", "件"],
  ["公開した案件", "13", "件"],
  ["訪問（累計）", "93", "人"],
  ["登録・利用（累計）", "2", "件"],
  ["AI費用（累計）", "8,657", "円"],
];

export const labFlow = [
  { who: "ai", label: "AIが実装", note: "コード生成は主に Claude Code" },
  { who: "ai", label: "別のAIがレビュー", note: "GPTがPRにコメント。マージは止めない" },
  { who: "auto", label: "自動チェック", note: "lint、テスト、ビルド、型チェック" },
  { who: "human", label: "人が動作確認", note: "画面を見て、直すかどうかを決める" },
  { who: "human", label: "マージして本番へ", note: "公開後に主要ページの表示を自動で確認" },
];

export const CATEGORY_LABELS = {
  personal: "個人開発",
  work: "実務",
};

export const cases = [
  {
    slug: "ai-product-lab",
    category: "personal",
    tone: "ink",
    image: {
      src: "/works/ai-product-lab.jpg",
      alt: "AI Product Lab のダッシュボード。人の確認待ちの案件と、公開数や処理数の数字が並んでいる画面",
      domain: "ai-lab-dashboard",
    },
    gallery: {
      src: "/works/hitoride.jpg",
      alt: "AIが企画して作った小さなWebツールの一覧ページ",
      domain: "hitoride.vercel.app",
      caption: "AIが企画して公開したツールの一覧",
    },
    title: "AI Product Lab",
    kicker: "AIにプロダクト運営を任せる実験",
    lead: "Claude・GPT・Gemini の3社のAIを社員にして、アイデア出し、採点、制作、公開、SNS集客、続ける・撤退の判断までを任せています。人は社長の立場で確認します。",
    summary: {
      problem: "AIに運営を任せると、どこまで動き、どこで人が必要になるのか。",
      decision: "人の仕事を問題の発見、方針決定、動作確認に絞り、人とAIの役割を公開で記録する。",
      result: "公開13件。登録・利用はまだ2件で、集客が課題です。",
    },
    role: "企画、方針決定、動作確認。コード生成は主に Claude Code を使い、原因調査や修正にもAIを使っています。",
    period: "運用中",
    stack: ["Next.js", "TypeScript", "SQLite", "Supabase", "GitHub Actions", "Railway", "Vercel"],
    links: [
      ["実験の概要", `${LAB}/showcase`],
      ["人とAIの役割の記録", `${LAB}/interventions`],
      ["ダッシュボード", `${LAB}/`],
      ["作ったツールの一覧", "https://hitoride.vercel.app"],
      ["GitHub", LAB_REPO],
    ],
    social: [
      ["note", "https://note.com/shon9278"],
      ["X（開発者の記録）", "https://x.com/ShoN9278"],
      ["X（運用）", "https://x.com/hitoride_app"],
      ["Threads（運用）", "https://www.threads.com/@hitoride1030"],
      ["Bluesky（運用）", "https://bsky.app/profile/hitoride1030.bsky.social"],
    ],
    problem: [
      "AIにアイデア出しから公開、集客、続ける・撤退の判断まで任せたとき、どこまで動き、どこで人が必要になるのかを確かめる実験です。",
      "作ったものの数より、AIが勝手に進んでも壊れにくく、あとから何が起きたか確かめられる運用の設計を重視しています。",
    ],
    thinking: [
      "AIの費用が膨らまないように、実行前に費用を見積もり、月間予算を超える実行は始めません。緊急停止もできるようにしています。",
      "アイデアは作者を伏せて3社で採点し、自分の案をひいきしていないかも画面に出しています。",
      "「AIが作った」で終わらせないために、人が何を見つけ、何を決め、AIが何をしたかを分けて公開しています。",
    ],
    showFlow: true,
    decisions: [
      {
        title: "アイデア出しを3社の競争にした",
        rows: [
          ["問題", "設定した1社のAIだけがアイデアを出していて、会社どうしを比べられなかった。"],
          ["人", "設定した1社だけが考えているのかを問いかけ、選択肢を比べて3社方式に決めた。"],
          ["AI", "Claude Code が、Claude・GPT・Gemini が案を出し、作者を伏せて採点し合う形に変えた。"],
          ["結果", "本番で運用している。"],
        ],
        source: ["コミット 29973d3", `${LAB_REPO}/commit/29973d3`],
      },
      {
        title: "「保留」にできるのは人だけにした",
        rows: [
          ["問題", "季節もののように今は集客しても届かない案件も、撤退か継続かの判断に進んでしまう作りだった。"],
          ["人", "保留というステータスが必要かを問いかけ、提案された形で作ることを決めた。"],
          ["AI", "Claude Code が、公開と記録は続けて宣伝・判断・改善だけを止める形を提案して作った。"],
          ["結果", "本番に反映した。実際の案件で使った結果はまだない。"],
        ],
        source: ["コミット 58b8fd9", `${LAB_REPO}/commit/58b8fd9`],
      },
      {
        title: "字幕だけの動画より、本物の画面を見せる",
        rows: [
          ["問題", "AIが台本を書いた字幕だけの動画を作れるようにしたが、普通のテキスト動画に見えた。"],
          ["人", "見本を見て、ダッシュボードの動きを見せるほうが面白いと提案し、作ることを決めた。"],
          ["AI", "Claude Code が、ゲスト用の本物の画面を順に映す動画を作れるようにした。字幕の数字は記録から入れ、台本にAIは使わない。"],
          ["結果", "手元で動画を作って確認した。投稿したときの効果はまだ測っていない。"],
        ],
        source: ["コミット 3120b11", `${LAB_REPO}/commit/3120b11`],
      },
      {
        title: "レビューの指摘を受けて、外部フォントをやめた",
        rows: [
          ["問題", "ビルドの失敗を避けるためにGoogleフォントをブラウザから読む形にしたところ、閲覧者の情報がGoogleに送られるようになった。"],
          ["人", "GPTの指摘を読み、外部フォントの読み込みを外すと決めた。"],
          ["AI", "GPTがコードレビューで問題を指摘した。Claude Code が、端末やサーバーに入っているフォントを使う形に直した。"],
          ["結果", "ダッシュボードから外部のフォントを読まなくなった。"],
        ],
        source: ["コミット dfb2c61", `${LAB_REPO}/commit/dfb2c61`],
      },
    ],
    showStats: true,
    result: [
      "公開13件のうち、11件は登録・利用がまだ0件です。訪問も少なく、案件ごとの差は偶然の可能性が高い段階です。",
      "費用の無駄は減らせたものもあります。ツール改善の失敗では、AIに渡す内容を絞り、同じ処理の費用が約59円から約9円になりました。",
      "これまでに人が手を入れた回数は、AIの提案の承認・却下が9回、修正やデザインの指示が8回、公開を止めた回数は0回です。",
    ],
    next: [
      "いちばんのネックは「届かない」ことです。どの題材とSNSの組み合わせが効くのかは、まだ分かっていません。",
      "保留や別軸の提案など、本番での結果をまだ確かめていない仕組みがあります。",
    ],
  },
  {
    slug: "ai-job-dashboard",
    category: "personal",
    tone: "blue",
    image: {
      src: "/works/ai-job-dashboard.jpg",
      alt: "AI Job Dashboard の画面。総求人数、平均年収、新着求人件数の推移のグラフが並んでいる",
      domain: "ai-job-dashboard-plum.vercel.app",
    },
    title: "AI Job Dashboard",
    kicker: "求人データの分析ダッシュボード",
    lead: "求人データを毎日集めて、スキルの需要や求人数の推移と、自分のスキルとの差を見られるようにしたダッシュボードです。",
    summary: {
      problem: "エンジニアの市場で、何が求められているのかを知りたい。",
      decision: "市場全体だけでなく、自分のスキルとの差まで見えるようにする。",
      result: "収集から画面までつなげて公開しました。ただし今は収集が止まっていて、データは2026年9月3日までです。",
    },
    role: "個人開発",
    period: "2025年10月〜",
    stack: ["React", "NestJS", "Prisma", "Python", "PostgreSQL", "Cloud Run", "Azure OpenAI"],
    links: [
      ["公開サイト", "https://ai-job-dashboard-plum.vercel.app/"],
      ["GitHub", JOB_REPO],
    ],
    notice:
      "公開サイトのデータは2026年9月3日までです。2026年11月10日時点、外部APIのキーが無効になっていて、毎日の収集は止まっています。",
    problem: [
      "エンジニアの市場で何が求められているのかを知りたかったのが、作り始めたきっかけです。",
    ],
    thinking: [
      "市場全体の傾向に加えて、登録した自分のスキルとの一致率、足りないスキル、想定年収まで見られるようにしました。",
      "収集と分析は Python、API は NestJS、画面は React に分け、毎日の処理と画面を別々に動かせる形にしました。",
      "数字だけでは読み取りにくい変化は、AIのコメントで補っています。",
    ],
    decisions: [
      {
        title: "データが欠けた日も計算に含め、予測はマイナスにしない",
        rows: [
          ["状況", "収集データがない日があり、予測の値がマイナスになることもありえた。"],
          ["決めたこと", "データがない日も0件の日として計算に含め、予測値と上限・下限は0を下回らないようにした。"],
          ["結果", "集計から日付が抜けず、マイナスの求人数が出ない形になった。"],
        ],
        source: ["コミット decce23", `${JOB_REPO}/commit/decce23`],
      },
      {
        title: "AIコメントを、要約から提案に変えた",
        rows: [
          ["状況", "最初のプロンプトは、増加傾向か減少傾向かを要約するだけだった。"],
          ["決めたこと", "「トレンド分析」「市場の解釈」「提案」の3項目で出すようにプロンプトを変えた。"],
          ["結果", "傾向の説明だけでなく、企業やエンジニアへの行動提案まで出す形になった。"],
        ],
        source: ["コミット 678727b", `${JOB_REPO}/commit/678727b`],
      },
      {
        title: "無料枠の工夫から、Cloud Run へ移した",
        rows: [
          ["状況", "最初は Render の無料プランで、スリープからの復帰に時間がかかっていた。"],
          ["決めたこと", "まずキャッシュを24時間に延ばし、定期アクセスの間隔と時間帯を調整して対応した。2026年9月に、APIを Cloud Run、収集と分析を Cloud Run Jobs と Cloud Scheduler へ移した。"],
          ["結果", "定期実行の仕組みは移せた。ただし2026年11月10日時点では、ジョブは正常終了のまま0件しか取得できていない。"],
        ],
        source: ["コミット b1dd768", `${JOB_REPO}/commit/b1dd768`],
      },
    ],
    result: [
      "フロントは Vercel、API は Cloud Run、収集と分析は Cloud Run Jobs で動かしています。",
      "利用者数などの数字は、確かめられるものがないため載せていません。",
    ],
    next: [
      "無料プランのデータベースが一時停止していたことに気づかず、公開サイトにデータが出ない期間がありました。データベースに接続できないとAPI全体が起動しない作りです。",
      "外部APIのエラーを「結果なし」として扱っていて、0件でもジョブが正常終了するため、収集が止まっていることに気づけませんでした。",
      "リポジトリの README に、移行前の Render の記述が残っています。",
    ],
  },
  {
    slug: "techscope-ai",
    category: "personal",
    tone: "green",
    figure: "learning-loop",
    title: "TechScope AI",
    kicker: "AI学習支援アプリ",
    lead: "学習の記録から次に学ぶテーマと記事を提案し、日報の作成とスキルの更新までをつなげた学習支援アプリです。",
    summary: {
      problem: "市場で求められることが分かったうえで、勉強を効率化したい。",
      decision: "記録、提案、日報を別々にせず、ひと続きの流れにする。",
      result: "記録から提案、日報までつなげて公開しました。今はデータベースの停止でログインできません。",
    },
    role: "個人開発",
    period: "2025年10月〜",
    stack: ["Next.js", "NestJS", "Supabase", "Redis", "BullMQ", "OpenAI"],
    links: [
      ["公開サイト", "https://techscope-ai.vercel.app/"],
      ["GitHub", TECHSCOPE_REPO],
    ],
    notice:
      "2026年11月10日時点、データベースが一時停止していて、公開サイトにログインできません。",
    problem: [
      "AI Job Dashboard で市場を知ったうえで、勉強の効率化を図りたいと考えたのがきっかけです。",
    ],
    thinking: [
      "学ぶ、記録する、スキルを抽出する、次の記事を提案する、日報を作る、という流れをひと続きにしました。",
      "日報の内容からスキル名を抽出し、スキルのレベルも更新します。",
    ],
    decisions: [
      {
        title: "おすすめの生成を、非同期のジョブに分けた",
        rows: [
          ["状況", "おすすめの生成には、学習履歴の分析、OpenAI の呼び出し、記事の取得が含まれる。"],
          ["決めたこと", "Redis と BullMQ のジョブに分け、生成の状態を専用のテーブルで持つようにした。"],
          ["結果", "画面の表示と生成の処理を切り離し、生成の状態を確認できる形になった。"],
        ],
        source: ["GitHub", TECHSCOPE_REPO],
      },
      {
        title: "記事だけでなく、教材の種類と復習を増やした",
        rows: [
          ["状況", "最初は Qiita と Zenn の記事を中心に提案していた。"],
          ["決めたこと", "2026年9月に、書籍、講座、YouTube も集めるようにし、復習の周期を持たせた。"],
          ["結果", "教材の詳細ページと復習のページを追加した。"],
        ],
        source: ["コミット baf81f8", `${TECHSCOPE_REPO}/commit/baf81f8`],
      },
    ],
    result: [
      "学習の記録、AIのおすすめ、日報の連携まで作り、公開しました。",
      "勉強の効率がどれだけ上がったか、利用者が何人いるかは、確かめられる数字がないため載せていません。",
    ],
    next: [
      "スキルの変化を見せるダッシュボードと、学習タスクの自動生成は、まだ作っている途中か計画の段階です。",
      "効率化が目的なので、効果をどう測るかが次の課題です。",
      "データベースは無料プランで動かしていて、同時に動かせる数の上限により、今は再開できていません。",
    ],
  },
  {
    slug: "routine-automation",
    category: "work",
    tone: "sand",
    image: {
      src: "/works/routine-automation.jpg",
      alt: "公開用デモの案件ボード。依頼メールから納品までの案件カードが列ごとに並んでいる",
      domain: "event-operations-demo.vercel.app",
    },
    title: "添付PDFから定型バナーを自動生成",
    kicker: "定型バナー作成の自動化（公開用デモ）",
    lead: "依頼メールの添付PDFから日時や登壇者を読み取り、定型バナーと納品データまで作る流れのデモです。実務で作った2つのツールを組み合わせて、公開用に作りました。",
    summary: {
      problem: "依頼メールとPDFの内容を、定型バナーへ転記する繰り返しの作業を減らしたい。",
      decision: "全自動にせず、抽出した値を人が直してから納品する。",
      result: "起票から納品ZIPまでの流れを、公開デモで操作できます。",
    },
    role: "設計から実装まで",
    period: "2026年8月 公開",
    stack: ["React", "FastAPI", "SQLite", "PDF解析", "PNG出力"],
    links: [
      ["デモを開く", "https://event-operations-demo.vercel.app/"],
      ["GitHub", ROUTINE_REPO],
    ],
    problem: [
      "依頼メールを読み、添付PDFの日時、形式、講演タイトル、登壇者を、決まったバナーの枠へ転記する繰り返しの作業を減らすためのツールです。",
      "実務で作った案件管理のツールと、PDFを扱うツールを組み合わせ、会社の情報を含まない公開用のデモとして作りました。",
    ],
    thinking: [
      "メールの取り込み、案件の起票、PDFの解析、バナーの生成、納品データの作成を別々の作業にせず、1つの流れにしました。",
      "画面は React、保存と抽出の処理は FastAPI に分け、実務のツールに近い構成にしています。",
    ],
    decisions: [
      {
        title: "デザインを作り分けず、固定のフォーマットにした",
        rows: [
          ["状況", "案件ごとに変わるのは、日時や登壇者などの中身だった。"],
          ["決めたこと", "複数のデザインを作り分けず、固定のフォーマットに抽出した値を流し込み、変えられるのは配色だけにした。"],
          ["結果", "同じ流れで生成でき、確認するところも枠の中身に絞れる形になった。"],
        ],
        source: ["README", `${ROUTINE_REPO}#readme`],
      },
      {
        title: "抽出のあとに、人が直せる画面を置いた",
        rows: [
          ["状況", "PDFから抽出した内容を、納品前に調整したい場合がある。"],
          ["決めたこと", "抽出した内容を編集画面で調整してから、PNGと入稿データをZIPにまとめる流れにした。"],
          ["結果", "自動化の範囲と、人が確認する範囲を画面で分けられた。"],
        ],
        source: ["README", `${ROUTINE_REPO}#readme`],
      },
      {
        title: "公開しても問題ない形に作り替えた",
        rows: [
          ["状況", "もとは実務のツールなので、会社名や実データは公開できない。"],
          ["決めたこと", "サンプルPDFと匿名データだけを使い、文字を置き換える処理を入れ、起票データとアップロード先はGitの管理から外した。"],
          ["結果", "会社名、実メール、個人名を含めずに、流れだけを見せられるようになった。"],
        ],
        source: ["backend/main.py", `${ROUTINE_REPO}/blob/main/backend/main.py`],
      },
    ],
    showDemo: true,
    result: [
      "メール件名からの起票、PDFの差し替え、定型バナーの編集、納品の確認までを、公開デモで操作できます。",
      "実務での削減時間などの数字は載せていません。",
    ],
    next: [
      "デモのAPIは Render の無料プランで動いているため、スリープ中は最初の応答に40秒ほどかかることがあります。",
    ],
  },
];

export const featuredCase = cases[0];
export const personalCases = cases.filter(
  (item) => item.category === "personal" && item !== featuredCase,
);
export const workCases = cases.filter((item) => item.category === "work");
