// 取り組みのステータス
export type ChallengeStatus = "in_progress" | "completed"; // 取り組み中 | 完了

// 取り組み（課題）データ型
export interface Challenge {
  id: string;
  orderNumber: string; // 表示番号（例: "01", "02"）
  title: string;       // 取り組み名（例: "人前で話す"）
  status: ChallengeStatus;
  createdAt: string;
  updatedAt: string;
  userId?: string;     // 将来のログイン機能・DB移行用
}

// 不安度の記録データ型
export interface AnxietyRecord {
  id: string;
  challengeId: string; // どの取り組みに紐づくか
  date: string;        // 実施日（例: "2026-10-28"）
  preAnxiety: number;  // 実行前の不安度 (1〜10)
  postAnxiety: number; // 実行後の不安度 (1〜10)
  reflection?: string; // 気づき・感想（任意）
  createdAt: string;   // 作成日時
  userId?: string;     // 将来のログイン機能・DB移行用
}
