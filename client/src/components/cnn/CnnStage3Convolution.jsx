import { useState, useEffect, useRef } from "react";
import { BrainCircuit, Sparkles, Check, Play, Pause, RotateCcw, Info, Sliders, ChevronRight, Eye } from "lucide-react";

const KERNEL_PRESETS = {
  vertical_edge: {
    name: "Cạnh dọc (Vertical Sobel)",
    desc: "Nhận diện đường biên thẳng đứng, dáng chân, sọc vằn dọc",
    matrix: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
    divisor: 1,
    offset: 0,
  },
  horizontal_edge: {
    name: "Cạnh ngang (Horizontal Sobel)",
    desc: "Nhận diện sống lưng, mắt ngang, đường chân trời, sọc ngang",
    matrix: [
      [-1, -2, -1],
      [ 0,  0,  0],
      [ 1,  2,  1],
    ],
    divisor: 1,
    offset: 0,
  },
  ridge_detection: {
    name: "Phát hiện viền (Laplacian Ridge)",
    desc: "Làm nổi bật toàn bộ đường viền chu vi bao quanh con vật",
    matrix: [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1],
    ],
    divisor: 1,
    offset: 0,
  },
  sharpen: {
    name: "Làm nét (Sharpen Kernel)",
    desc: "Tăng độ tương phản vân lông, mắt, móng vuốt và vảy động vật",
    matrix: [
      [ 0, -1,  0],
      [-1,  5, -1],
      [ 0, -1,  0],
    ],
    divisor: 1,
    offset: 0,
  },
};

const SAMPLE_INPUT_5X5 = [
  [1, 1, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 0],
  [0, 1, 1, 0, 0],
];

