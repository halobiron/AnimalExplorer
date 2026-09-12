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

  // Theory View
  const theoryView = (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
        <p className="text-xs font-black text-amber-900 uppercase flex items-center gap-1.5">
          <ScanSearch className="w-4 h-4 text-amber-600" />
          Nguyên Lý Bản Đồ Nhiệt Giải Thích AI (Grad-CAM XAI)
        </p>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Grad-CAM</strong> (Gradient-weighted Class Activation Mapping) sử dụng gradient của điểm số lớp dự đoán $y^c$ truyền ngược về Feature Map $A^k$ ở tầng tích chập cuối cùng để tính trọng số đóng góp $\alpha_k^c$, sau đó tổ hợp tuyến tính và đưa qua hàm <strong>ReLU</strong> để làm nổi bật chính xác các đặc trưng sinh học kích hoạt quyết định phân loại.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase">
            1. Global Average Pooling
          </span>
          <p className="font-mono text-[11px] font-bold text-gray-800 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            α_k^c = (1/Z) ∑∑ (∂y^c / ∂A_ij^k)
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Tính trọng số tầm quan trọng của từng kênh Feature Map đối với lớp động vật mục tiêu.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
            2. Tổ hợp tuyến tính &amp; ReLU
          </span>
          <p className="font-mono text-[11px] font-bold text-gray-800 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            L_GradCAM = ReLU(∑ α_k^c · A^k)
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Hàm ReLU loại bỏ các đặc trưng âm, chỉ giữ lại các pixel làm tăng độ tin cậy của kết quả.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
            3. Phóng to &amp; Phủ màu (Overlay)
          </span>
          <p className="font-mono text-[11px] font-bold text-gray-800 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            Overlay = α · Heatmap + (1-α) · Img
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Nội suy bilinear bản đồ 7×7 lên 224×224 và phủ dải màu Jet/Turbo lên ảnh gốc để người dùng quan sát.
          </p>
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
