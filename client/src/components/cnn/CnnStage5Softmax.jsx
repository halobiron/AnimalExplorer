import { useState, useEffect } from "react";
import { Waypoints, Trophy, BarChart3, ArrowRight, Sparkles, Info, Activity, Zap } from "lucide-react";

const CnnStage5Softmax = ({ result, cnnDemo }) => {
  const top5 = result?.top5 || [];
  const classCount = cnnDemo?.classCount || 47;
  const [pulseIndex, setPulseIndex] = useState(0);

  // Animated synaptic pulse timer
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 6);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const RANK_BADGES = [
    { rank: 1, label: "Hạng 1 (Top 1)", icon: "🥇" },
    { rank: 2, label: "Hạng 2 (Top 2)", icon: "🥈" },
    { rank: 3, label: "Hạng 3 (Top 3)", icon: "🥉" },
    { rank: 4, label: "Hạng 4", icon: "4" },
    { rank: 5, label: "Hạng 5", icon: "5" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-1.5">
            <Waypoints className="w-3.5 h-3.5" /> Giai đoạn 5: Tầng Kết Nối Đầy Đủ (Dense) &amp; Hàm Softmax
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">
            Xung Thần Kinh Dense Layer &amp; Phân Phối Xác Suất Softmax
          </h3>
        </div>

        <span className="self-start sm:self-auto text-xs font-bold text-blue-800 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 animate-pulse text-blue-600" />
          Phân loại trên {classCount} loài động vật
        </span>
      </div>

      {/* Animated Synaptic Neural Flow Diagram */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
            Mạng nơ-ron truyền tín hiệu (Neural Synapses Firing)
          </p>
          <span className="text-[11px] text-slate-400 font-mono font-bold">
            Logits (z) → Softmax σ(z)
          </span>
        </div>

        {/* Dynamic Synaptic Network Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1: Flatten */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-center relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-cyan-400">1. Flatten (Vector 1D)</span>
            <div className="flex justify-center gap-1 py-1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3.5 h-7 rounded-md font-mono text-[9px] flex items-center justify-center font-bold transition-all duration-300 ${
                    pulseIndex === i
                      ? "bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-110"
                      : "bg-slate-800 text-cyan-300"
                  }`}
                >
                  f{i}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">Trải phẳng các ma trận đặc trưng</p>
          </div>

          {/* Step 2: Dense Layer */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-center relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-yellow-400">2. Dense (Logits z)</span>
            <div className="flex justify-center gap-1.5 py-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-7 rounded-full font-mono text-[9px] flex items-center justify-center font-bold transition-all duration-300 ${
                    pulseIndex === i || pulseIndex === (i + 1) % 6
                      ? "bg-yellow-400 text-slate-950 shadow-[0_0_10px_rgba(250,204,21,0.8)] scale-110"
                      : "bg-slate-800 text-yellow-300"
                  }`}
                >
                  z{i + 1}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">Nơ-ron kết nối toàn bộ tính điểm thô</p>
          </div>

          {/* Step 3: Softmax */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-center relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-green-400">3. Softmax (Xác suất)</span>
            <div className="h-7 flex items-center justify-center bg-slate-900 rounded-xl px-2">
              <span className="text-xs font-mono text-green-300 font-bold animate-pulse">
                ∑ P(loài) = 100%
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Chuẩn hoá điểm về tổng xác suất 1.0</p>
          </div>
        </div>

        {/* Softmax Formula Banner */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center font-mono text-xs text-slate-300">
          <span>Công thức Softmax: </span>
          <code className="bg-slate-900 text-cyan-300 px-2.5 py-0.5 rounded mx-1 font-bold shadow-inner">
            P(Lớp i) = e^(z_i) / ∑ [e^(z_j)]
          </code>
        </div>
      </div>

      {/* Top 5 Animated Probability Chart */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
            <h4 className="text-sm font-extrabold text-gray-900">
              Bảng xếp hạng Top 5 loài có xác suất cao nhất từ mô hình
            </h4>
          </div>
          <span className="text-xs text-gray-500 font-medium">Kết quả thực tế</span>
        </div>

        {top5.length > 0 ? (
          <div className="space-y-3">
            {top5.map((item, idx) => {
              const rankInfo = RANK_BADGES[idx] || { rank: idx + 1, label: `Hạng ${idx + 1}`, icon: `${idx + 1}` };
              const isFirst = idx === 0;

              return (
                <div
                  key={item.label}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                    isFirst
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300 shadow-md shadow-emerald-500/10 scale-[1.01]"
                      : "bg-gray-50/70 border-gray-200/70 hover:bg-gray-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0 text-base">{rankInfo.icon}</span>
                      <span className="font-extrabold text-xs sm:text-sm text-gray-900 truncate">
                        {item.label}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        isFirst
                          ? "bg-green-600 text-white border-green-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200"
                      }`}
                    >
                      {item.confidence}%
                    </span>
                  </div>

                  {/* Animated probability bar */}
                  <div className="w-full bg-gray-200/70 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isFirst
                          ? "bg-gradient-to-r from-emerald-400 to-green-600 shadow-sm"
                          : "bg-gradient-to-r from-slate-400 to-slate-500"
                      }`}
                      style={{ width: `${Math.max(item.confidence, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl text-center text-gray-400 space-y-2">
            <BarChart3 className="w-8 h-8 opacity-40" />
            <p className="text-xs font-medium">Chưa có kết quả dự đoán. Hãy tải ảnh lên và bấm &quot;Nhận diện ngay&quot;.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CnnStage5Softmax;
