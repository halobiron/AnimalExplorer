import { useState, useEffect, useRef } from "react";
import { Shrink, ArrowRight, ShieldCheck, Zap, Play, Pause, Info, Eye } from "lucide-react";

const SAMPLE_POOL_MATRIX = [
  // Top-left (Emerald region) & Top-right (Blue region)
  [{ val: 12, region: "tl" }, { val: 20, region: "tl", isMax: true }, { val: 8, region: "tr" }, { val: 15, region: "tr" }],
  [{ val: 8, region: "tl" }, { val: 14, region: "tl" }, { val: 32, region: "tr", isMax: true }, { val: 18, region: "tr" }],
  // Bottom-left (Amber region) & Bottom-right (Purple region)
  [{ val: 25, region: "bl" }, { val: 48, region: "bl", isMax: true }, { val: 9, region: "br" }, { val: 16, region: "br" }],
  [{ val: 30, region: "bl" }, { val: 12, region: "bl" }, { val: 72, region: "br", isMax: true }, { val: 40, region: "br" }],
];

const REGION_CONFIG = {
  tl: { name: "Góc Trên - Trái (Top-Left)", maxVal: 20, bgClass: "bg-emerald-500/25 border-emerald-400 text-emerald-300", glow: "shadow-[0_0_15px_rgba(52,211,153,0.5)]" },
  tr: { name: "Góc Trên - Phải (Top-Right)", maxVal: 32, bgClass: "bg-blue-500/25 border-blue-400 text-blue-300", glow: "shadow-[0_0_15px_rgba(96,165,250,0.5)]" },
  bl: { name: "Góc Dưới - Trái (Bottom-Left)", maxVal: 48, bgClass: "bg-amber-500/25 border-amber-400 text-amber-300", glow: "shadow-[0_0_15px_rgba(251,191,36,0.5)]" },
  br: { name: "Góc Dưới - Phải (Bottom-Right)", maxVal: 72, bgClass: "bg-purple-500/25 border-purple-400 text-purple-300", glow: "shadow-[0_0_15px_rgba(192,132,252,0.5)]" },
};

const REGIONS_ORDER = ["tl", "tr", "bl", "br"];

