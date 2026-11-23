import { Challenge, AnxietyRecord } from "./types";

const CHALLENGES_KEY = "kotsukotsu_challenges";
const RECORDS_KEY = "kotsukotsu_records";

// 初期サンプルデータ（デザイン案に基づくデータ）
const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "1",
    orderNumber: "01",
    title: "人前で話す",
    status: "in_progress",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-28T00:00:00.000Z",
  },
  {
    id: "2",
    orderNumber: "02",
    title: "お店で質問する",
    status: "completed",
    createdAt: "2026-10-05T00:00:00.000Z",
    updatedAt: "2026-10-20T00:00:00.000Z",
  },
  {
    id: "3",
    orderNumber: "03",
    title: "店員さんに相談する",
    status: "in_progress",
    createdAt: "2026-10-10T00:00:00.000Z",
    updatedAt: "2026-10-16T00:00:00.000Z",
  },
];

const INITIAL_RECORDS: AnxietyRecord[] = [
  {
    id: "rec-1",
    challengeId: "1",
    date: "2026-10-28",
    preAnxiety: 8,
    postAnxiety: 5,
    reflection:
      "話し始めてから、少し経ったら落ち着いてきた。ずっと緊張が続くわけではないことが分かった。",
    createdAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "rec-2",
    challengeId: "1",
    date: "2026-10-25",
    preAnxiety: 7,
    postAnxiety: 7,
    reflection:
      "うまく話せなかった。練習をもっとしておくことが必要だと思った。",
    createdAt: "2026-10-25T14:30:00.000Z",
  },
];

// 取り組み一覧を取得
export function getChallenges(): Challenge[] {
  if (typeof window === "undefined") return INITIAL_CHALLENGES;
  const data = localStorage.getItem(CHALLENGES_KEY);
  if (!data) {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(INITIAL_CHALLENGES));
    return INITIAL_CHALLENGES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CHALLENGES;
  }
}

// 特定の取り組みを取得
export function getChallengeById(id: string): Challenge | undefined {
  const challenges = getChallenges();
  return challenges.find((c) => c.id === id);
}

// すべての記録を取得
export function getAllRecords(): AnxietyRecord[] {
  if (typeof window === "undefined") return INITIAL_RECORDS;
  const data = localStorage.getItem(RECORDS_KEY);
  if (!data) {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
    return INITIAL_RECORDS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_RECORDS;
  }
}

// 特定の取り組みに紐づく記録を取得（新しい日付順）
export function getRecordsByChallengeId(challengeId: string): AnxietyRecord[] {
  const records = getAllRecords();
  return records
    .filter((r) => r.challengeId === challengeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 新しい記録を追加・保存
export function addRecord(newRecordData: {
  challengeId: string;
  date: string;
  preAnxiety: number;
  postAnxiety: number;
  reflection?: string;
}): AnxietyRecord {
  const records = getAllRecords();
  const record: AnxietyRecord = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`,
    challengeId: newRecordData.challengeId,
    date: newRecordData.date,
    preAnxiety: newRecordData.preAnxiety,
    postAnxiety: newRecordData.postAnxiety,
    reflection: newRecordData.reflection,
    createdAt: new Date().toISOString(),
  };

  const updatedRecords = [record, ...records];
  if (typeof window !== "undefined") {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
  }
  return record;
}

// 取り組みを更新
export function updateChallenge(
  id: string,
  updates: Partial<Pick<Challenge, "title" | "status">>
): Challenge | undefined {
  const challenges = getChallenges();
  const index = challenges.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const updated: Challenge = {
    ...challenges[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  challenges[index] = updated;
  if (typeof window !== "undefined") {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  }
  return updated;
}

// 取り組みを削除（紐づく記録もまとめて削除）
export function deleteChallenge(id: string): void {
  const challenges = getChallenges();
  const updatedChallenges = challenges.filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(updatedChallenges));
  }

  // 紐づく記録も削除
  const records = getAllRecords();
  const updatedRecords = records.filter((r) => r.challengeId !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
  }
}

// 記録を更新
export function updateRecord(
  id: string,
  updates: Partial<Pick<AnxietyRecord, "preAnxiety" | "postAnxiety" | "reflection" | "date">>
): AnxietyRecord | undefined {
  const records = getAllRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  const updated: AnxietyRecord = {
    ...records[index],
    ...updates,
  };

  records[index] = updated;
  if (typeof window !== "undefined") {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }
  return updated;
}

// 記録を削除
export function deleteRecord(id: string): void {
  const records = getAllRecords();
  const updatedRecords = records.filter((r) => r.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
  }
}
