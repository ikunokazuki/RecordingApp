"use client";

import { useState, useRef, useEffect, use, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ArrowLeft } from "lucide-react";
import {
  getChallengeById,
  getRecordsByChallengeId,
  updateChallenge,
  updateRecord,
  deleteRecord,
  deleteChallenge,
} from "@/lib/storage";
import { Challenge, AnxietyRecord } from "@/lib/types";

// 不安度選択ポップオーバーコンポーネント
interface AnxietyPopoverProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

function AnxietyPopover({ label, value, onChange }: AnxietyPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 外側をクリックした時にメニューを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="relative" ref={containerRef}>
      {/* 通常時表示ボックス */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-[#2D3748] flex items-center justify-between hover:border-[#2D5A43] transition-all cursor-pointer shadow-sm text-left"
      >
        <span>
          {label} : {value} / 10
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#718096] transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ポップオーバーメニュー（5列×2行） */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg w-60">
          <div className="grid grid-cols-5 gap-1.5">
            {numbers.map((num) => {
              const isSelected = num === value;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    onChange(num);
                    setIsOpen(false);
                  }}
                  className={`h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[#2D5A43] text-white shadow-sm scale-105"
                      : "bg-[#FBFCF9] border border-[#C5D2C5] text-[#2D3748] hover:bg-[#EEF3ED] hover:border-[#AEC0AE]"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 日付フォーマット関数（"2026-10-28" → { monthDay: "10月28日", year: "2026" }）
function formatDate(dateStr: string) {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      return {
        monthDay: `${month}月${day}日`,
        year: year,
      };
    }
    const d = new Date(dateStr);
    return {
      monthDay: `${d.getMonth() + 1}月${d.getDate()}日`,
      year: `${d.getFullYear()}`,
    };
  } catch {
    return { monthDay: dateStr, year: "" };
  }
}

function EditChallengeContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const challengeId = resolvedParams.id;

  const [title, setTitle] = useState("");
  const [records, setRecords] = useState<AnxietyRecord[]>([]);
  const [savingRecordId, setSavingRecordId] = useState<string | null>(null);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  // 初回ロード用ref
  const isLoadedRef = useRef(false);

  // 最新データをロード
  useEffect(() => {
    const ch = getChallengeById(challengeId);
    if (ch) {
      setTitle(ch.title);
    } else {
      setTitle("人前で話す");
    }

    const recs = getRecordsByChallengeId(challengeId);
    setRecords(recs);

    // ロード完了をマーク
    setTimeout(() => {
      isLoadedRef.current = true;
    }, 100);
  }, [challengeId]);

  // 取り組み名の自動保存（タイピング停止後500msで保存）
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (!title.trim()) return;

    setIsSavingTitle(true);
    const timer = setTimeout(() => {
      updateChallenge(challengeId, { title: title.trim() });
      setIsSavingTitle(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [title, challengeId]);

  // 不安度の即時自動保存
  const handleAnxietyChange = (
    id: string,
    field: "preAnxiety" | "postAnxiety",
    value: number
  ) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, [field]: value } : rec))
    );
    setSavingRecordId(id);
    updateRecord(id, { [field]: value });
    setTimeout(() => {
      setSavingRecordId((curr) => (curr === id ? null : curr));
    }, 500);
  };

  // 感想テキストの変更ハンドラー
  const handleReflectionChange = (id: string, value: string) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, reflection: value } : rec))
    );
    setSavingRecordId(id);
  };

  // 感想のデバウンス保存（タイピングが止まったら自動保存）
  const reflectionTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const triggerDebouncedReflectionSave = (id: string, value: string) => {
    if (reflectionTimersRef.current[id]) {
      clearTimeout(reflectionTimersRef.current[id]);
    }
    reflectionTimersRef.current[id] = setTimeout(() => {
      updateRecord(id, { reflection: value });
      setSavingRecordId((curr) => (curr === id ? null : curr));
    }, 600);
  };

  // フォーカスが外れた時にも確実に保存
  const handleReflectionBlur = (id: string, value: string) => {
    setSavingRecordId(id);
    updateRecord(id, { reflection: value });
    setTimeout(() => {
      setSavingRecordId((curr) => (curr === id ? null : curr));
    }, 400);
  };

  // 個別記録の削除
  const handleDeleteRecord = (recordId: string) => {
    const confirmDelete = window.confirm(
      "この記録を削除してもよろしいですか？\n（削除後は元に戻せません）"
    );
    if (!confirmDelete) return;

    deleteRecord(recordId);
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  // 取り組み自体の削除
  const handleDeleteChallenge = () => {
    const confirmDelete = window.confirm(
      `「${title}」と、これまでのすべての記録を削除してもよろしいですか？\n\n※この操作は取り消せません。`
    );
    if (!confirmDelete) return;

    deleteChallenge(challengeId);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D3748] flex flex-col justify-between selection:bg-[#2D5A43]/20">
      {/* 画面上部〜メインコンテンツ */}
      <div>
        {/* ヘッダー */}
        <header className="w-full max-w-4xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className="text-xl font-bold tracking-tight text-[#2D3748]">
                こつこつ
              </span>
              <Image
                src="/images/sprout-icon.png"
                alt="こつこつ 若葉ロゴ"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </Link>
            <span className="text-xs text-[#8C98A4] tracking-wide pl-2 border-l border-slate-200">
              小さな一歩を、あなたのペースで。
            </span>
          </div>
        </header>

        {/* メインエリア */}
        <main className="w-full max-w-4xl mx-auto px-6 py-4 space-y-6">
          {/* 上部ナビゲーション: 戻るリンク */}
          <div>
            <Link
              href={`/challenges/${challengeId}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#718096] hover:text-[#2D5A43] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>取り組み詳細に戻る</span>
            </Link>
          </div>

          {/* タイトル & 状態バッジ */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-[#1A202C] tracking-tight">
                {title || "取り組み名"}
              </h1>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF2ED] text-[#2D5A43]">
                編集中
              </span>
            </div>
            <p className="text-sm text-[#718096]">
              変更内容はリアルタイムで自動保存されます。
            </p>
          </div>

          {/* 取り組み名編集カード */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-semibold text-[#718096]">
                  取り組み名
                </label>
                {isSavingTitle && (
                  <span className="text-[11px] text-[#8C6D23] flex items-center gap-1 animate-fadeIn">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    保存中...
                  </span>
                )}
              </div>
              <Image
                src="/images/sprout-illustration.png"
                alt="若葉アイコン"
                width={20}
                height={20}
                className="w-4 h-4 object-contain opacity-70"
              />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="取り組み名を入力"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#1A202C] focus:outline-none focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] transition-all"
            />
          </section>

          {/* これまでの記録編集セクション */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-[#1A202C]">
                これまでの記録
              </h2>
              <span className="text-xs text-[#A0AEC0]">
                日付ごとに内容を編集（自動保存）
              </span>
            </div>

            {records.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-[#718096]">
                現在、記録はありません。
              </div>
            ) : (
              /* タイムライン */
              <div className="relative pl-6 sm:pl-8 space-y-4">
                {/* タイムライン縦線 */}
                <div className="absolute left-[9px] top-3 bottom-3 w-[2px] bg-[#E2DACB]" />

                {records.map((rec) => {
                  const dateInfo = formatDate(rec.date);
                  return (
                    <div key={rec.id} className="relative">
                      {/* タイムラインドット */}
                      <span className="absolute -left-[20px] sm:-left-[28px] top-7 w-2.5 h-2.5 rounded-full bg-[#C8B89E] border-2 border-[#FAF8F5]" />

                      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                        {/* ヘッダー: 日付と削除ボタン */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-[#1A202C]">
                              {dateInfo.monthDay}
                            </span>
                            {dateInfo.year && (
                              <span className="text-xs text-[#A0AEC0] ml-2 font-medium">
                                {dateInfo.year}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="px-3 py-1 bg-[#FDF2F2] border border-[#FBD5D5] text-[#E05252] text-xs font-medium rounded-lg hover:bg-[#FCE8E8] transition-colors cursor-pointer"
                          >
                            この記録を削除
                          </button>
                        </div>

                        {/* 不安度ポップオーバー入力 & 感想入力 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
                          {/* 不安度セレクター（2連） */}
                          <div className="md:col-span-4 space-y-2.5">
                            <AnxietyPopover
                              label="実行前の不安度"
                              value={rec.preAnxiety}
                              onChange={(val) =>
                                handleAnxietyChange(rec.id, "preAnxiety", val)
                              }
                            />
                            <AnxietyPopover
                              label="実行後の不安度"
                              value={rec.postAnxiety}
                              onChange={(val) =>
                                handleAnxietyChange(rec.id, "postAnxiety", val)
                              }
                            />
                          </div>

                          {/* 気づき・感想テキストエリア */}
                          <div className="md:col-span-8 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-[#FAF4E6] text-[#8C6D23]">
                                  気づき・感想
                                </span>
                              </div>

                              {/* 保存中インジケーター（保存中のみ小さく控えめに表示） */}
                              {savingRecordId === rec.id && (
                                <span className="text-[11px] text-[#8C6D23] flex items-center gap-1 animate-fadeIn">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  保存中...
                                </span>
                              )}
                            </div>
                            <textarea
                              rows={3}
                              value={rec.reflection || ""}
                              onChange={(e) => {
                                handleReflectionChange(rec.id, e.target.value);
                                triggerDebouncedReflectionSave(
                                  rec.id,
                                  e.target.value
                                );
                              }}
                              onBlur={(e) =>
                                handleReflectionBlur(rec.id, e.target.value)
                              }
                              placeholder="やってみて感じたことや、気づいたことを自由に書いてみましょう。"
                              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-[#2D3748] focus:outline-none focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] transition-all resize-none leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 下部のアクションエリア（戻るボタン） */}
          <div className="flex items-center justify-end pt-2">
            <Link
              href={`/challenges/${challengeId}`}
              className="px-6 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-[#4A5568] hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-[#718096]" />
              <span>詳細画面に戻る</span>
            </Link>
          </div>

          {/* 取り組み自体の削除カード（危険領域） */}
          <section
            onClick={handleDeleteChallenge}
            className="bg-[#FEF2F2] hover:bg-[#FDE8E8] rounded-2xl border border-[#FDE8E8] p-5 flex items-center justify-between gap-4 mt-8 cursor-pointer transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/trash-icon.png"
                alt="ゴミ箱アイコン"
                width={22}
                height={22}
                className="w-5 h-5 object-contain"
              />
              <span className="text-sm font-bold text-[#DC2626]">
                この取り組みを削除する
              </span>
            </div>
            <span className="text-xs text-[#DC2626]/70">
              削除は取り消せません
            </span>
          </section>
        </main>
      </div>

      {/* フッター */}
      <footer className="w-full border-t border-slate-200/70 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-xs text-[#8C98A4]">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#718096]">こつこつ</span>
            <Image
              src="/images/sprout-icon.png"
              alt="こつこつロゴ"
              width={16}
              height={16}
              className="w-4 h-4 object-contain"
            />
          </div>
          <span className="tracking-wide">あなたのペースを、大切に。</span>
        </div>
      </footer>
    </div>
  );
}

export default function EditChallengePage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-sm text-[#718096]">
          読み込み中...
        </div>
      }
    >
      <EditChallengeContent {...props} />
    </Suspense>
  );
}
