"use client";

import { useState, useEffect, use, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import { getChallengeById, getRecordsByChallengeId } from "@/lib/storage";
import { Challenge, AnxietyRecord } from "@/lib/types";

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
        full: `${year}/${parts[1]}/${parts[2]}`,
      };
    }
    const d = new Date(dateStr);
    return {
      monthDay: `${d.getMonth() + 1}月${d.getDate()}日`,
      year: `${d.getFullYear()}`,
      full: d.toLocaleDateString("ja-JP"),
    };
  } catch {
    return { monthDay: dateStr, year: "", full: dateStr };
  }
}

function ChallengeDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const challengeId = resolvedParams.id;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [records, setRecords] = useState<AnxietyRecord[]>([]);

  // クライアント側で最新データを取得
  useEffect(() => {
    const ch = getChallengeById(challengeId);
    if (ch) {
      setChallenge(ch);
    } else {
      // フォールバック
      setChallenge({
        id: challengeId,
        orderNumber: "01",
        title: "人前で話す",
        status: "in_progress",
        createdAt: "",
        updatedAt: "",
      });
    }

    const recs = getRecordsByChallengeId(challengeId);
    setRecords(recs);
  }, [challengeId]);

  // 最終実施日
  const latestDateFormatted =
    records.length > 0 ? formatDate(records[0].date).full : "未実施";

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
          {/* 取り組み一覧に戻るリンク */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#718096] hover:text-[#2D5A43] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>取り組み一覧に戻る</span>
            </Link>
          </div>

          {/* タイトル & 状態バッジ & 編集ボタン */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-[#1A202C] tracking-tight">
                  {challenge?.title || "人前で話す"}
                </h1>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF2ED] text-[#2D5A43]">
                  {challenge?.status === "completed" ? "完了" : "取り組み中"}
                </span>
              </div>
              <p className="text-sm text-[#718096]">
                挑戦の積み重ねを、振り返りましょう。
              </p>
            </div>

            {/* 編集するボタン */}
            <Link
              href={`/challenges/${challengeId}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-[#2D3748] shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-[#718096]" />
              <span>編集する</span>
            </Link>
          </div>

          {/* 概要カード（実施回数・最終実施日・+記録を追加ボタン） */}
          <section className="bg-[#EDF3EE] rounded-2xl p-6 border border-[#DFE9E1] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-10">
              {/* これまでの実施回数 */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-[#718096]">
                  これまでの実施回数
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#1A202C] leading-none">
                    {records.length}
                  </span>
                  <span className="text-xs font-medium text-[#718096] border border-[#CBD7CE] px-1 py-0.5 rounded leading-none">
                    回
                  </span>
                </div>
              </div>

              {/* 最終実施日 */}
              <div className="space-y-1 pl-6 border-l border-slate-200">
                <span className="text-xs font-medium text-[#718096]">
                  最終実施日
                </span>
                <p className="text-xl font-bold text-[#1A202C] leading-none pt-1">
                  {latestDateFormatted}
                </p>
              </div>
            </div>

            {/* +記録を追加ボタン */}
            <Link
              href={`/challenges/${challengeId}/new-record`}
              className="py-3 px-6 bg-[#2D5A43] hover:bg-[#234E38] text-white font-bold rounded-xl shadow-sm text-sm transition-all text-center"
            >
              +記録を追加
            </Link>
          </section>

          {/* これまでの記録セクション */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-[#1A202C]">
                これまでの記録
              </h2>
              <span className="text-xs text-[#A0AEC0]">
                新しい記録から表示
              </span>
            </div>

            {records.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-[#718096]">
                まだ記録がありません。「+記録を追加」から今日の挑戦を記録してみましょう。
              </div>
            ) : (
              /* タイムライン */
              <div className="relative pl-6 sm:pl-8 space-y-4">
                {/* タイムラインの縦線 */}
                <div className="absolute left-[9px] top-3 bottom-3 w-[2px] bg-[#E2DACB]" />

                {records.map((rec) => {
                  const dateInfo = formatDate(rec.date);
                  return (
                    <div key={rec.id} className="relative">
                      {/* タイムラインドット */}
                      <span className="absolute -left-[20px] sm:-left-[28px] top-7 w-2.5 h-2.5 rounded-full bg-[#C8B89E] border-2 border-[#FAF8F5]" />

                      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* 左カラム：日付 & 不安度ゲージ */}
                        <div className="md:col-span-5 space-y-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
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

                          {/* 実行前不安度 */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs text-[#718096]">
                              <span>
                                実行前の不安度 : {rec.preAnxiety} / 10
                              </span>
                            </div>
                            <div className="w-full bg-[#ECEBE7] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#94A3B8] h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${(rec.preAnxiety / 10) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* 実行後不安度 */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-semibold text-[#2D5A43]">
                              <span>
                                実行後の不安度 : {rec.postAnxiety} / 10
                              </span>
                            </div>
                            <div className="w-full bg-[#ECEBE7] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#2D5A43] h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${(rec.postAnxiety / 10) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 右カラム：気づき・感想 */}
                        <div className="md:col-span-7 flex flex-col justify-start">
                          <div className="mb-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FAF4E6] text-[#8C6D23]">
                              気づき・感想
                            </span>
                          </div>
                          <p className="text-sm text-[#2D3748] leading-relaxed whitespace-pre-wrap">
                            {rec.reflection || "（感想の記録なし）"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 励ましメッセージカード */}
          <section className="bg-[#F7F3E9] rounded-2xl p-6 border border-[#ECE5D4] flex items-center justify-between gap-4 mt-8">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1A202C]">
                変化の大きさより、踏み出した一歩を。
              </h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                感じたことを、そのまま残していきましょう。
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

export default function ChallengeDetailPage(props: {
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
      <ChallengeDetailContent {...props} />
    </Suspense>
  );
}
