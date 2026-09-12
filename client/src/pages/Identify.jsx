import { useState, useEffect, createElement } from "react";
import { identifyAPI } from "../services/api";
import UploadBox from "../components/UploadBox";
import CameraCapture from "../components/CameraCapture";
import CnnInteractiveLab from "../components/cnn/CnnInteractiveLab";
import {
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  Camera,
  Leaf,
  Dna,
  Camera as CameraIcon,
  Layers,
  BrainCircuit,
  Cpu,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

const ConfidenceBadge = ({ value }) => {
  const color =
    value >= 80
      ? "bg-green-100 text-green-700 border-green-200"
      : value >= 50
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";
  const label =
    value >= 80 ? "Độ chính xác cao" : value >= 50 ? "Tương đối chính xác" : "Độ chính xác thấp";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${color}`}>
      <CheckCircle2 className="w-3.5 h-3.5" />
      {value}% — {label}
    </span>
  );
};

const ConfidenceWarning = ({ value }) => {
  if (value >= 50) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-amber-800">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div>
        <p className="text-sm font-bold">Mô hình chưa chắc chắn với ảnh này</p>
        <p className="mt-0.5 text-xs leading-relaxed">
          Độ tin cậy thấp, ảnh có thể không thuộc các lớp đã huấn luyện hoặc góc chụp chưa đủ rõ để phân loại chính xác.
        </p>
      </div>
    </div>
  );
};

const TIP_ITEMS = [
  { icon: Camera, text: "Ảnh chụp rõ nét, đủ sáng, không bị mờ" },
  { icon: Leaf, text: "Loài vật chiếm phần lớn khung hình" },
  { icon: Dna, text: "Tránh ảnh có quá nhiều vật thể gây nhiễu" },
];

// Sample presets for quick testing with real photos from dataset
const SAMPLE_PRESETS = [
  {
    name: "Cá sấu",
    label: "african_crocodile",
    vietnameseName: "Cá sấu châu Phi",
    image: "/samples/african_crocodile.jpg",
  },
  {
    name: "Đại bàng",
    label: "eagle",
    vietnameseName: "Đại bàng",
    image: "/samples/eagle.jpg",
  },
  {
    name: "Hươu cao cổ",
    label: "giraffe",
    vietnameseName: "Hươu cao cổ",
    image: "/samples/giraffe.jpg",
  },
  {
    name: "Chim cánh cụt",
    label: "penguin",
    vietnameseName: "Chim cánh cụt",
    image: "/samples/penguin.jpg",
  },
  {
    name: "Cá heo",
    label: "dolphin",
    vietnameseName: "Cá heo",
    image: "/samples/dolphin.jpg",
  },
  {
    name: "Cú mèo",
    label: "owl",
    vietnameseName: "Cú mèo",
    image: "/samples/owl.jpg",
  },
];

const Identify = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [selectedGradcamLayer, setSelectedGradcamLayer] = useState("");
  const [pipelineStep, setPipelineStep] = useState(1);
  const [loadingGradcam, setLoadingGradcam] = useState(false);

  // Synchronize visual stage pace during inference
  useEffect(() => {
    if (!loading) return undefined;

    setPipelineStep(1);
    const timers = [
      window.setTimeout(() => setPipelineStep(2), 700),
      window.setTimeout(() => setPipelineStep(3), 1600),
      window.setTimeout(() => setPipelineStep(4), 2600),
      window.setTimeout(() => setPipelineStep(5), 3600),
      window.setTimeout(() => setPipelineStep(6), 4600),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [loading]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError("");
    setSelectedGradcamLayer("");
    setPipelineStep(1);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl("");
    }
  };

  // Helper to load sample preset using real images from the dataset
  const handleSelectPreset = async (preset) => {
    try {
      const response = await fetch(preset.image);
      if (!response.ok) {
        throw new Error("Không thể tải ảnh mẫu");
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], `${preset.label}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      handleFileSelect(sampleFile);
      toast.success(`Đã chọn ảnh mẫu thật: ${preset.name}`);
    } catch (err) {
      toast.error(`Lỗi tải ảnh mẫu: ${preset.name}`);
    }
  };

  const handleIdentify = async (gradcamLayer = selectedGradcamLayer) => {
    if (!file) {
      toast.error("Vui lòng chọn hoặc tải ảnh lên trước khi nhận diện");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (gradcamLayer) {
        formData.append("gradcam_layer", gradcamLayer);
      }
      const res = await identifyAPI.identify(formData);
      const dataResult = res.data.result;
      setResult(dataResult);
      setSelectedGradcamLayer(dataResult?.gradcam?.layer || gradcamLayer || "");
      setPipelineStep(6); // Navigate to Grad-CAM stage upon completion
      toast.success(`Nhận diện thành công: ${dataResult.vietnameseName || dataResult.label}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Không thể nhận diện. Vui lòng kiểm tra lại dịch vụ AI.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    setShowCamera(false);
    setSelectedGradcamLayer("");
    setPipelineStep(1);
  };

  const handleCameraCapture = (capturedFile) => {
    setFile(capturedFile);
    setResult(null);
    setShowCamera(false);
    setError("");
    setSelectedGradcamLayer("");
    setPipelineStep(1);
    setPreviewUrl(URL.createObjectURL(capturedFile));
  };

  const openCamera = () => {
    setShowCamera(true);
    setError("");
    setResult(null);
    setSelectedGradcamLayer("");
    setPipelineStep(1);
  };

  const handleGradcamLayerChange = async (event) => {
    const nextLayer = event.target.value;
    setSelectedGradcamLayer(nextLayer);
    if (!file || result?.gradcamClassIndex === undefined) {
      setError("Thiếu thông tin lần nhận diện trước để tạo Grad-CAM.");
      return;
    }

    setLoadingGradcam(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("class_index", result.gradcamClassIndex);
      if (nextLayer) {
        formData.append("gradcam_layer", nextLayer);
      }

      const res = await identifyAPI.gradcam(formData);
      setResult((current) =>
        current
          ? {
              ...current,
              gradcam: res.data.gradcam,
            }
          : current
      );
      setSelectedGradcamLayer(res.data.gradcam?.layer || nextLayer || "");
      toast.success(`Đã cập nhật Grad-CAM với layer: ${nextLayer}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể tạo Grad-CAM cho layer này.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingGradcam(false);
    }
  };

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 40%, #f0fdf4 100%)" }}
    >
      {/* ── Page Hero Banner ── */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100 py-10 sm:py-12 mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full opacity-40 blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100 rounded-full opacity-30 blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="max-w-[1700px] mx-auto px-6 sm:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-3xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold mb-3.5 border border-green-200 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                Phòng Thí Nghiệm Học Sâu CNN & Trực Quan Hoá AI
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Thực Nghiệm &amp; Giải Mã <span className="text-green-600">Mạng CNN</span>
              </h1>
              <p className="text-gray-600 mt-2.5 text-sm sm:text-base font-medium leading-relaxed">
                Khám phá chi tiết cách mạng nơ-ron tích chập tiếp nhận ảnh số (RGB Tensor), tiền xử lý, trích xuất đặc trưng bằng Kernel, giảm chiều MaxPooling, phân loại Softmax và giải thích quyết định bằng bản đồ nhiệt Grad-CAM.
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-2.5 animate-fade-in-up delay-100">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl shadow-sm">
                <BrainCircuit className="w-4 h-4 text-emerald-700" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-emerald-600">Kiến trúc</p>
                  <p className="text-xs font-extrabold text-emerald-950">Deep CNN + Grad-CAM</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-2xl shadow-sm">
                <Cpu className="w-4 h-4 text-blue-700" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-blue-600">Kích thước Tensor</p>
                  <p className="text-xs font-extrabold text-blue-950">224 × 224 × 3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Workspace ── */}
      <div className="max-w-[1700px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ══════════════════════════════════════════════════════════════
              LEFT PANEL (4.5 cols on desktop): Input & Prediction Console
             ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Sample Presets */}
            <div className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-sm space-y-3 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mẫu thử nghiệm nhanh (1-Click Presets)
                </p>
                <span className="text-[11px] text-emerald-700 font-semibold">Thử không cần tìm ảnh</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl border border-gray-200/80 hover:border-emerald-500 hover:bg-emerald-50/70 transition-all duration-200 group text-center"
                    title={`Chọn mẫu thật: ${preset.name} (${preset.vietnameseName})`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs ring-1 ring-gray-200 group-hover:ring-emerald-400 group-hover:scale-105 transition-all duration-200">
                      <img
                        src={preset.image}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 group-hover:text-emerald-700 truncate w-full px-0.5">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Box or Camera */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm animate-fade-in-up delay-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nguồn dữ liệu hình ảnh
                </p>
                {previewUrl && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Đã nạp Tensor ảnh
                  </span>
                )}
              </div>

              {!showCamera ? (
                <UploadBox onFileSelect={handleFileSelect} disabled={loading} initialFile={file} />
              ) : (
                <CameraCapture
                  onCapture={handleCameraCapture}
                  onClose={() => setShowCamera(false)}
                  disabled={loading}
                />
              )}

              {/* Action Toolbar */}
              <div className="flex gap-2.5 mt-4">
                {!showCamera && !file && (
                  <button
                    type="button"
                    onClick={openCamera}
                    disabled={loading}
                    className="px-4 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-blue-200"
                  >
                    <CameraIcon className="w-4 h-4" />
                    <span>Camera</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleIdentify()}
                  disabled={!file || loading}
                  className={`flex-1 py-3.5 font-bold text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md ${
                    !file || loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      : "btn-shimmer text-white hover:shadow-green-200 scale-[1.01]"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang giải mã mạng CNN...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Nhận diện &amp; Phân tích CNN</span>
                    </>
                  )}
                </button>

                {(file || result) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-3.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 rounded-2xl transition-all shadow-sm"
                    title="Làm mới từ đầu"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Error Box */}
              {error && (
                <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl animate-fade-in text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Lỗi xử lý</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Prediction Result Card */}
            {result && (
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-md animate-fade-in-up">
                {/* Result header banner */}
                <div className="relative bg-gradient-to-br from-green-700 via-emerald-600 to-teal-700 text-white p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-2 text-green-200 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-green-300" />
                      Kết quả phân loại từ mô hình
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold capitalize leading-tight mb-2">
                      {result.vietnameseName ? (
                        <>
                          {result.vietnameseName}
                          <span className="text-green-200 text-sm font-semibold block mt-0.5 italic lowercase">
                            ({result.label})
                          </span>
                        </>
                      ) : (
                        result.label
                      )}
                    </h2>

                    {/* Confidence percentage bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="opacity-80 font-medium">Độ tin cậy của Softmax:</span>
                        <span className="font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
                          {result.confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${result.confidence}%`,
                            background:
                              result.confidence >= 80
                                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                                : result.confidence >= 50
                                ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                                : "linear-gradient(90deg, #f87171, #ef4444)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result Biological Details */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <ConfidenceBadge value={result.confidence} />
                    <span className="text-xs text-gray-400 font-mono">
                      Class ID: #{result.gradcamClassIndex ?? "--"}
                    </span>
                  </div>

                  <ConfidenceWarning value={result.confidence} />

                  {result.details ? (
                    <div className="space-y-3 pt-2">
                      <div className="flex gap-4 items-start">
                        {result.details.imageUrl && (
                          <img
                            src={result.details.imageUrl}
                            alt={result.details.vietnameseName}
                            className="w-24 h-24 object-cover rounded-2xl flex-shrink-0 shadow-sm ring-2 ring-green-100"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-gray-900 text-base leading-snug">
                            {result.details.vietnameseName}
                          </h3>
                          {result.details.description && (
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-4 mt-1">
                              {result.details.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
                      Chưa có mô tả bách khoa chi tiết cho nhãn này trong CSDL.
                    </div>
                  )}

                  {/* Model Specs Card */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" /> Thông số mô hình đã dùng
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        Đầu vào: <strong className="text-slate-800">224×224×3 (RGB)</strong>
                      </div>
                      <div>
                        Tổng số lớp: <strong className="text-slate-800">{result?.cnnDemo?.classCount || "47"} loài</strong>
                      </div>
                      <div>
                        Hàm kích hoạt: <strong className="text-slate-800">ReLU + Softmax</strong>
                      </div>
                      <div>
                        Giải thích: <strong className="text-slate-800">Grad-CAM XAI</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Card (when no result yet) */}
            {!result && (
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm animate-fade-in space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Mẹo để mạng CNN nhận diện chính xác nhất
                </p>
                <div className="space-y-2">
                  {TIP_ITEMS.map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        {createElement(icon, { className: "w-3.5 h-3.5 text-green-600" })}
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT PANEL (7.5 cols on desktop): CNN Interactive Neural Lab
             ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6">
            <CnnInteractiveLab
              result={result}
              previewUrl={previewUrl}
              currentStep={pipelineStep}
              onStepChange={setPipelineStep}
              isRunning={loading}
              selectedGradcamLayer={selectedGradcamLayer}
              onGradcamLayerChange={handleGradcamLayerChange}
              loadingGradcam={loadingGradcam}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Identify;
