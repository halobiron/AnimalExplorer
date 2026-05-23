import { useRef, useState, useEffect } from "react";
import { Camera, X, VideoOff, RefreshCw } from "lucide-react";

const CameraCapture = ({ onCapture, onClose, disabled }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const startCamera = async () => {
    try {
      setError("");
      setIsLoading(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ camera");
      }

      if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        throw new Error("Camera chỉ hoạt động trên HTTPS hoặc localhost");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setIsActive(true);
              setIsLoading(false);
            })
            .catch(() => setError("Không thể khởi động camera"));
        };

        videoRef.current.onerror = () => setError("Lỗi khi hiển thị camera");
      }
    } catch (err) {
      setIsLoading(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Bạn đã từ chối quyền truy cập camera");
      } else if (err.name === "NotFoundError") {
        setError("Không tìm thấy camera trên thiết bị");
      } else if (err.name === "NotReadableError") {
        setError("Camera đang được ứng dụng khác sử dụng");
      } else {
        setError(err.message || "Không thể truy cập camera");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isActive || video.readyState !== 4) {
      setError("Video chưa sẵn sàng");
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;

        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        stopCamera();
        onCapture(file);
      }, "image/jpeg", 0.95);
    } catch {
      setError("Lỗi khi chụp ảnh");
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    stopCamera();
    setFacingMode(newMode);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  return (
    <div className="relative bg-black rounded-3xl overflow-hidden shadow-xl">
      <button
        onClick={onClose}
        disabled={disabled}
        className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="absolute top-4 left-4 z-20">
        {error ? (
          <div className="flex items-center gap-2 text-red-600 bg-red-50/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
            <VideoOff className="w-4 h-4" />
            <span>Lỗi</span>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <span>Đang khởi động...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600 bg-green-50/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Sẵn sàng</span>
          </div>
        )}
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto max-h-[500px] object-cover"
        style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
      />

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 z-10">
          <div className="text-center">
            <VideoOff className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-white text-sm font-medium mb-2">{error}</p>
            <button
              onClick={startCamera}
              disabled={disabled}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {!error && isActive && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={switchCamera}
              disabled={disabled}
              className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
              title="Chuyển camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={capture}
              disabled={disabled}
              className="bg-white hover:bg-gray-100 text-black p-4 rounded-full transition-all duration-200 shadow-lg hover:scale-105"
              title="Chụp ảnh"
            >
              <Camera className="w-6 h-6" />
            </button>

            <div className="w-11" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
