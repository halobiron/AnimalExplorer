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

  // Theory View: Deep, structured, and mathematical explanation of Preprocessing
  const theoryView = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Min-Max Normalization (0 - 1) */}
        <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-600 text-white shadow-sm">
              <Scale className="w-4 h-4" />
            </span>
            <p className="text-xs font-black text-teal-950 uppercase">
              1. Phép Chia Tỉ Lệ Min-Max (x / 255.0)
            </p>
          </div>
          <p className="text-xs text-teal-900 leading-relaxed">
            Chuyển đổi dải giá trị số nguyên <code>uint8 [0, 255]</code> về dải số thực liên tục <code>float32 [0.0, 1.0]</code>:
          </p>
          <div className="bg-white/90 border border-teal-300/80 rounded-xl p-2.5 text-center font-mono text-xs font-bold text-teal-950 shadow-sm">
            x<sub>norm</sub> = x<sub>raw</sub> / 255.0 &isin; [0.0, 1.0]
          </div>
          <ul className="space-y-1 text-[11px] text-teal-800 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>Cân bằng hàm mất mát:</strong> Giúp mặt cong của hàm Loss (Loss Landscape) trở nên đối xứng tròn đều, triệt tiêu dao động zic-zac (Zig-zagging) khi cập nhật Gradient.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>Tăng tốc hội tụ:</strong> Cho phép sử dụng Learning Rate lớn hơn và ổn định hơn với các bộ tối ưu như Adam hay SGD.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Z-Score Standardization (ImageNet Mean/Std) */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <p className="text-xs font-black text-emerald-950 uppercase">
              2. Chuẩn Hoá Phân Phối Chuẩn (Z-Score)
            </p>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Trong các mô hình thị giác hiện đại (PyTorch / Torchvision), dữ liệu tiếp tục được trừ giá trị trung bình (μ) và chia cho độ lệch chuẩn (σ):
          </p>
          <div className="bg-white/90 border border-emerald-300/80 rounded-xl p-2.5 text-center font-mono text-xs font-bold text-emerald-950 shadow-sm">
            z = (x - μ) / σ &nbsp;(với μ ≈ 0.45, σ ≈ 0.22)
          </div>
          <ul className="space-y-1 text-[11px] text-emerald-800 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Tâm điểm không (Zero-centered):</strong> Đưa phân phối điểm ảnh về trung bình bằng 0, giúp đạo hàm lan truyền ngược không bị lệch hẳn về một dấu.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Đồng bộ độ tương phản:</strong> Khử sự chênh lệch ánh sáng giữa ảnh chụp ngoài trời nắng gắt và trong bóng râm.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Exploding Gradient Prevention Card */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Hậu Quả Nếu Không Tiền Xử Lý Chuẩn Hoá?
          </p>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            Exploding Gradients Risk
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-rose-400 block">❌ Nếu giữ nguyên [0, 255]:</strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Các phép nhân ma trận trọng số liên tiếp làm giá trị kích hoạt tăng vọt lên hàng triệu. Đạo hàm bị tràn số sinh ra lỗi <code>NaN (Not a Number)</code> và mô hình mất khả năng học.
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">✅ Khi chuẩn hoá về [0.0, 1.0]:</strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Các tầng nơ-ron nhận đầu vào có biên độ đồng đều, hàm mất mát giảm đều đặn sau từng epoch và mô hình nhanh chóng đạt độ chính xác tối ưu.
            </p>
          </div>
        </div>
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
