import { useState, useEffect, useRef } from "react";
import { ScanSearch, Sliders, Eye, Sparkles, Layers, Info, CheckCircle2, Flame, LoaderCircle, Play, Pause } from "lucide-react";

const CnnStage6Gradcam = ({
  result,
  previewUrl,
  selectedGradcamLayer,
  onGradcamLayerChange,
  loadingGradcam = false,
}) => {
  const [viewMode, setViewMode] = useState("slider"); // 'slider' | 'side_by_side' | 'overlay'
  const [splitPos, setSplitPos] = useState(50); // 0 to 100%
  const [heatmapAlpha, setHeatmapAlpha] = useState(55);
  const [isAutoSweeping, setIsAutoSweeping] = useState(false);
  const [sweepDirection, setSweepDirection] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const gradcam = result?.gradcam;
  const layers = [...(gradcam?.layers || [])].reverse();

  // Auto-sweep oscillating animation for split view (optional toggle)
  useEffect(() => {
    if (!isAutoSweeping || viewMode !== "slider") return undefined;

    const interval = setInterval(() => {
      setSplitPos((prev) => {
        let next = prev + sweepDirection * 1.5;
        if (next >= 90) {
          setSweepDirection(-1);
          next = 90;
        } else if (next <= 10) {
          setSweepDirection(1);
          next = 10;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isAutoSweeping, sweepDirection, viewMode]);

  const updateSplitPosFromEvent = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSplitPos(Math.max(0, Math.min(100, pos)));
  };

  const handlePointerDown = (e) => {
    setIsAutoSweeping(false);
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    updateSplitPosFromEvent(e);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      updateSplitPosFromEvent(e);
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-1.5">
            <ScanSearch className="w-3.5 h-3.5 text-amber-600" /> Giai đoạn 6: Giải Thích Quyết Định AI (Grad-CAM XAI)
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">
            Bản Đồ Nhiệt Kích Hoạt &amp; Thanh Quét Tương Tác
          </h3>
        </div>

        {/* View Mode & Sweep Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {viewMode === "slider" && (
            <button
              type="button"
              onClick={() => setIsAutoSweeping(!isAutoSweeping)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isAutoSweeping
                  ? "bg-amber-100 border-amber-300 text-amber-800 shadow-sm"
                  : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isAutoSweeping ? <Pause className="w-3.5 h-3.5 text-amber-700" /> : <Play className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isAutoSweeping ? "Tự động quét: Đang chạy" : "Bật tự động quét"}</span>
            </button>
          )}

          <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode("slider")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "slider" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-600"
              }`}
            >
              Thanh quét (Sweep)
            </button>
            <button
              onClick={() => setViewMode("side_by_side")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "side_by_side" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-600"
              }`}
            >
              Song song
            </button>
            <button
              onClick={() => setViewMode("overlay")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "overlay" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-600"
              }`}
            >
              Đè lớp
            </button>
          </div>
        </div>
      </div>

      {/* Layer selector bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-gray-700">Tầng trích xuất Grad-CAM:</span>
          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
            {selectedGradcamLayer || gradcam?.layer || "Tầng tích chập cuối"}
          </span>
        </div>

        {layers.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="gradcam-layer-select" className="text-xs text-gray-500 font-medium">
              Đổi layer:
            </label>
            <select
              id="gradcam-layer-select"
              value={selectedGradcamLayer || gradcam?.layer || ""}
              onChange={onGradcamLayerChange}
              disabled={loadingGradcam}
              className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-sm"
            >
              {layers.map((layer) => (
                <option key={layer.name} value={layer.name}>
                  {layer.name} ({layer.shape})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grad-CAM Dynamic Visualizer Canvas */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl shadow-lg space-y-4">
        {loadingGradcam ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
            <LoaderCircle className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs font-bold">Đang tính toán đạo hàm ngược và tạo bản đồ nhiệt Grad-CAM...</p>
          </div>
        ) : gradcam?.image ? (
          <>
            {viewMode === "slider" ? (
              /* Interactive Split Sweep View */
              <div className="flex flex-col items-center space-y-4">
                <div
                  ref={containerRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl select-none group cursor-ew-resize touch-none"
                >
                  {/* Base: Grad-CAM heatmap */}
                  <img
                    src={gradcam.image}
                    alt="Grad-CAM Heatmap"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />

                  {/* Top clipped: Original Image */}
                  <img
                    src={previewUrl}
                    alt="Ảnh gốc"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                      clipPath: `inset(0 ${100 - splitPos}% 0 0)`,
                    }}
                  />

                  {/* Split Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,1)] z-20 pointer-events-none flex items-center justify-center"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-mono text-xs font-black shadow-lg ring-2 ring-amber-300">
                      ↔
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-30 pointer-events-none">
                    Ảnh gốc
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-30 flex items-center gap-1 pointer-events-none">
                    <Flame className="w-3 h-3 text-red-300 animate-pulse" /> Grad-CAM
                  </div>
                </div>

                {/* Slider bar control */}
                <div className="w-full max-w-md bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" /> Kéo thanh quét vị trí (hoặc kéo trực tiếp trên ảnh):
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(splitPos)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={splitPos}
                    onChange={(e) => {
                      setIsAutoSweeping(false);
                      setSplitPos(Number(e.target.value));
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            ) : viewMode === "side_by_side" ? (
              /* Side-by-side mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>1. Ảnh gốc đầu vào</span>
                    <span className="text-slate-500">224 × 224</span>
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <img src={previewUrl} alt="Ảnh gốc" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      2. Bản đồ Grad-CAM
                    </span>
                    <span className="text-slate-400 font-mono">Heatmap</span>
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <img src={gradcam.image} alt="Grad-CAM Heatmap" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ) : (
              /* Overlay blend mode */
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl">
                  <img src={previewUrl} alt="Ảnh gốc" className="absolute inset-0 w-full h-full object-cover" />
                  <img
                    src={gradcam.image}
                    alt="Grad-CAM Heatmap Overlay"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150"
                    style={{ opacity: heatmapAlpha / 100 }}
                  />
                </div>

                <div className="w-full max-w-sm bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" /> Độ mờ lớp nhiệt (Opacity):
                    </span>
                    <span className="font-mono text-amber-300 font-bold">{heatmapAlpha}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={heatmapAlpha}
                    onChange={(e) => setHeatmapAlpha(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Heatmap Color Scale / Legend */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Thang đo mức độ kích hoạt (Activation Intensity Scale):</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 via-emerald-500 via-yellow-400 to-red-600 shadow-inner" />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span className="text-blue-400">Không ảnh hưởng (Nền/Cây cối)</span>
                <span className="text-yellow-400">Ảnh hưởng trung bình</span>
                <span className="text-red-400 font-bold">VÙNG QUYẾT ĐỊNH (Mắt, mũi, hoa văn...)</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center text-slate-400 space-y-2">
            <ScanSearch className="w-8 h-8 opacity-40" />
            <p className="text-xs font-medium">
              Chưa có bản đồ Grad-CAM. Hãy tải ảnh lên và chạy nhận diện để quan sát vùng chú ý của AI.
            </p>
          </div>
        )}
      </div>

      {/* Pedagogical Key Insight */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm text-amber-950 space-y-1">
          <p className="font-bold text-amber-900">
            Grad-CAM là gì và tại sao lại quan trọng trong AI giải thích (XAI)?
          </p>
          <p className="text-amber-800/90 leading-relaxed text-xs">
            <strong>Grad-CAM</strong> (Gradient-weighted Class Activation Mapping) sử dụng đạo hàm ngược từ lớp dự đoán về lớp Conv2D cuối cùng để làm nổi bật các vùng có trọng số quyết định cao nhất. Bạn có thể kéo thanh quét qua lại để đối chiếu chính xác các đặc trưng sinh học mà AI đã &quot;nhìn&quot; thấy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CnnStage6Gradcam;
