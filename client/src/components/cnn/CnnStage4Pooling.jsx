import { useState, useEffect, useRef } from "react";
import { Shrink, ArrowRight, ShieldCheck, Zap, Play, Pause, Info, Eye } from "lucide-react";
import CnnStageShell from "./CnnStageShell";

const STAGE4_CODE_DATA = {
  concept: "Tầng MaxPooling2D trượt cửa sổ 2x2 trên Feature Map và chỉ giữ lại giá trị lớn nhất trong mỗi ô. Giúp giảm 75% số lượng phép tính và tăng tính bất biến vị trí (Translation Invariance).",
  frameworks: {
    numpy: {
      file: "model/cnn_from_scratch.py",
      code: `class MaxPool2D:
    def forward(self, x):
        self.x = x
        batch, channels, height, width = x.shape
        out = np.zeros((batch, channels, height // 2, width // 2), dtype=np.float32)
        self.argmax = np.zeros_like(out, dtype=np.int8)
        # Lấy giá trị lớn nhất trong mỗi ô 2x2
        for r in range(out.shape[2]):
            for c in range(out.shape[3]):
                patch = x[:, :, r*2:r*2+2, c*2:c*2+2].reshape(batch, channels, 4)
                self.argmax[:, :, r, c] = patch.argmax(axis=2)
                out[:, :, r, c] = patch.max(axis=2)
        return out`,
    },
    keras: {
      file: "model/train_keras.ipynb",
      code: `from tensorflow.keras import layers

# Giảm một nửa kích thước không gian (224x224 -> 112x112)
layers.MaxPooling2D(
    pool_size=(2, 2),
    strides=(2, 2),
    name="maxpool1"
)`,
    },
    pytorch: {
      file: "model/train_pytorch.ipynb",
      code: `import torch.nn as nn

# Tầng MaxPool kích thước kernel 2x2, bước trượt stride 2
self.pool = nn.MaxPool2d(kernel_size=2, stride=2)`,
    },
  },
};

const SAMPLE_POOL_MATRIX = [
  [{ val: 12, region: "tl" }, { val: 20, region: "tl", isMax: true }, { val: 8, region: "tr" }, { val: 15, region: "tr" }],
  [{ val: 8, region: "tl" }, { val: 14, region: "tl" }, { val: 32, region: "tr", isMax: true }, { val: 18, region: "tr" }],
  [{ val: 25, region: "bl" }, { val: 48, region: "bl", isMax: true }, { val: 9, region: "br" }, { val: 16, region: "br" }],
  [{ val: 30, region: "bl" }, { val: 12, region: "bl" }, { val: 72, region: "br", isMax: true }, { val: 40, region: "br" }],
];

const REGION_CONFIG = {
  tl: { name: "Góc Trên - Trái (Top-Left)", maxVal: 20, bgClass: "bg-emerald-500/25 border-emerald-400 text-emerald-300" },
  tr: { name: "Góc Trên - Phải (Top-Right)", maxVal: 32, bgClass: "bg-blue-500/25 border-blue-400 text-blue-300" },
  bl: { name: "Góc Dưới - Trái (Bottom-Left)", maxVal: 48, bgClass: "bg-amber-500/25 border-amber-400 text-amber-300" },
  br: { name: "Góc Dưới - Phải (Bottom-Right)", maxVal: 72, bgClass: "bg-purple-500/25 border-purple-400 text-purple-300" },
};

const REGIONS_ORDER = ["tl", "tr", "bl", "br"];

const CnnStage4Pooling = ({ previewUrl }) => {
  const [activeRegion, setActiveRegion] = useState("tl");
  const [isAutoLooping, setIsAutoLooping] = useState(true);
  const pooledCanvasRef = useRef(null);

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
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 112, 112);
    };
  }, [previewUrl]);

  const currentCfg = REGION_CONFIG[activeRegion];

  // Simulation View
  const simView = (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {REGIONS_ORDER.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => {
                setIsAutoLooping(false);
                setActiveRegion(reg);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeRegion === reg
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {reg === "tl" ? "Trên-Trái" : reg === "tr" ? "Trên-Phải" : reg === "bl" ? "Dưới-Trái" : "Dưới-Phải"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsAutoLooping(!isAutoLooping)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold transition-all ${
            isAutoLooping
              ? "bg-cyan-100 border-cyan-300 text-cyan-800"
              : "bg-gray-100 border-gray-200 text-gray-600"
          }`}
        >
          {isAutoLooping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-600" />}
          <span>{isAutoLooping ? "Tự động trượt vùng" : "Tạm dừng"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Input 4x4 matrix */}
        <div className="lg:col-span-7 bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-400">1. Ma trận 4×4 trước khi Max Pooling</span>
            <span className="text-[11px] text-slate-400 font-mono">Cửa sổ 2×2, Stride 2</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
            {SAMPLE_POOL_MATRIX.map((row, r) =>
              row.map((cell, c) => {
                const isActiveReg = cell.region === activeRegion;
                const isMax = cell.isMax;
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isActiveReg
                        ? isMax
                          ? "bg-cyan-400 text-slate-950 scale-105 shadow-md shadow-cyan-400/40 ring-2 ring-cyan-300"
                          : "bg-cyan-950/80 text-cyan-300 border border-cyan-700"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {cell.val}
                  </div>
                );
              })
            )}
          </div>

          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
            <span>Vùng chọn: <strong className="text-cyan-400">{currentCfg.name}</strong></span>
            <span className="text-emerald-400 font-bold">Max = {currentCfg.maxVal}</span>
          </div>
        </div>

        {/* Output 2x2 pooled matrix */}
        <div className="lg:col-span-5 bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3 text-center">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400">2. Ma trận 2×2 sau Pooling</span>
            <span className="text-[11px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Giảm 75%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 max-w-[180px] mx-auto">
            {REGIONS_ORDER.map((reg) => {
              const cfg = REGION_CONFIG[reg];
              const isSelected = reg === activeRegion;
              return (
                <div
                  key={reg}
                  className={`h-12 rounded-xl flex items-center justify-center font-mono text-base font-extrabold transition-all ${
                    isSelected
                      ? "bg-cyan-400 text-slate-950 scale-110 shadow-lg shadow-cyan-400/40 ring-2 ring-cyan-300"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {cfg.maxVal}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Theory View
  const theoryView = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 space-y-2">
        <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700">
          <Shrink className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-gray-900">Giảm 75% dung lượng tính toán</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Kích thước chiều cao và rộng giảm đi 50% (224 → 112 → 56), giúp các tầng sau tính toán cực nhanh.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-gray-900">Tính bất biến không gian</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Khi con vật dịch chuyển nhẹ hay đổi góc chụp, giá trị đặc trưng cực đại vẫn được bảo toàn trọn vẹn.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
          <Zap className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-gray-900">Mở rộng Receptive Field</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Cho phép các tầng nơ-ron phía sau nhìn được bối cảnh tổng thể (dáng thân, cấu trúc toàn thân).
        </p>
      </div>
    </div>
  );

  return (
    <CnnStageShell
      stageId={4}
      stageTitle="4. Giảm Chiều Không Gian (MaxPooling)"
      stageDesc="Cửa sổ 2×2 giữ lại giá trị cực đại, giảm 75% số phép tính và tăng tính bất biến"
      badgeTag="Giảm chiều 50%"
      icon={Shrink}
      simView={simView}
      theoryView={theoryView}
      codeData={STAGE4_CODE_DATA}
    />
  );
};

export default CnnStage4Pooling;
