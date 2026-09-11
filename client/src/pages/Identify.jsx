import { createElement, useEffect, useState } from "react";
import { identifyAPI } from "../services/api";
import UploadBox from "../components/UploadBox";
import CameraCapture from "../components/CameraCapture";
import { Sparkles, AlertCircle, AlertTriangle, CheckCircle2, Info, RefreshCw, Camera, Leaf, Dna, Camera as CameraIcon, ScanSearch, Image as ImageIcon, SlidersHorizontal, BrainCircuit, Waypoints, LoaderCircle } from "lucide-react";

const ConfidenceBadge = ({ value }) => {
  const color =
    value >= 80 ? "bg-green-100 text-green-700 border-green-200" :
    value >= 50 ? "bg-amber-100 text-amber-700 border-amber-200" :
                  "bg-red-100 text-red-700 border-red-200";
  const label = value >= 80 ? "Độ chính xác cao" : value >= 50 ? "Tương đối chính xác" : "Độ chính xác thấp";
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
        <p className="mt-0.5 text-sm leading-relaxed">
          Độ tin cậy thấp, ảnh có thể không thuộc các lớp đã huấn luyện hoặc chưa đủ rõ để phân loại chính xác.
        </p>
      </div>
    </div>
  );
};

const TIP_ITEMS = [
  { icon: Camera, text: "Ảnh chụp rõ nét, đủ sáng" },
  { icon: Leaf,   text: "Loài vật chiếm phần lớn khung hình" },
  { icon: Dna,    text: "Tránh ảnh mờ, nhiều vật thể" },
];

