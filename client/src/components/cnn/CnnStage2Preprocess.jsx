import { useState, useEffect } from "react";
import { SlidersHorizontal, ArrowRight, CheckCircle2, Zap, Scale, Sparkles, Play, Pause, RefreshCw, ShieldCheck } from "lucide-react";
import CnnStageShell from "./CnnStageShell";

const STAGE2_CODE_DATA = {
  concept: "Chuẩn hóa các giá trị pixel từ dải số nguyên [0, 255] sang dạng số thực float32 trong khoảng [0.0, 1.0] bằng phép chia 255.0 để giúp thuật toán Gradient Descent hội tụ ổn định, tránh bùng nổ gradient.",
  frameworks: {
    numpy: {
      file: "model/cnn_from_scratch.py",
      code: `# Chuẩn hóa ma trận điểm ảnh về dải [0.0, 1.0]
x_normalized = x_raw.astype(np.float32) / 255.0

print("Min pixel:", np.min(x_normalized)) # 0.0
print("Max pixel:", np.max(x_normalized)) # 1.0`,
    },
    keras: {
      file: "model/train_keras.ipynb",
      code: `from tensorflow.keras import layers, Sequential

# Tích hợp trực tiếp lớp Chuẩn hóa vào đầu mô hình CNN
model = Sequential([
    layers.Rescaling(1.0 / 255.0, input_shape=(224, 224, 3)),
    # Các tầng Conv tiếp theo nhận tensor giá trị float [0, 1]...
])`,
    },
    pytorch: {
      file: "model/train_pytorch.ipynb",
      code: `from torchvision import transforms

# transforms.ToTensor() tự động chia 255 và chuẩn hóa mean/std
transform_pipeline = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(), # Chuyển [0, 255] -> [0.0, 1.0]
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])`,
    },
  },
};

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

  useEffect(() => {
    if (!isAutoPulsing) return undefined;
    const interval = setInterval(() => {
      setPulseCount((prev) => (prev + 1) % 100);
    }, 1200);
    return () => clearInterval(interval);
  }, [isAutoPulsing]);

  // Simulation View
  const simView = (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsNormalized(!isNormalized)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all shadow-sm"
        >
          <Scale className="w-3.5 h-3.5 text-teal-600" />
          <span>Trạng thái: {isNormalized ? "Chuẩn hoá [0.0, 1.0] (Đang bật)" : "Dữ liệu thô [0, 255]"}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAutoPulsing(!isAutoPulsing)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            isAutoPulsing
              ? "bg-teal-100 border-teal-300 text-teal-800"
              : "bg-gray-100 border-gray-200 text-gray-600"
          }`}
        >
          {isAutoPulsing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-teal-600" />}
          <span>{isAutoPulsing ? "Dòng chảy số: Đang chạy" : "Tạm dừng"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Step 1: Resize 224x224 */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-teal-400">1. Quy chuẩn kích thước (Spatial Resizing)</span>
            <span className="text-[11px] font-mono text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
              {inputShapeText}
            </span>
          </div>

          <div className="flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-teal-500/50 bg-slate-900 shadow-inner flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Resized" className="w-full h-full object-cover" />
              ) : (
                <div className="text-[11px] text-slate-500 text-center p-2">Mẫu 224×224</div>
              )}
              <div className="absolute bottom-1 right-1 bg-black/70 text-[9px] font-mono px-1.5 py-0.5 rounded text-teal-300">
                224×224
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Division Matrix 255.0 */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400">2. Ma trận điểm ảnh sau phép chia 255.0</span>
            <span className="text-[11px] font-mono text-emerald-300">float32</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
            {SAMPLE_RAW_VALUES.map((row, r) =>
              row.map((val, c) => {
                const display = isNormalized ? (val / 255.0).toFixed(2) : val;
                const isHighlight = (r + c + pulseCount) % 4 === 0;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`h-9 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                      isHighlight
                        ? "bg-teal-500 text-slate-950 scale-105 shadow-md shadow-teal-500/30"
                        : isNormalized
                        ? "bg-teal-950/60 text-teal-300 border border-teal-800/40"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {display}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-yellow-300 font-bold">255 (uint8)</span>
            <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
            <span className="bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded border border-teal-700 font-bold">
              ÷ 255.0
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-green-400 font-bold">1.00 (float32)</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Theory View
  const theoryView = (
    <div className="space-y-3">
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-2">
        <p className="text-xs font-black text-teal-900 uppercase flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-teal-600" />
          Tại sao chuẩn hoá [0.0, 1.0] lại mang tính quyết định trong CNN?
        </p>
        <p className="text-xs text-teal-800 leading-relaxed">
          Nếu giữ nguyên dải số nguyên <code>[0, 255]</code>, các phép nhân ma trận liên tiếp qua hàng chục tầng nơ-ron sẽ làm giá trị kích hoạt tăng theo cấp số nhân, dẫn đến hiện tượng <strong>bùng nổ gradient (Exploding Gradients)</strong>. Chuẩn hóa về khoảng <code>[0.0, 1.0]</code> đảm bảo hàm mất mát có bề mặt lồi đều, giúp thuật toán tối ưu (Adam, SGD) hội tụ nhanh và ổn định.
        </p>
      </div>
    </div>
  );

  return (
    <CnnStageShell
      stageId={2}
      stageTitle="2. Tiền Xử Lý &amp; Chuẩn Hoá (Preprocessing &amp; Scaling)"
      stageDesc="Quy chuẩn kích thước 224×224 và chia 255.0 sang float32 [0.0, 1.0]"
      badgeTag="Chuẩn hoá float32"
      icon={SlidersHorizontal}
      simView={simView}
      theoryView={theoryView}
      codeData={STAGE2_CODE_DATA}
    />
  );
};

export default CnnStage2Preprocess;