const CnnStage3Convolution = ({ previewUrl, cnnDemo }) => {
  const [selectedKernelKey, setSelectedKernelKey] = useState("vertical_edge");
  const [selectedOutputCell, setSelectedOutputCell] = useState({ r: 0, c: 0 });
  const [enableRelu, setEnableRelu] = useState(true);
  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const [scanSpeed, setScanSpeed] = useState(1200); // ms per cell

  const featureCanvasRef = useRef(null);

  const kernel = KERNEL_PRESETS[selectedKernelKey];
  const { r: outR, c: outC } = selectedOutputCell;

  // Auto-scanning loop over the 3x3 output feature map cells (9 positions)
  useEffect(() => {
    if (!isAutoScanning) return undefined;

    const interval = setInterval(() => {
      setSelectedOutputCell((prev) => {
        let nextC = prev.c + 1;
        let nextR = prev.r;
        if (nextC > 2) {
          nextC = 0;
          nextR = (nextR + 1) % 3;
        }
        return { r: nextR, c: nextC };
      });
    }, scanSpeed);

    return () => clearInterval(interval);
  }, [isAutoScanning, scanSpeed]);

  // Compute convolution for a specific cell
  const computeCell = (r, c) => {
    let sum = 0;
    const mults = [];
    for (let kr = 0; kr < 3; kr++) {
      for (let kc = 0; kc < 3; kc++) {
        const inVal = SAMPLE_INPUT_5X5[r + kr][c + kc];
        const kVal = kernel.matrix[kr][kc];
        const prod = inVal * kVal;
        sum += prod;
        mults.push({ inVal, kVal, prod });
      }
    }
    const reluVal = Math.max(0, sum);
    return { rawSum: sum, finalVal: enableRelu ? reluVal : sum, mults };
  };

  const currentCalc = computeCell(outR, outC);

  // Precompute 3x3 output feature map
  const outputFeatureMap = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => computeCell(r, c).finalVal)
  );

  // Apply real convolution filter onto user's uploaded image using Canvas
  useEffect(() => {
    if (!previewUrl || !featureCanvasRef.current) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = previewUrl;
    img.onload = () => {
      const canvas = featureCanvasRef.current;
      if (!canvas) return;
      const size = 180;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);

      const srcData = ctx.getImageData(0, 0, size, size);
      const dstData = ctx.createImageData(size, size);
      const src = srcData.data;
      const dst = dstData.data;

      const k = kernel.matrix;
      const div = kernel.divisor || 1;
      const offset = kernel.offset || 0;

      for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
          let r = 0, g = 0, b = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pIdx = ((y + ky) * size + (x + kx)) * 4;
              const weight = k[ky + 1][kx + 1];
              r += src[pIdx] * weight;
              g += src[pIdx + 1] * weight;
              b += src[pIdx + 2] * weight;
            }
          }

          r = r / div + offset;
          g = g / div + offset;
          b = b / div + offset;

          if (enableRelu) {
            r = Math.max(0, r);
            g = Math.max(0, g);
            b = Math.max(0, b);
          }

          const outIdx = (y * size + x) * 4;
          dst[outIdx] = Math.min(255, Math.max(0, r));
          dst[outIdx + 1] = Math.min(255, Math.max(0, g));
          dst[outIdx + 2] = Math.min(255, Math.max(0, b));
          dst[outIdx + 3] = 255;
        }
      }

      ctx.putImageData(dstData, 0, 0);
    };
  }, [previewUrl, selectedKernelKey, enableRelu]);

  const convLayers = cnnDemo?.convLayers || [];

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 mb-1.5">
            <BrainCircuit className="w-3.5 h-3.5" /> Giai đoạn 3: Phép Tích Chập (Convolution) &amp; ReLU
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">
            Mô Phỏng Trượt Kernel 3×3 &amp; Áp Dụng Lên Ảnh Thật
          </h3>
        </div>

        {/* Scan and ReLU Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsAutoScanning(!isAutoScanning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isAutoScanning
                ? "bg-green-100 border-green-300 text-green-800 shadow-sm"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            {isAutoScanning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-green-600" />}
            <span>{isAutoScanning ? "Tự động trượt: Đang quét" : "Tạm dừng quét"}</span>
          </button>

          <button
            type="button"
            onClick={() => setEnableRelu(!enableRelu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              enableRelu
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${enableRelu ? "bg-white" : "bg-gray-400"}`} />
            <span>Hàm ReLU: {enableRelu ? "BẬT (max(0, x))" : "TẮT"}</span>
          </button>
        </div>
      </div>

      {/* Kernel Preset Switcher */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Chọn bộ lọc tích chập (Convolution Kernel 3×3):
          </p>
          <span className="text-[11px] text-gray-500 italic font-medium hidden sm:inline">
            {kernel.desc}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(KERNEL_PRESETS).map(([key, item]) => {
            const isSelected = selectedKernelKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKernelKey(key)}
                className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20 scale-[1.01]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                }`}
              >
                <div className="truncate">{item.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dynamic Convolution Workspace */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl shadow-lg space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
            <h4 className="text-sm font-bold text-green-300 uppercase tracking-wider">
              Mô phỏng trượt tự động (Kernel Sliding Animation)
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Tốc độ:</span>
            <select
              value={scanSpeed}
              onChange={(e) => setScanSpeed(Number(e.target.value))}
              className="bg-slate-800 text-slate-200 rounded-lg px-2 py-0.5 border border-slate-700 text-xs font-bold outline-none"
            >
              <option value={1800}>Chậm (1.8s)</option>
              <option value={1200}>Vừa (1.2s)</option>
              <option value={600}>Nhanh (0.6s)</option>
            </select>
          </div>
        </div>

        {/* 3 Columns: Input 5x5 -> Kernel 3x3 -> Output Feature Map 3x3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Input Matrix 5x5 */}
          <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono font-bold">
              <span>Input Tensor (5×5)</span>
              <span className="text-emerald-400">Vùng quét [{outR}, {outC}]</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800">
              {SAMPLE_INPUT_5X5.map((row, r) =>
                row.map((val, c) => {
                  const isInKernel = r >= outR && r < outR + 3 && c >= outC && c < outC + 3;
                  return (
                    <div
                      key={`in-${r}-${c}`}
                      className={`aspect-square rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                        isInKernel
                          ? "bg-green-500/30 text-green-300 border-2 border-green-400 shadow-[0_0_12px_rgba(74,222,128,0.5)] scale-105 z-10"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
                      }`}
                    >
                      {val}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Kernel Weights 3x3 */}
          <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono font-bold">
              <span>Kernel 3×3 (Weights)</span>
              <span className="text-yellow-400">Bộ trọng số lọc</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800">
              {kernel.matrix.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`k-${r}-${c}`}
                    className="aspect-square rounded-lg bg-yellow-950/40 text-yellow-300 border border-yellow-700/60 flex items-center justify-center font-mono text-xs font-bold shadow-inner"
                  >
                    {val > 0 ? `+${val}` : val}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Output Feature Map 3x3 */}
          <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono font-bold">
              <span>Feature Map (3×3)</span>
              <span className="text-cyan-400">Kết quả đặc trưng</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800">
              {outputFeatureMap.map((row, r) =>
                row.map((val, c) => {
                  const isSelected = outR === r && outC === c;
                  return (
                    <button
                      key={`out-${r}-${c}`}
                      type="button"
                      onClick={() => {
                        setIsAutoScanning(false);
                        setSelectedOutputCell({ r, c });
                      }}
                      className={`aspect-square rounded-lg flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "bg-cyan-400 text-slate-950 border-2 border-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.7)] scale-110 z-10"
                          : "bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-400"
                      }`}
                    >
                      {val}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Real-time Math calculation breakdown */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Phép tính tại điểm Feature Map [{outR}, {outC}]:
            </span>
            <span className="text-green-400 font-bold">
              Giá trị = {currentCalc.finalVal}
            </span>
          </div>

          <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2.5 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
            <span>∑ (Input × Kernel) = </span>
            {currentCalc.mults.map((m, idx) => (
              <span key={idx} className={m.prod !== 0 ? "text-yellow-300 font-bold" : "text-slate-500"}>
                ({m.inVal}×{m.kVal}){idx < currentCalc.mults.length - 1 ? " + " : ""}
              </span>
            ))}
            <span className="text-white font-bold"> = {currentCalc.rawSum}</span>
            {enableRelu && (
              <span className="text-green-400 font-bold">
                {" "}
                → ReLU(max(0, {currentCalc.rawSum})) = {currentCalc.finalVal}
              </span>
            )}
          </div>
        </div>

        {/* Real-time Feature Map Preview generated directly on user's actual image */}
        {previewUrl && (
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Bản đồ đặc trưng Feature Map tạo trực tiếp từ ảnh của bạn:
                </h5>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                Bộ lọc: {kernel.name}
              </span>
            </div>

            <div className="flex items-center justify-center gap-6 p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold mb-1">Ảnh gốc</p>
                <img
                  src={previewUrl}
                  alt="Ảnh gốc"
                  className="w-28 h-28 object-cover rounded-xl border border-slate-700 shadow"
                />
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-400 text-green-300 flex items-center justify-center animate-pulse">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono text-green-400 mt-1 font-bold">Conv2D</span>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-emerald-400 font-bold mb-1">Feature Map (Canvas)</p>
                <canvas
                  ref={featureCanvasRef}
                  className="w-28 h-28 object-cover rounded-xl border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] bg-black"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model's Actual Conv2D Architecture Inspector */}
      {convLayers.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              Các tầng tích chập Conv2D thực tế trong mô hình ({convLayers.length} layers)
            </h4>
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
              Trích xuất từ FastAPI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {convLayers.map((layer, idx) => (
              <div
                key={layer.name || idx}
                className="bg-gray-50 border border-gray-200/70 p-2.5 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="truncate font-mono font-bold text-gray-800">
                  {idx + 1}. {layer.name}
                </div>
                <div className="font-mono text-[11px] text-green-700 bg-green-100/60 px-2 py-0.5 rounded-md font-semibold">
                  {layer.shape}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedagogical Insight */}
      <div className="bg-green-50/70 border border-green-200/80 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 text-green-700 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm text-green-950 space-y-1">
          <p className="font-bold text-green-900">
            Bản chất của phép Tích chập &amp; Hàm kích hoạt ReLU
          </p>
          <p className="text-green-800/90 leading-relaxed text-xs">
            Khi Kernel quét qua ảnh, các phép nhân vô hướng sẽ trích xuất ra các cạnh đứng, cạnh ngang và hoa văn. Hàm <strong>ReLU</strong> biến mọi giá trị âm thành 0 để giữ lại các phản hồi đặc trưng tích cực.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CnnStage3Convolution;
