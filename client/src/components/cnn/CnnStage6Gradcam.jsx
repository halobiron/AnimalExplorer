import { useState, useEffect, useRef } from "react";
import { ScanSearch, Sliders, Eye, Sparkles, Layers, Info, CheckCircle2, Flame, LoaderCircle, Play, Pause, ShieldCheck, CheckSquare } from "lucide-react";
import CnnStageShell from "./CnnStageShell";

const STAGE6_CODE_DATA = {
  concept: "Grad-CAM tính gradient của điểm số lớp dự đoán y^c theo Feature Map tầng Conv2D cuối cùng A^k. Trọng số đóng góp alpha_k được dùng để tạo bản đồ nhiệt trực quan hóa vùng ảnh hưởng nhất đến quyết định.",
  frameworks: {
    keras: {
      file: "model/main.py (FastAPI Backend)",
      code: `import tensorflow as tf
import numpy as np

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index):
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        class_channel = preds[:, pred_index]
        
    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    
    heatmap = last_conv_layer_output[0] @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()`,
    },
    numpy: {
      file: "Lý thuyết XAI",
      code: `# 1. Trọng số tầm quan trọng của feature map k:
# alpha_k^c = (1 / Z) * sum_i sum_j ( d(y^c) / d(A_ij^k) )

# 2. Bản đồ nhiệt Grad-CAM:
# L_Grad-CAM^c = ReLU( sum_k (alpha_k^c * A^k) )

# ReLU đảm bảo chỉ giữ lại các đặc trưng làm tăng xác suất nhận diện loài c`,
    },
    pytorch: {
      file: "model/train_pytorch.ipynb",
      code: `gradients = []
activations = []

def backward_hook(module, grad_input, grad_output):
    gradients.append(grad_output[0])

def forward_hook(module, input, output):
    activations.append(output)

model.features[-1].register_forward_hook(forward_hook)
model.features[-1].register_backward_hook(backward_hook)`,
    },
  },
};

