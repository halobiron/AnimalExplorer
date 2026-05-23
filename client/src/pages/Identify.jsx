import { useState } from "react";
import { identifyAPI } from "../services/api";
import UploadBox from "../components/UploadBox";
import CameraCapture from "../components/CameraCapture";
import { Sparkles, AlertCircle, CheckCircle2, Info, RefreshCw, Camera, Leaf, Dna, Camera as CameraIcon } from "lucide-react";

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

const TIP_ITEMS = [
  { icon: Camera, text: "Ảnh chụp rõ nét, đủ sáng" },
  { icon: Leaf,   text: "Loài vật chiếm phần lớn khung hình" },
  { icon: Dna,    text: "Tránh ảnh mờ, nhiều vật thể" },
];

const Identify = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError("");
  };

  const handleIdentify = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await identifyAPI.identify(formData);
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể nhận diện. Thử lại với ảnh khác.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError("");
    setShowCamera(false);
  };

  const handleCameraCapture = (capturedFile) => {
    setFile(capturedFile);
    setShowCamera(false);
    setError("");
  };

  const openCamera = () => {
    setShowCamera(true);
    setError("");
    setResult(null);
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
            Tải lên ảnh động vật — AI sẽ nhận diện và trả về thông tin sinh học chi tiết ngay lập tức.
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
              {TIP_ITEMS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-green-600" />
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
            onClick={handleIdentify}
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
                  <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Kết quả nhận diện</p>
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

            {/* Database info */}
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
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">
                      {result.details.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-medium text-gray-500 mb-1">Chưa có dữ liệu mô tả</p>
                <p className="text-sm">Loài vật này chưa có trong cơ sở dữ liệu của chúng tôi.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Identify;