const CnnDemoPanel = ({ result, previewUrl, activeStep = 5, isRunning = false, onReplay, onSelectStep, selectedGradcamLayer, onGradcamLayerChange }) => {
  const cnn = result?.cnnDemo;
  const inputShape = cnn?.inputShape?.join(" × ") || "224 × 224 × 3";
  const classCount = cnn?.classCount || "47";
  const top5 = result?.top5 || [];

  const stages = [
    { title: "Input", detail: "Ảnh RGB tải lên", icon: ImageIcon },
    { title: "Preprocess", detail: `${inputShape}; RGB, resize, float32`, icon: SlidersHorizontal },
    { title: "CNN", detail: "Conv2D → BatchNorm → MaxPooling", icon: BrainCircuit },
    { title: "Softmax", detail: `${classCount} xác suất lớp`, icon: Waypoints },
    { title: "Grad-CAM", detail: "Vùng mô hình tập trung", icon: ScanSearch },
  ];

  const displayedStep = Math.min(Math.max(activeStep, 1), stages.length);
  const currentStage = stages[displayedStep - 1];
  const CurrentIcon = currentStage.icon;

  const renderScene = () => {
    if (displayedStep === 1) return (
      <div className="grid grid-cols-[auto_1fr] items-center gap-5">
        <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-lg">
          {previewUrl ? <img src={previewUrl} alt="Ảnh RGB đầu vào" className="h-full w-full object-cover" /> : <ImageIcon className="m-8 h-12 w-12 text-slate-300" />}
        </div>
        <div><p className="font-bold text-slate-900">Ảnh được đọc thành ba kênh màu</p><p className="mt-1 text-sm leading-relaxed text-slate-600">Mỗi điểm ảnh gồm Red, Green, Blue — đây là dữ liệu mô hình nhận đầu tiên.</p><div className="mt-3 flex gap-1">{["bg-red-400", "bg-green-400", "bg-blue-400"].map((color) => <span key={color} className={`h-2 flex-1 rounded-full ${color}`} />)}</div></div>
      </div>
    );
    if (displayedStep === 2) return (
      <div className="grid grid-cols-[auto_1fr] items-center gap-5">
        <div className="grid h-28 w-28 grid-cols-7 gap-0.5 rounded-xl bg-slate-900 p-2 shadow-lg">{Array.from({ length: 49 }, (_, i) => <span key={i} className="rounded-sm bg-emerald-300/80" style={{ opacity: 0.2 + ((i * 13) % 70) / 100 }} />)}</div>
        <div><p className="font-bold text-slate-900">Chuẩn hoá về cùng một khuôn ảnh</p><p className="mt-1 text-sm leading-relaxed text-slate-600">Ảnh được resize về {inputShape}, giữ RGB và chuyển thành số <code>float32</code> để CNN xử lý nhất quán.</p><span className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Resize → tensor số</span></div>
      </div>
    );
    if (displayedStep === 3) return (
      <div className="grid grid-cols-[auto_1fr] items-center gap-5">
        <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg"><BrainCircuit className="h-14 w-14 text-white animate-pulse" /></div>
        <div><p className="font-bold text-slate-900">CNN tìm các đặc trưng của con vật</p><p className="mt-1 text-sm leading-relaxed text-slate-600">Các lớp convolution quét ảnh để nhận ra đường viền, da, sừng và các đặc trưng phức tạp hơn.</p><div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700"><span className="rounded bg-emerald-100 px-2 py-1">Conv2D</span><span>→</span><span className="rounded bg-teal-100 px-2 py-1">BatchNorm</span><span>→</span><span className="rounded bg-green-100 px-2 py-1">Pooling</span></div></div>
      </div>
    );
    if (displayedStep === 4) return (
      <div className="space-y-3">
        <div><p className="font-bold text-slate-900">Softmax biến kết quả thành xác suất</p><p className="mt-1 text-sm text-slate-600">Mô hình đã so sánh {classCount} lớp. Thanh dài hơn nghĩa là mô hình tin tưởng hơn.</p></div>
        {top5.length > 0 ? <div className="space-y-2">{top5.map((item, index) => <div key={item.label} className="grid grid-cols-[1.25rem_6.5rem_1fr_2.5rem] items-center gap-2 text-xs"><span className="font-bold text-slate-400">{index + 1}</span><span className="truncate font-semibold text-slate-700">{item.label}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-600 transition-all duration-1000" style={{ width: `${item.confidence}%` }} /></div><span className="text-right font-bold text-green-700">{item.confidence}%</span></div>)}</div> : <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />}
      </div>
    );
    const gradcam = result?.gradcam;
    const layers = [...(gradcam?.layers || [])].reverse();
    return (
      <div>
        <div className="mb-4 flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">CNN đã nhìn vào đâu để đưa ra nhãn?</p><p className="mt-1 text-sm text-slate-600">Màu đỏ, cam là vùng có ảnh hưởng lớn nhất đến quyết định.</p></div>{layers.length > 0 && <select value={selectedGradcamLayer || gradcam?.layer || ""} onChange={onGradcamLayerChange} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none"><option value="" disabled>Chọn layer</option>{layers.map((layer) => <option key={layer.name} value={layer.name}>{layer.name}</option>)}</select>}</div>
        {gradcam?.image ? <div className="grid grid-cols-2 gap-3"><div><p className="mb-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Ảnh đầu vào</p><img src={previewUrl} alt="Ảnh đầu vào" className="aspect-square w-full rounded-xl object-cover shadow-sm" /></div><div><p className="mb-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Vùng AI tập trung</p><img src={gradcam.image} alt="Grad-CAM heatmap" className="aspect-square w-full rounded-xl object-cover shadow-sm" /></div></div> : <div className="flex h-32 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">Đang tạo bản đồ Grad-CAM…</div>}
      </div>
    );
  };

  return (
    <section className="border-t border-gray-100 bg-slate-50/70 p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
        <p className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <Dna className="w-3.5 h-3.5" /> CNN inference pipeline
        </p>
        <h3 className="font-extrabold text-gray-900 text-lg">Ảnh được mô hình xử lý như thế nào?</h3>
        <p className="mt-1 text-sm text-gray-600">
          {isRunning
            ? "FastAPI đang chạy lần lượt qua các bước. Hãy quan sát ô đang sáng."
            : "Các giá trị bên dưới là kết quả thực tế của lần dự đoán này, không phải nhãn dự phòng."}
        </p>
        </div>
        {!isRunning && result && <button onClick={onReplay} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"><RefreshCw className="h-3.5 w-3.5" /> Xem lại</button>}
      </div>

      <div className="relative mb-5 grid grid-cols-5 gap-1.5">
        {stages.map((stage, index) => {
          const step = index + 1;
          const isActive = isRunning && displayedStep === step;
          const isComplete = displayedStep > step || (!isRunning && displayedStep === stages.length);
          const StageIcon = stage.icon;
          return (
            <button
              type="button"
              onClick={() => !isRunning && onSelectStep?.(step)}
              disabled={isRunning}
              key={stage.title}
              className={`flex flex-col items-center gap-1 text-center transition-all duration-500 ${isActive ? "scale-105" : ""} ${isRunning ? "cursor-default" : "cursor-pointer"}`}
              aria-label={`Xem bước ${step}: ${stage.title}`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${isActive ? "border-green-600 bg-green-600 text-white shadow-lg shadow-green-200" : isComplete ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400"}`}>{isActive ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isComplete ? <CheckCircle2 className="h-4 w-4" /> : <StageIcon className="h-4 w-4" />}</span>
              <p className={`text-[11px] font-extrabold ${isActive ? "text-green-700" : "text-slate-500"}`}>{step}. {stage.title}</p>
            </button>
          );
        })}
      </div>

      <div className="min-h-44 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in" key={displayedStep}>
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700"><CurrentIcon className="h-4 w-4" /> Cảnh {displayedStep}/5 · {currentStage.title}{isRunning && <span className="ml-auto normal-case text-green-600">Đang xử lý…</span>}</div>
        {renderScene()}
      </div>

      {!isRunning && displayedStep === 3 && cnn?.convLayers?.length > 0 && (
        <details className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Các convolution layer được FastAPI phát hiện trong model</summary>
          <div className="mt-3 grid gap-1.5 text-xs text-slate-600">
            {cnn.convLayers.map((layer) => <div key={layer.name} className="flex justify-between gap-4"><code>{layer.name}</code><span className="text-right">{layer.shape}</span></div>)}
          </div>
        </details>
      )}
    </section>
  );
};

const Identify = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [selectedGradcamLayer, setSelectedGradcamLayer] = useState("");
  const [pipelineStep, setPipelineStep] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);

  // The request remains the source of truth: this only paces the visual explanation
  // while FastAPI is working, then marks every stage complete when its response arrives.
  useEffect(() => {
    if (!loading && !demoPlaying) {
      if (result) setPipelineStep(5);
      return undefined;
    }

    setPipelineStep(1);
    const timers = [
      window.setTimeout(() => setPipelineStep(2), 900),
      window.setTimeout(() => setPipelineStep(3), 2100),
      window.setTimeout(() => setPipelineStep(4), 3400),
      window.setTimeout(() => setPipelineStep(5), 4700),
    ];
    if (demoPlaying && !loading) timers.push(window.setTimeout(() => setDemoPlaying(false), 6100));
    return () => timers.forEach(window.clearTimeout);
  }, [loading, result, demoPlaying]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError("");
    setSelectedGradcamLayer("");
    setPipelineStep(0);
    setDemoPlaying(false);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl("");
    }
  };

  const handleIdentify = async (gradcamLayer = selectedGradcamLayer) => {
    if (!file) return;
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
      setResult(res.data.result);
      setSelectedGradcamLayer(res.data.result?.gradcam?.layer || gradcamLayer || "");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể nhận diện. Thử lại với ảnh khác.");
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
    setPipelineStep(0);
    setDemoPlaying(false);
  };

  const handleCameraCapture = (capturedFile) => {
    setFile(capturedFile);
    setResult(null);
    setShowCamera(false);
    setError("");
    setSelectedGradcamLayer("");
    setPipelineStep(0);
    setDemoPlaying(false);
    setPreviewUrl(URL.createObjectURL(capturedFile));
  };

  const openCamera = () => {
    setShowCamera(true);
    setError("");
    setResult(null);
    setSelectedGradcamLayer("");
    setPipelineStep(0);
    setDemoPlaying(false);
  };

  const replayPipeline = () => {
    setPipelineStep(1);
    setDemoPlaying(true);
  };

  const handleGradcamLayerChange = async (event) => {
    const nextLayer = event.target.value;
    setSelectedGradcamLayer(nextLayer);
    if (!file || result?.gradcamClassIndex === undefined) {
      setError("Thiếu thông tin lần nhận diện trước để tạo Grad-CAM.");
      return;
    }

    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("class_index", result.gradcamClassIndex);
      if (nextLayer) {
        formData.append("gradcam_layer", nextLayer);
      }

      const res = await identifyAPI.gradcam(formData);
      setResult((current) => current ? {
        ...current,
        gradcam: res.data.gradcam,
      } : current);
      setSelectedGradcamLayer(res.data.gradcam?.layer || nextLayer || "");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tạo Grad-CAM cho layer này.");
    }
  };

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%)" }}
    >
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-5 border border-green-200">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Nhận diện bằng AI
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
            Nhận Diện <span className="text-green-600">Loài Vật</span>
          </h1>
          <p className="text-gray-500 text-base max-w-sm mx-auto leading-relaxed">
            Tải ảnh để quan sát toàn bộ quy trình CNN: preprocessing, Softmax và Grad-CAM.
          </p>
        </div>

        {/* ── Upload card ── */}
        {!showCamera ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4 animate-fade-in-up delay-100">
            <UploadBox onFileSelect={handleFileSelect} disabled={loading} initialFile={file} />
          </div>
        ) : (
          <div className="mb-4 animate-fade-in-up delay-100">
            <CameraCapture
              onCapture={handleCameraCapture}
              onClose={() => setShowCamera(false)}
              disabled={loading}
            />
          </div>
        )}

        {/* ── Tips (no file selected) ── */}
        {!file && !result && (
          <div className="mb-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-fade-in delay-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Mẹo để đạt kết quả tốt nhất
            </p>
            <div className="flex flex-col gap-2">
              {TIP_ITEMS.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {createElement(icon, { className: "w-3.5 h-3.5 text-green-600" })}
                  </div>
                  <p className="text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Identify button ── */}
        <div className="flex gap-3 animate-fade-in-up delay-200">
          {/* Camera button - only show when not in camera mode */}
          {!showCamera && !file && (
            <button
              onClick={openCamera}
              disabled={loading}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md hover:shadow-blue-200"
            >
              <CameraIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Mở Camera</span>
            </button>
          )}

          <button
            onClick={() => handleIdentify()}
            disabled={!file || loading}
            className={`flex-1 py-4 font-bold text-base rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200
              ${!file || loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "btn-shimmer text-white shadow-lg hover:shadow-green-200"
              }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Nhận diện ngay
              </>
            )}
          </button>

          {/* Reset button */}
          {(file || result) && (
            <button
              onClick={handleReset}
              className="px-4 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 rounded-2xl transition-all duration-200 shadow-sm"
              title="Làm lại từ đầu"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-2xl animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold mb-0.5">Nhận diện thất bại</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Live teaching view: shown while the model request is in flight. */}
        {loading && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-green-100 bg-white shadow-md animate-fade-in-up">
            <CnnDemoPanel
              previewUrl={previewUrl}
              activeStep={pipelineStep}
              isRunning
            />
          </div>
        )}

        {/* ── Result ── */}
        {result && (
          <div className="mt-6 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden animate-fade-in-up">

            {/* Result header */}
            <div className="relative bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 text-white p-7 overflow-hidden">
              <div className="absolute top-0 right-0 w-52 h-52 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <p className="text-xs font-bold opacity-70 uppercase tracking-wider">CNN prediction result</p>
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold capitalize leading-tight mb-4">
                  {result.vietnameseName
                    ? (
                      <>
                        {result.vietnameseName}
                        <span className="text-green-200 text-lg font-semibold block mt-0.5 italic">
                          {result.label}
                        </span>
                      </>
                    )
                    : result.label}
                </h2>

                {/* Confidence bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="opacity-70">Độ chính xác</span>
                    <span className="font-bold bg-white/20 px-2.5 py-0.5 rounded-full">{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${result.confidence}%`,
                        background: result.confidence >= 80
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

            <CnnDemoPanel
              result={result}
              previewUrl={previewUrl}
              activeStep={pipelineStep}
              isRunning={demoPlaying}
              onReplay={replayPipeline}
              onSelectStep={setPipelineStep}
              selectedGradcamLayer={selectedGradcamLayer}
              onGradcamLayerChange={handleGradcamLayerChange}
            />

            {/* Thông tin loài trong cơ sở dữ liệu, nếu nhãn có dữ liệu mô tả. */}
            {result.details ? (
              <div className="p-6">
                <div className="flex gap-5">
                  {result.details.imageUrl && (
                    <img
                      src={result.details.imageUrl}
                      alt={result.details.vietnameseName}
                      className="w-32 h-32 object-cover rounded-2xl flex-shrink-0 shadow-md ring-2 ring-green-100"
                    />
                  )}
                  <div className={`${result.details.imageUrl ? "flex-1 min-w-0" : "flex-1"}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight capitalize">
                        {result.details.vietnameseName}
                      </h3>
                    </div>
                    <ConfidenceBadge value={result.confidence} />
                    {result.warning && (
                      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-amber-800">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold">Không phải dữ liệu loài vật</p>
                          <p className="mt-0.5 text-sm leading-relaxed">{result.warning}</p>
                        </div>
                      </div>
                    )}
                    <ConfidenceWarning value={result.confidence} />
                    {result.details.description && (
                      <p className="text-sm text-gray-600 leading-relaxed mt-3">
                        {result.details.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-medium text-gray-500 mb-1">Chưa có dữ liệu mô tả</p>
                <p className="text-sm">Nhãn này chưa có trong cơ sở dữ liệu của chúng tôi.</p>
                <ConfidenceWarning value={result.confidence} />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Identify;