const CnnStage6Gradcam = ({
  result,
  previewUrl,
  selectedGradcamLayer,
  onGradcamLayerChange,
  loadingGradcam = false,
}) => {
  const [viewMode, setViewMode] = useState("slider");
  const [splitPos, setSplitPos] = useState(50);
  const [heatmapAlpha, setHeatmapAlpha] = useState(55);
  const [isAutoSweeping, setIsAutoSweeping] = useState(false);
  const [sweepDirection, setSweepDirection] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const gradcam = result?.gradcam;
  const overlayUrl = gradcam?.overlay || gradcam?.image || (typeof gradcam === "string" ? gradcam : null);
  const layers = [...(gradcam?.layers || [])].reverse();

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
    if (!isDragging) return;
    updateSplitPosFromEvent(e);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // fallback
    }
  };

  // Simulation View
  const simView = (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode("slider")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === "slider" ? "bg-white text-amber-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Thanh quét 50/50
          </button>
          <button
            type="button"
            onClick={() => setViewMode("side_by_side")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === "side_by_side" ? "bg-white text-amber-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Song song
          </button>
        </div>

        {layers.length > 0 && onGradcamLayerChange && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-bold hidden sm:inline">Tầng Conv:</span>
            <select
              value={selectedGradcamLayer || gradcam?.layer || ""}
              onChange={onGradcamLayerChange}
              disabled={loadingGradcam}
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800"
            >
              {layers.map((l, idx) => {
                const layerName = typeof l === "object" && l !== null ? l.name : String(l);
                const layerShape = typeof l === "object" && l !== null ? l.shape : "";
                return (
                  <option key={layerName || idx} value={layerName}>
                    {layerName} {layerShape ? `(${layerShape})` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Interactive Visual Canvas */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
        {overlayUrl ? (
          <>
            {viewMode === "slider" ? (
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-full max-w-[420px] aspect-square mx-auto rounded-2xl overflow-hidden border-2 border-slate-700 select-none cursor-ew-resize shadow-2xl"
              >
                <img
                  src={overlayUrl}
                  alt="Grad-CAM Overlay"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
                >
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Ảnh gốc
                  </div>
                </div>

                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_white] pointer-events-none"
                  style={{ left: `${splitPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg font-bold text-[10px]">
                    ↔
                  </div>
                </div>

                <div className="absolute top-2 right-2 bg-amber-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
                  Grad-CAM
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-w-[480px] mx-auto">
                <div className="space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ảnh gốc</span>
                  <img src={previewUrl} alt="Original" className="w-full aspect-square object-cover rounded-xl border border-slate-700" />
                </div>
                <div className="space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Bản đồ Grad-CAM</span>
                  <img src={overlayUrl} alt="Overlay" className="w-full aspect-square object-cover rounded-xl border border-amber-500/50" />
                </div>
              </div>
            )}

            {/* Scale Bar */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 via-yellow-400 to-red-600 shadow-inner" />
              <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                <span className="text-blue-400">Không ảnh hưởng (Nền)</span>
                <span className="text-yellow-400">Ảnh hưởng vừa</span>
                <span className="text-red-400 font-bold">VÙNG QUYẾT ĐỊNH CHÍNH (Mắt, mỏ, vân lông...)</span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Hãy tải ảnh lên và bấm &quot;Nhận diện &amp; Phân tích CNN&quot; để tạo bản đồ nhiệt Grad-CAM.
          </div>
        )}
      </div>
    </div>
  );

  // Theory View: Deep, structured, and mathematical explanation of Grad-CAM (XAI)
  const theoryView = (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-600 text-white shadow-sm">
            <ScanSearch className="w-4 h-4" />
          </span>
          <p className="text-xs font-black text-amber-950 uppercase">
            Nguyên Lý Bản Đồ Nhiệt Giải Thích AI (Grad-CAM XAI)
          </p>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Grad-CAM (Gradient-weighted Class Activation Mapping)</strong> sử dụng luồng gradient của điểm số lớp dự đoán <em>yᶜ</em> truyền ngược về Feature Map <em>Aᵏ</em> ở tầng tích chập cuối cùng để định lượng trọng số đóng góp của từng vùng không gian đối với quyết định phân loại.
        </p>
      </div>

      {/* 3 Algorithmic Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white border border-amber-200/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md uppercase">
            1. Global Average Pooling Gradient
          </span>
          <div className="font-mono text-[11px] font-bold text-amber-950 bg-amber-50/70 p-2 rounded-xl border border-amber-200 text-center">
            α<sub>k</sub><sup>c</sup> = (1/Z) ∑<sub>i</sub> ∑<sub>j</sub> (∂y<sup>c</sup> / ∂A<sub>ij</sub><sup>k</sup>)
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Tính trọng số tầm quan trọng α<sub>k</sub><sup>c</sup> của kênh Feature Map thứ <em>k</em> đối với lớp loài <em>c</em>.
          </p>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase">
            2. Tổ Hợp Tuyến Tính &amp; ReLU
          </span>
          <div className="font-mono text-[11px] font-bold text-emerald-950 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200 text-center">
            L<sub>GradCAM</sub><sup>c</sup> = ReLU(∑<sub>k</sub> α<sub>k</sub><sup>c</sup> · A<sup>k</sup>)
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Hàm ReLU lọc bỏ các đặc trưng âm, chỉ giữ lại các điểm ảnh làm tăng xác suất của loài mục tiêu.
          </p>
        </div>

        <div className="bg-white border border-blue-200/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md uppercase">
            3. Phóng To &amp; Phủ Màu (Heatmap)
          </span>
          <div className="font-mono text-[11px] font-bold text-blue-950 bg-blue-50/70 p-2 rounded-xl border border-blue-200 text-center">
            Overlay = 0.5 · Heatmap + 0.5 · Img
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Nội suy bilinear bản đồ 7×7 lên 224×224 và phủ dải màu Turbo/Jet trực quan lên ảnh gốc.
          </p>
        </div>
      </div>

      {/* Auditing and Trust Card */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Ý Nghĩa Của Grad-CAM Trong Kiểm Định Sinh Học (Model Auditing)
          </p>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            Trustworthy AI
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">Kiểm tra đặc trưng sinh học thực thụ</strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Chứng minh mạng CNN nhận diện Đại bàng nhờ mỏ khoằm và mắt sắc, nhận diện Hổ nhờ sọc vằn trên thân, chứ không dựa vào phông nền cỏ cây ngẫu nhiên.
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-cyan-400 block">Khắc phục hiện tượng "Hộp đen" (Black Box)</strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tạo sự tin cậy tuyệt đối cho người dùng và các nhà nghiên cứu sinh học khi ứng dụng mô hình Deep Learning vào giám sát bảo tồn động vật hoang dã.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CnnStageShell
      stageId={6}
      stageTitle="6. Trực Quan Hoá &amp; Giải Thích AI (Grad-CAM XAI)"
      stageDesc="Bản đồ nhiệt kích hoạt làm nổi bật vùng ảnh hưởng nhiều nhất đến quyết định"
      badgeTag="Bản đồ nhiệt XAI"
      icon={ScanSearch}
      simView={simView}
      theoryView={theoryView}
      codeData={STAGE6_CODE_DATA}
    />
  );
};

export default CnnStage6Gradcam;
