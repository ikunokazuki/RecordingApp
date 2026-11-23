"use client";

import { useState, use, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getChallengeById, addRecord } from "@/lib/storage";

function NewRecordContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const challengeId = resolvedParams.id;

  // 今日の日付を初期値に (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  const challenge = getChallengeById(challengeId);
  const challengeTitle = challenge ? challenge.title : "人前で話す";

  // フォームの状態
  const [date, setDate] = useState(today);
  const [preAnxiety, setPreAnxiety] = useState<number | null>(null);
  const [postAnxiety, setPostAnxiety] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 記録を保存する処理
  const handleSave = () => {
    if (preAnxiety === null || postAnxiety === null) {
      setErrorMessage("実行前と実行後の不安度を選択してください。");
      return;
    }

    setErrorMessage("");

    // storageに新しい記録を追加
    addRecord({
      challengeId,
      date,
      preAnxiety,
      postAnxiety,
      reflection: reflection.trim() || undefined,
    });

    // 詳細画面に戻る
    router.push(`/challenges/${challengeId}`);
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
        <main className="w-full max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* タイトル & 状態バッジ */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-[#1A202C] tracking-tight">
                {challengeTitle}
              </h1>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF2ED] text-[#2D5A43]">
                新しい記録
              </span>
            </div>
            <p className="text-sm text-[#718096]">
              今日の挑戦を、ありのままに。
            </p>
          </div>

          {/* 記録入力カード */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-7">
            <h2 className="text-base font-bold text-[#1A202C]">
              記録を入力
            </h2>

            {/* エラーメッセージ表示 */}
            {errorMessage && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FDE8E8] text-[#DC2626] text-xs font-semibold rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* 実施日 */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#718096]">
                実施日
              </label>
              <div className="relative w-full sm:w-72">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FBFCF9] border border-[#C5D2C5] rounded-xl text-sm font-semibold text-[#2D3748] focus:outline-none focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] transition-all cursor-pointer shadow-sm"
                />
              </div>
            </div>

            {/* 実行前の不安度 */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-[#718096]">
                実行前の不安度
              </label>
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                {numbers.map((num) => {
                  const isSelected = preAnxiety === num;
                  return (
                    <button
                      key={`pre-${num}`}
                      type="button"
                      onClick={() => setPreAnxiety(num)}
                      className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm ${
                        isSelected
                          ? "bg-[#2D5A43] border border-[#2D5A43] text-white scale-105 shadow-md"
                          : "bg-[#FBFCF9] border border-[#C5D2C5] text-[#2D3748] hover:bg-[#EEF3ED] hover:border-[#AEC0AE] hover:text-[#1A202C]"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#A0AEC0] px-0.5">
                <span>1 : ほとんどない</span>
                <span>10 : とても強い</span>
              </div>
            </div>

            {/* 実行後の不安度 */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-[#718096]">
                実行後の不安度
              </label>
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                {numbers.map((num) => {
                  const isSelected = postAnxiety === num;
                  return (
                    <button
                      key={`post-${num}`}
                      type="button"
                      onClick={() => setPostAnxiety(num)}
                      className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm ${
                        isSelected
                          ? "bg-[#2D5A43] border border-[#2D5A43] text-white scale-105 shadow-md"
                          : "bg-[#FBFCF9] border border-[#C5D2C5] text-[#2D3748] hover:bg-[#EEF3ED] hover:border-[#AEC0AE] hover:text-[#1A202C]"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#A0AEC0] px-0.5">
                <span>1 : ほとんどない</span>
                <span>10 : とても強い</span>
              </div>
            </div>

            {/* 気づき・感想 */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-[#FAF4E6] text-[#8C6D23]">
                  気づき・感想
                </span>
                <span className="text-[11px] text-[#A0AEC0]">
                  任意
                </span>
              </div>
              <textarea
                rows={4}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="やってみて感じたことや、気づいたことを自由に書いてみましょう。"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* 下部のアクションエリア */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <p className="text-xs text-[#8C98A4]">
              うまく書こうとしなくても、大丈夫です。
            </p>
            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/challenges/${challengeId}`}
                className="px-6 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-[#4A5568] hover:bg-slate-50 transition-colors shadow-sm text-center"
              >
                キャンセル
              </Link>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#2D5A43] hover:bg-[#234E38] text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
              >
                記録を保存
              </button>
            </div>
          </div>

          {/* 励ましメッセージカード */}
          <section className="bg-[#F7F3E9] rounded-2xl p-6 border border-[#ECE5D4] flex items-center justify-between gap-4 mt-8">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1A202C]">
                記録することも、大切な一歩。
              </h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                結果だけでなく、挑戦した自分にも目を向けてみましょう。
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                src="/images/stepping-stones.png"
                alt="一歩イラスト"
                width={80}
                height={35}
                className="w-20 object-contain opacity-85"
              />
            </div>
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

export default function NewRecordPage(props: {
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
      <NewRecordContent {...props} />
    </Suspense>
  );
}
