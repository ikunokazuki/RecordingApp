import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// サンプルデータ型定義
interface ChallengeItem {
  id: string;
  orderNumber: string;
  title: string;
  count: number;
  lastDate: string;
  status: "in_progress" | "completed";
}

const sampleChallenges: ChallengeItem[] = [
  {
    id: "1",
    orderNumber: "01",
    title: "人前で話す",
    count: 5,
    lastDate: "2026/10/28",
    status: "in_progress",
  },
  {
    id: "2",
    orderNumber: "02",
    title: "お店で質問する",
    count: 3,
    lastDate: "2026/10/20",
    status: "completed",
  },
  {
    id: "3",
    orderNumber: "03",
    title: "店員さんに相談する",
    count: 1,
    lastDate: "2026/10/16",
    status: "in_progress",
  },
];

export default function Home() {
  const totalCount = sampleChallenges.length;
  const inProgressCount = sampleChallenges.filter(
    (c) => c.status === "in_progress"
  ).length;
  const completedCount = sampleChallenges.filter(
    (c) => c.status === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D3748] flex flex-col justify-between selection:bg-[#2D5A43]/20">
      {/* 画面上部〜メインコンテンツ */}
      <div>
        {/* ヘッダー */}
        <header className="w-full max-w-4xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
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
            </div>
            <span className="text-xs text-[#8C98A4] tracking-wide pl-2 border-l border-slate-200">
              小さな一歩を、あなたのペースで。
            </span>
          </div>
        </header>

        {/* メインエリア */}
        <main className="w-full max-w-4xl mx-auto px-6 py-6 space-y-8">
          {/* タイトル & イラスト */}
          <div className="flex items-end justify-between pt-2">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-wider text-[#2D5A43] uppercase">
                MY JOURNEY
              </span>
              <h1 className="text-3xl font-extrabold text-[#1A202C] tracking-tight">
                取り組み一覧
              </h1>
              <p className="text-sm text-[#718096] pt-1">
                今日の一歩が、明日の自信につながる。
              </p>
            </div>
            <div className="pb-1 hidden sm:block">
              <Image
                src="/images/stepping-stones.png"
                alt="今日の一歩イラスト"
                width={140}
                height={60}
                className="w-32 md:w-36 object-contain"
                priority
              />
            </div>
          </div>

          {/* サマリーカード（3連） */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 取り組み合計 */}
            <div className="bg-[#2D5A43] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[108px] transition-transform hover:-translate-y-0.5 duration-200">
              <span className="text-xs font-medium text-white/80">取り組み</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-bold tracking-tight leading-none">
                  {totalCount}
                </span>
                <span className="text-xs font-normal text-white/80">件</span>
              </div>
            </div>

            {/* 取り組み中 */}
            <div className="bg-white text-[#2D3748] rounded-2xl p-5 border border-slate-200/70 shadow-sm flex flex-col justify-between min-h-[108px] transition-transform hover:-translate-y-0.5 duration-200">
              <span className="text-xs font-medium text-[#718096]">
                取り組み中
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-bold tracking-tight text-[#1A202C] leading-none">
                  {inProgressCount}
                </span>
                <span className="text-xs font-normal text-[#718096]">件</span>
              </div>
            </div>

            {/* 完了 */}
            <div className="bg-[#FAF4E6] text-[#2D3748] rounded-2xl p-5 border border-[#EFE7D2] shadow-sm flex flex-col justify-between min-h-[108px] transition-transform hover:-translate-y-0.5 duration-200">
              <span className="text-xs font-medium text-[#718096]">完了</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-bold tracking-tight text-[#1A202C] leading-none">
                  {completedCount}
                </span>
                <span className="text-xs font-normal text-[#718096]">件</span>
              </div>
            </div>
          </section>

          {/* あなたの取り組み一覧セクション */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-[#1A202C]">
                あなたの取り組み
              </h2>
              <span className="text-xs text-[#A0AEC0] font-medium">
                {sampleChallenges.length}件
              </span>
            </div>

            {/* 一覧テーブル・カード */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* テーブルヘッダー */}
              <div className="bg-[#F6F3ED] px-6 py-3.5 border-b border-slate-200/60 grid grid-cols-12 text-xs font-medium text-[#718096]">
                <div className="col-span-5 sm:col-span-6">取り組み</div>
                <div className="col-span-3 sm:col-span-2 text-left">回数</div>
                <div className="col-span-2 text-left hidden sm:block">最終実施日</div>
                <div className="col-span-4 sm:col-span-2 text-right sm:text-center pr-2">状態</div>
              </div>

              {/* 取り組みリスト行 */}
              <div className="divide-y divide-slate-100">
                {sampleChallenges.map((item) => {
                  const isClickable = item.id === "1";
                  const Content = (
                    <div
                      className={`px-6 py-4 grid grid-cols-12 items-center transition-colors group ${
                        isClickable
                          ? "hover:bg-[#FAF8F5]/80 cursor-pointer"
                          : "cursor-default opacity-85"
                      }`}
                    >
                      {/* 取り組み名 + 番号 */}
                      <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                        <span className="text-[11px] font-mono text-[#718096] bg-[#F4EFE6] px-2 py-0.5 rounded-md font-semibold">
                          {item.orderNumber}
                        </span>
                        <span
                          className={`text-sm font-bold text-[#1A202C] ${
                            isClickable ? "group-hover:text-[#2D5A43]" : ""
                          } transition-colors`}
                        >
                          {item.title}
                        </span>
                      </div>

                      {/* 回数 + ドット */}
                      <div className="col-span-3 sm:col-span-2 flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2D3748]">
                          {item.count}回
                        </span>
                        {/* ドットの可視化 */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: item.count }).map((_, i) => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-[#8EAA97]"
                            />
                          ))}
                        </div>
                      </div>

                      {/* 最終実施日 */}
                      <div className="col-span-2 text-xs text-[#718096] hidden sm:block">
                        {item.lastDate}
                      </div>

                      {/* 状態バッジ + 矢印 */}
                      <div className="col-span-4 sm:col-span-2 flex items-center justify-end sm:justify-between gap-1 pl-2">
                        {item.status === "in_progress" ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF2ED] text-[#2D5A43]">
                            取り組み中
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#F7F0DF] text-[#8C6D23]">
                            完了
                          </span>
                        )}
                        <ChevronRight
                          className={`w-4 h-4 text-slate-300 ${
                            isClickable
                              ? "group-hover:text-slate-500 group-hover:translate-x-0.5"
                              : "opacity-40"
                          } transition-all`}
                        />
                      </div>
                    </div>
                  );

                  return isClickable ? (
                    <Link key={item.id} href="/challenges/1" className="block">
                      {Content}
                    </Link>
                  ) : (
                    <div key={item.id}>{Content}</div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* +取り組みを追加ボタン */}
          <div>
            <button
              type="button"
              className="w-full py-3.5 bg-[#2D5A43] hover:bg-[#234E38] text-white font-bold rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-1 text-sm active:scale-[0.99]"
            >
              +取り組みを追加
            </button>
          </div>

          {/* 励ましメッセージカード */}
          <section className="bg-[#F7F3E9] rounded-2xl p-6 border border-[#ECE5D4] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1A202C]">
                一歩ずつで、大丈夫。
              </h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                できたことも、難しかったことも。記録を重ねて、自分のペースを見つけましょう。
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                src="/images/sprout-illustration.png"
                alt="若葉イラスト"
                width={48}
                height={48}
                className="w-11 h-11 object-contain"
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