const CnnStage4Pooling = ({ previewUrl }) => {
  const [activeRegion, setActiveRegion] = useState("tl");
  const [isAutoLooping, setIsAutoLooping] = useState(true);

  const pooledCanvasRef = useRef(null);

  // Auto-looping through the 4 quadrants
  useEffect(() => {
    if (!isAutoLooping) return undefined;

    const interval = setInterval(() => {
      setActiveRegion((prev) => {
        const nextIdx = (REGIONS_ORDER.indexOf(prev) + 1) % REGIONS_ORDER.length;
        return REGIONS_ORDER[nextIdx];
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [isAutoLooping]);

  // Downsample image on canvas to visually show 50% pooling
  useEffect(() => {
    if (!previewUrl || !pooledCanvasRef.current) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = previewUrl;
    img.onload = () => {
      const canvas = pooledCanvasRef.current;
      if (!canvas) return;
      canvas.width = 112;
      canvas.height = 112;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false; // pixelated pooling effect
      ctx.drawImage(img, 0, 0, 112, 112);
    };
  }, [previewUrl]);

  const currentCfg = REGION_CONFIG[activeRegion];

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 mb-1.5">
            <Shrink className="w-3.5 h-3.5" /> Giai đoạn 4: Giảm Chiều Không Gian (Max Pooling 2×2)
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">
            Trích Xuất Giá Trị Lớn Nhất &amp; Nén 75% Kích Thước
          </h3>
        </div>

        {/* Play / Pause toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAutoLooping(!isAutoLooping)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isAutoLooping
                ? "bg-cyan-100 border-cyan-300 text-cyan-800 shadow-sm"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            {isAutoLooping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-600" />}
            <span>{isAutoLooping ? "Tự động quét góc: Đang chạy" : "Tạm dừng"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Pooling Sandbox */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl shadow-lg space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
              Mô phỏng phép trích xuất cực đại (Max Pooling Window: 2×2, Stride: 2)
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Đang quét: <strong className="text-cyan-300">{currentCfg.name}</strong>
          </span>
        </div>

        {/* Side-by-side matrices */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Input 4x4 */}
          <div className="md:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono font-bold">
              <span>Feature Map gốc (4×4)</span>
              <span className="text-cyan-400">16 Điểm ảnh</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800">
              {SAMPLE_POOL_MATRIX.map((row, r) =>
                row.map((cell, c) => {
                  const isHoveredRegion = activeRegion === cell.region;
                  const cfg = REGION_CONFIG[cell.region];

                  return (
                    <button
                      key={`pool-in-${r}-${c}`}
                      type="button"
                      onClick={() => {
                        setIsAutoLooping(false);
                        setActiveRegion(cell.region);
                      }}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                        isHoveredRegion
                          ? `${cfg.bgClass} border-2 ${cfg.glow} scale-105 z-10`
                          : "bg-slate-800/80 text-slate-400 border border-slate-700/60 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <span>{cell.val}</span>
                      {cell.isMax && isHoveredRegion && (
                        <span className="text-[9px] bg-white text-slate-950 px-1 rounded font-extrabold shadow mt-0.5 animate-pulse">
                          MAX
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center font-mono">
              Vùng quét: <strong className="text-white">{currentCfg.name}</strong>
            </p>
          </div>

          {/* Animated Center arrow */}
          <div className="md:col-span-1 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 flex items-center justify-center shadow-lg animate-pulse">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Output 2x2 Pooled Matrix */}
          <div className="md:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono font-bold">
              <span>Pooled Map sau giảm chiều (2×2)</span>
              <span className="text-emerald-400">Nén 75% dữ liệu</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              {Object.entries(REGION_CONFIG).map(([key, cfg]) => {
                const isSelected = activeRegion === key;
                return (
                  <button
                    key={`pool-out-${key}`}
                    type="button"
                    onClick={() => {
                      setIsAutoLooping(false);
                      setActiveRegion(key);
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center font-mono font-extrabold text-base transition-all duration-300 ${
                      isSelected
                        ? `${cfg.bgClass} border-2 ring-2 ring-cyan-400 scale-105 ${cfg.glow} z-10`
                        : "bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <span>{cfg.maxVal}</span>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold mt-0.5">
                      {key}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-cyan-300 text-center font-mono">
              Lấy max: <code>max({activeRegion}) = {currentCfg.maxVal}</code>
            </p>
          </div>
        </div>

        {/* Live Visual Spatial Downsampling on User's Image */}
        {previewUrl && (
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Trực quan hóa giảm độ phân giải không gian trên ảnh của bạn:
                </h5>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">
                224×224 → 112×112
              </span>
            </div>

            <div className="flex items-center justify-center gap-6 p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold mb-1">Đầu vào (224×224)</p>
                <img
                  src={previewUrl}
                  alt="Ảnh gốc"
                  className="w-24 h-24 object-cover rounded-xl border border-slate-700 shadow"
                />
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center animate-pulse">
                  <Shrink className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono text-cyan-400 mt-1 font-bold">MaxPooling</span>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-cyan-400 font-bold mb-1">Sau Pooling (112×112)</p>
                <canvas
                  ref={pooledCanvasRef}
                  className="w-24 h-24 object-cover rounded-xl border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3 Core Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700">
            <Shrink className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-gray-900">Giảm 75% dung lượng tính toán</h4>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Mỗi tầng pooling giảm một nửa chiều rộng và chiều cao (224 → 112 → 56 → ...), giảm mạnh số phép tính cho các tầng tiếp theo.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-gray-900">Tính bất biến không gian (Spatial Invariance)</h4>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Dù con vật hơi dịch chuyển sang trái, phải hoặc đổi góc nghiêng nhẹ, giá trị đặc trưng cực đại vẫn được bảo toàn.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-gray-900">Mở rộng tầm nhìn (Receptive Field)</h4>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Giúp các tầng nơ-ron phía sau quan sát được góc nhìn bao quát hơn (toàn bộ đầu, dáng thân thay vì chỉ từng điểm ảnh viền).
          </p>
        </div>
      </div>
    </div>
  );
};

export default CnnStage4Pooling;
