import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Layers, Eye, Info, Sparkles, Grid3X3, Play, Pause, Scan } from "lucide-react";

const CnnStage1Input = ({ previewUrl }) => {
  const [activeChannel, setActiveChannel] = useState("all"); // 'all' | 'r' | 'g' | 'b'
  const [hoveredPixel, setHoveredPixel] = useState({ x: 2, y: 2, r: 180, g: 120, b: 75 });
  const [isScanning, setIsScanning] = useState(true);
  const [scanPos, setScanPos] = useState(0);

  const canvasRef = useRef(null);
  const channelCanvasRef = useRef(null);
  const [pixelMatrix, setPixelMatrix] = useState([]);

  // Scanning laser animation
  useEffect(() => {
    if (!isScanning) return undefined;
    const interval = setInterval(() => {
      setScanPos((prev) => (prev >= 100 ? 0 : prev + 1.5));
    }, 40);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Extract actual RGB pixels from image onto canvas when previewUrl changes
  useEffect(() => {
    if (!previewUrl) {
      // Default fallback sample matrix
      const defaultGrid = Array.from({ length: 6 }, (_, y) =>
        Array.from({ length: 6 }, (_, x) => ({
          r: Math.min(255, 120 + x * 20 + y * 10),
          g: Math.min(255, 80 + x * 15 + y * 25),
          b: Math.min(255, 50 + x * 25 + y * 5),
        }))
      );
      setPixelMatrix(defaultGrid);
      setHoveredPixel({ x: 2, y: 2, ...defaultGrid[2][2] });
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = previewUrl;
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = 6;
      canvas.height = 6;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 6, 6);
      const imgData = ctx.getImageData(0, 0, 6, 6).data;

      const matrix = [];
      for (let y = 0; y < 6; y++) {
        const row = [];
        for (let x = 0; x < 6; x++) {
          const idx = (y * 6 + x) * 4;
          row.push({
            r: imgData[idx],
            g: imgData[idx + 1],
            b: imgData[idx + 2],
          });
        }
        matrix.push(row);
      }
      setPixelMatrix(matrix);
      if (matrix[2]?.[2]) {
        setHoveredPixel({ x: 2, y: 2, ...matrix[2][2] });
      }

      // Render channel-filtered full canvas
      if (channelCanvasRef.current) {
        const fullCanvas = channelCanvasRef.current;
        fullCanvas.width = 240;
        fullCanvas.height = 240;
        const fullCtx = fullCanvas.getContext("2d");
        fullCtx.drawImage(img, 0, 0, 240, 240);

        if (activeChannel !== "all") {
          const fullData = fullCtx.getImageData(0, 0, 240, 240);
          const data = fullData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (activeChannel === "r") {
              data[i + 1] = 0; // zero out green
              data[i + 2] = 0; // zero out blue
            } else if (activeChannel === "g") {
              data[i] = 0;     // zero out red
              data[i + 2] = 0; // zero out blue
            } else if (activeChannel === "b") {
              data[i] = 0;     // zero out red
              data[i + 1] = 0; // zero out green
            }
          }
          fullCtx.putImageData(fullData, 0, 0);
        }
      }
    };
  }, [previewUrl, activeChannel]);

  return (
    <div className="space-y-6">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-1.5">
            <Layers className="w-3.5 h-3.5" /> Giai đoạn 1: Biểu diễn Tensor ảnh đầu vào
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">
            Quét Laser &amp; Phân Tách 3 Kênh Màu RGB Thực Tế
          </h3>
        </div>

        {/* Scan & Channel Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsScanning(!isScanning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isScanning
                ? "bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            {isScanning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
            <span>Tia quét Laser: {isScanning ? "Đang quét" : "Tạm dừng"}</span>
          </button>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveChannel("all")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeChannel === "all" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-600"
              }`}
            >
              RGB
            </button>
            <button
              onClick={() => setActiveChannel("r")}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeChannel === "r" ? "bg-red-500 text-white shadow-sm font-bold" : "text-red-600"
              }`}
            >
              Đỏ (R)
            </button>
            <button
              onClick={() => setActiveChannel("g")}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeChannel === "g" ? "bg-green-600 text-white shadow-sm font-bold" : "text-green-700"
              }`}
            >
              Lục (G)
            </button>
            <button
              onClick={() => setActiveChannel("b")}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeChannel === "b" ? "bg-blue-600 text-white shadow-sm font-bold" : "text-blue-700"
              }`}
            >
              Lam (B)
            </button>
          </div>
        </div>
      </div>

      {/* Visual Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Dynamic Scanner on real Image */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[240px] aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-950 group">
            {previewUrl ? (
              <>
                <canvas
                  ref={channelCanvasRef}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Animated Laser Scanning Beam */}
                {isScanning && (
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)] z-20 pointer-events-none transition-all ease-linear"
                    style={{ top: `${scanPos}%` }}
                  >
                    <div className="absolute right-2 -top-2 bg-emerald-500 text-slate-950 font-mono text-[9px] font-extrabold px-1.5 rounded shadow">
                      SCAN {Math.round(scanPos)}%
                    </div>
                  </div>
                )}

                {/* Digital matrix grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <ImageIcon className="w-12 h-12 mb-2 opacity-40 animate-pulse" />
                <span className="text-xs">Chưa nạp ảnh</span>
              </div>
            )}

            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 z-30">
              <Eye className="w-3 h-3 text-emerald-400 animate-pulse" />
              {activeChannel === "all" ? "Kênh RGB Tổng Hợp" : `Kênh ${activeChannel.toUpperCase()} Thực Tế`}
            </div>
          </div>

          {/* Dynamic RGB Level Meters */}
          <div className="w-full max-w-[240px] mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
              <span>Độ sáng kênh đang soi:</span>
              <span className="font-mono text-emerald-700 font-bold">
                R:{hoveredPixel.r} G:{hoveredPixel.g} B:{hoveredPixel.b}
              </span>
            </div>
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${(hoveredPixel.r / 255) * 100}%` }}
                />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(hoveredPixel.g / 255) * 100}%` }}
                />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(hoveredPixel.b / 255) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Pixel Matrix */}
        <div className="md:col-span-7 bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-3xl shadow-inner space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-emerald-400" />
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Ma trận điểm ảnh thực tế ({pixelMatrix.length}×{pixelMatrix.length || 6})
              </p>
            </div>
            <span className="text-[10px] text-slate-400 animate-pulse">Rê chuột để soi điểm</span>
          </div>

          {/* Matrix Cells */}
          <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            {pixelMatrix.map((row, y) =>
              row.map((pixel, x) => {
                const isSelected = hoveredPixel?.x === x && hoveredPixel?.y === y;
                const displayVal =
                  activeChannel === "r"
                    ? pixel.r
                    : activeChannel === "g"
                    ? pixel.g
                    : activeChannel === "b"
                    ? pixel.b
                    : pixel.r;

                return (
                  <button
                    key={`${y}-${x}`}
                    type="button"
                    onMouseEnter={() => setHoveredPixel({ x, y, ...pixel })}
                    className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-mono font-extrabold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-emerald-400 scale-110 z-10 shadow-lg shadow-emerald-500/50"
                        : "opacity-85 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{
                      backgroundColor:
                        activeChannel === "r"
                          ? `rgb(${pixel.r}, 0, 0)`
                          : activeChannel === "g"
                          ? `rgb(0, ${pixel.g}, 0)`
                          : activeChannel === "b"
                          ? `rgb(0, 0, ${pixel.b})`
                          : `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`,
                      color:
                        pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114 > 130
                          ? "#000"
                          : "#fff",
                    }}
                  >
                    {displayVal}
                  </button>
                );
              })
            )}
          </div>

          {/* Hovered pixel inspection detail */}
          {hoveredPixel && (
            <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-md border border-white/30 shadow-md transition-all duration-200"
                  style={{
                    backgroundColor: `rgb(${hoveredPixel.r}, ${hoveredPixel.g}, ${hoveredPixel.b})`,
                  }}
                />
                <span className="font-mono text-slate-200 font-bold">
                  Tọa độ [{hoveredPixel.y}, {hoveredPixel.x}]:
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-800">
                  R: {hoveredPixel.r}
                </span>
                <span className="bg-green-950/80 text-green-300 px-2 py-0.5 rounded border border-green-800">
                  G: {hoveredPixel.g}
                </span>
                <span className="bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                  B: {hoveredPixel.b}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pedagogical Insight */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm text-emerald-950 space-y-1">
          <p className="font-bold text-emerald-900">
            Khái niệm cốt lõi: Ảnh là Tensor 3 chiều (H × W × 3)
          </p>
          <p className="text-emerald-800/90 leading-relaxed text-xs">
            Mỗi điểm ảnh gồm 3 giá trị nguyên từ <code>0</code> đến <code>255</code>. Khi đổi kênh màu, bạn có thể thấy rõ các chi tiết lông hoặc màu da phát sáng mạnh nhất trên kênh tương ứng (ví dụ da/vân cam nổi bật trên kênh Red).
          </p>
        </div>
      </div>
    </div>
  );
};

export default CnnStage1Input;
