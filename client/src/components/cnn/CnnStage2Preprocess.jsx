import { useState, useEffect } from "react";
import { SlidersHorizontal, ArrowRight, CheckCircle2, Zap, Scale, Sparkles, Play, Pause, RefreshCw } from "lucide-react";

const SAMPLE_RAW_VALUES = [
  [255, 128, 64, 0],
  [180, 90, 45, 12],
  [210, 160, 80, 240],
  [50, 100, 150, 200],
];

const CnnStage2Preprocess = ({ previewUrl, cnnDemo }) => {
  const [isNormalized, setIsNormalized] = useState(true);
  const [isAutoPulsing, setIsAutoPulsing] = useState(true);
  const [pulseCount, setPulseCount] = useState(0);

  const inputShapeText = cnnDemo?.inputShape ? cnnDemo.inputShape.join(" × ") : "224 × 224 × 3";

  // Dynamic particle number stream pulse
  useEffect(() => {
    if (!isAutoPulsing) return undefined;
    const interval = setInterval(() => {
      setPulseCount((prev) => (prev + 1) % 100);
    }, 1200);
    return () => clearInterval(interval);
  }, [isAutoPulsing]);

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 mb-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Giai đoạn 2: Tiền Xử Lý &amp; Chuẩn Hoá Dữ Liệu
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">
            Dòng Chảy Tensor: Chuẩn Hoá Số Học [0, 255] &rarr; [0.0, 1.0] (chia 255.0)
          </h3>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAutoPulsing(!isAutoPulsing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isAutoPulsing
                ? "bg-teal-100 border-teal-300 text-teal-800 shadow-sm"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            {isAutoPulsing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-teal-600" />}
            <span>{isAutoPulsing ? "Dòng chảy số: Đang chạy" : "Tạm dừng"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNormalized(!isNormalized)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all shadow-sm"
          >
            <Scale className="w-3.5 h-3.5 text-teal-600" />
            <span>Chế độ: {isNormalized ? "Sau chuẩn hoá (0.00 - 1.00)" : "Trước chuẩn hoá (0 - 255)"}</span>
          </button>
        </div>
      </div>

      {/* 2 Main Visual Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Step 2.1: Spatial Resizing Animation */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-800 text-xs font-bold">
                1
              </span>
              <h4 className="text-sm font-extrabold text-gray-900">
                Đồng bộ kích thước ảnh (Spatial Resizing)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-bold">
              Bilinear Interpolation
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Mọi bức ảnh có kích thước tùy ý sẽ được nội suy để co/giãn về đúng chuẩn <strong>224 × 224 pixels</strong> trước khi cấp cho mạng CNN.
          </p>

          {/* Animated Resizing Sandbox */}
          <div className="relative p-6 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center gap-4 overflow-hidden min-h-48">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            {/* Left: Original aspect box */}
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="relative w-20 h-24 rounded-xl border-2 border-dashed border-slate-500 bg-slate-900 flex items-center justify-center overflow-hidden shadow">
                {previewUrl ? (
                  <img src={previewUrl} alt="Ảnh gốc" className="w-full h-full object-cover opacity-75" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">Ảnh gốc</span>
                )}
                <div className="absolute inset-0 border border-slate-400/30 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1.5">Tùy biến (W × H)</span>
            </div>

            {/* Animated Flow Arrow */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400 text-teal-300 flex items-center justify-center animate-pulse">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono text-teal-400 mt-1 font-bold">Resize</span>
            </div>

            {/* Right: Target 224x224 Box */}
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-2xl border-2 border-teal-400 bg-teal-950/60 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                {previewUrl ? (
                  <img src={previewUrl} alt="Ảnh chuẩn hóa" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-teal-300">224 × 224</span>
                )}
                {/* Scanning frame corner marks */}
                <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-teal-400" />
                <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-teal-400" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-teal-400" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-teal-400" />
              </div>
              <span className="text-[10px] font-bold text-teal-300 font-mono mt-1.5">
                {inputShapeText}
              </span>
            </div>
          </div>
        </div>

        {/* Step 2.2: Dynamic Number Stream Normalization */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-800 text-xs font-bold">
                2
              </span>
              <h4 className="text-sm font-extrabold text-gray-900">
                Dòng Chảy Số Học (Rescaling float32)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-bold">
              x / 255.0
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Các điểm ảnh nguyên <code>[0, 255]</code> chuyển động qua cổng chuẩn hoá và biến thành các số thực <code>[0.00, 1.00]</code>.
          </p>

          {/* Dynamic Number Flow Stream Sandbox */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-inner space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Ma trận giá trị nơ-ron:</span>
              <span className="text-teal-400 font-mono font-bold">
                {isNormalized ? "float32 [0.00, 1.00]" : "uint8 [0, 255]"}
              </span>
            </div>

            {/* Matrix with animated shimmer cells */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {SAMPLE_RAW_VALUES.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  const display = isNormalized ? (val / 255).toFixed(2) : val;
                  const isHighlighted = (rIdx + cIdx + pulseCount) % 4 === 0;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`text-center py-1.5 rounded-lg text-xs font-mono font-extrabold border transition-all duration-300 ${
                        isHighlighted
                          ? "bg-teal-500 text-slate-950 border-teal-300 shadow-md shadow-teal-500/50 scale-105"
                          : "bg-slate-800/90 text-teal-300 border-slate-700"
                      }`}
                    >
                      {display}
                    </div>
                  );
                })
              )}
            </div>

            {/* Dynamic Division Flow Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-yellow-300 font-bold">255 (uint8)</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded border border-teal-700 font-bold">
                ÷ 255.0
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="text-green-400 font-bold">1.00 (float32)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pedagogical Insight */}
      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700 mt-0.5">
          <Zap className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm text-teal-950 space-y-1">
          <p className="font-bold text-teal-900">
            Tại sao chuẩn hoá [0, 1] lại mang tính quyết định trong Deep Learning?
          </p>
          <p className="text-teal-800/90 leading-relaxed text-xs">
            Nếu giữ nguyên dải số [0, 255], các phép nhân ma trận liên tiếp qua hàng chục tầng CNN sẽ làm các giá trị bùng nổ (Exploding Gradients). Chuẩn hóa về [0.0, 1.0] đảm bảo các trọng số học tập mượt mà và ổn định.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CnnStage2Preprocess;
