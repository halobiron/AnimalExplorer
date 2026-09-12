import { useState, useEffect, useRef } from "react";
import { BrainCircuit, Sparkles, Check, Play, Pause, RotateCcw, Info, Sliders, ChevronRight, Eye, GitFork, ShieldCheck, Zap } from "lucide-react";
import CnnStageShell from "./CnnStageShell";

const STAGE3_CODE_DATA = {
  concept: "Tầng Conv2D trích xuất đặc trưng biên nét bằng phép nhân chập einsum. Hàm kích hoạt phi tuyến ReLU f(x) = max(0, x) loại bỏ các giá trị âm để mạng học được các quan hệ phi tuyến phức tạp.",
  frameworks: {
    numpy: {
      file: "model/cnn_from_scratch.py",
      code: `class Conv2D:
    def __init__(self, in_channels, filters, kernel_size=3):
        self.weights = np.random.normal(
            0, np.sqrt(2 / (in_channels * kernel_size**2)),
            (filters, in_channels, kernel_size, kernel_size)
        ).astype(np.float32)
        self.bias = np.zeros(filters, dtype=np.float32)

    def forward(self, x):
        self.x = x
        batch, _, h, w = x.shape
        out_h, out_w = h - self.kernel_size + 1, w - self.kernel_size + 1
        out = np.zeros((batch, len(self.weights), out_h, out_w), dtype=np.float32)
        for r in range(out_h):
            for c in range(out_w):
                patch = x[:, :, r:r+self.kernel_size, c:c+self.kernel_size]
                out[:, :, r, c] = np.einsum("bchw,fchw->bf", patch, self.weights) + self.bias
        return out

class ReLU:
    def forward(self, x):
        self.mask = x > 0
        return x * self.mask # f(x) = max(0, x)`,
    },
    keras: {
      file: "model/train_keras.ipynb",
      code: `from tensorflow.keras import layers

# Tầng tích chập 32 bộ lọc 3x3 với hàm kích hoạt ReLU
layers.Conv2D(
    filters=32,
    kernel_size=(3, 3),
    strides=(1, 1),
    padding="same",
    activation="relu",
    name="conv1"
)`,
    },
    pytorch: {
      file: "model/train_pytorch.ipynb",
      code: `import torch.nn as nn

# Khối tích chập trong PyTorch Module
class ConvBlock(nn.Module):
    def __init__(self, in_c, out_c):
        super().__init__()
        self.conv = nn.Conv2d(in_c, out_c, kernel_size=3, padding=1)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.relu(self.conv(x))`,
    },
  },
};

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
    desc: "Nhận diện sống lưng, mắt ngang, sọc vằn ngang",
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
  const [scanSpeed, setScanSpeed] = useState(1200);

  const kernel = KERNEL_PRESETS[selectedKernelKey];
  const { r: outR, c: outC } = selectedOutputCell;

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
    const rawVal = sum;
    const reluVal = enableRelu ? Math.max(0, rawVal) : rawVal;
    return { rawVal, reluVal, mults };
  };

  const currentCellCalc = computeCell(outR, outC);

  // Simulation View
  const simView = (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {Object.entries(KERNEL_PRESETS).map(([key, k]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKernelKey(key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedKernelKey === key
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {k.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnableRelu(!enableRelu)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
              enableRelu
                ? "bg-green-100 border-green-300 text-green-800"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            ReLU max(0, x): {enableRelu ? "Bật" : "Tắt"}
          </button>

          <button
            type="button"
            onClick={() => setIsAutoScanning(!isAutoScanning)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
              isAutoScanning
                ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            {isAutoScanning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isAutoScanning ? "Quét Kernel" : "Dừng"}</span>
          </button>
        </div>
      </div>

      {/* Interactive 3-Grid Visualization (Input 5x5 * Kernel 3x3 = Feature Map 3x3) */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Input 5x5 */}
          <div className="lg:col-span-4 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-center">
            <span className="text-[11px] uppercase font-bold text-slate-400">1. Ma trận đầu vào 5×5</span>
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900 rounded-lg">
              {SAMPLE_INPUT_5X5.map((row, r) =>
                row.map((val, c) => {
                  const inPatch = r >= outR && r < outR + 3 && c >= outC && c < outC + 3;
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`h-7 rounded flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        inPatch
                          ? "bg-emerald-500 text-slate-950 scale-105 shadow-md shadow-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {val}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Operator * Kernel 3x3 */}
          <div className="lg:col-span-4 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-center">
            <span className="text-[11px] uppercase font-bold text-amber-400">2. Kernel 3×3 ({kernel.name})</span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg">
              {kernel.matrix.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`${r}-${c}`}
                    className="h-7 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 flex items-center justify-center font-mono text-xs font-bold"
                  >
                    {val}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Output Feature Map 3x3 */}
          <div className="lg:col-span-4 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-center">
            <span className="text-[11px] uppercase font-bold text-cyan-400">3. Feature Map 3×3 &amp; ReLU</span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg">
              {[0, 1, 2].map((r) =>
                [0, 1, 2].map((c) => {
                  const isCurrent = r === outR && c === outC;
                  const cellRes = computeCell(r, c);
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => {
                        setIsAutoScanning(false);
                        setSelectedOutputCell({ r, c });
                      }}
                      className={`h-7 rounded flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-cyan-400 text-slate-950 scale-110 shadow-lg shadow-cyan-400/40 ring-2 ring-cyan-300"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {cellRes.reluVal}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Calculation Step Indicator */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <span>
            Phép tính vị trí [{outR}, {outC}]: Tích chập = <strong className="text-amber-300">{currentCellCalc.rawVal}</strong>
          </span>
          <span className="text-cyan-300 font-bold">
            ReLU({currentCellCalc.rawVal}) = {currentCellCalc.reluVal}
          </span>
        </div>
      </div>
    </div>
  );

  // Theory View: Clear, structured, and pedagogical focus on Conv2D & ReLU
  const theoryView = (
    <div className="space-y-4">
      {/* 2 Main Pillar Cards: Conv2D Mechanism & ReLU Activation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Conv2D Dot Product & Local Receptive Field */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
              <BrainCircuit className="w-4 h-4" />
            </span>
            <p className="text-xs font-black text-emerald-950 uppercase">
              1. Cơ Chế Phép Tích Chập (Conv2D)
            </p>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Bộ lọc <strong>Kernel 3×3</strong> (ma trận trọng số <em>W</em>) trượt qua từng vùng cục bộ (Local Receptive Field) của ảnh. Tại mỗi vị trí, thực hiện phép <strong>nhân từng phần tử và tính tổng (Dot Product)</strong> cộng với hệ số điều chỉnh Bias:
          </p>
          <div className="bg-white/90 border border-emerald-300/80 rounded-xl p-2.5 text-center font-mono text-xs font-bold text-emerald-950 shadow-sm">
            y[i, j] = ∑<sub>m,n</sub> (x[i+m, j+n] × K[m, n]) + bias
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            • <strong>Tác dụng:</strong> Tự động học trích xuất các đặc trưng không gian (đường biên ngang/dọc, góc cạnh, hoa văn, vảy và lông động vật) thay vì phải rút trích thủ công.
          </p>
        </div>

        {/* Card 2: Non-linear ReLU Activation */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-600 text-white shadow-sm">
              <Zap className="w-4 h-4" />
            </span>
            <p className="text-xs font-black text-amber-950 uppercase">
              2. Hàm Kích Hoạt Phi Tuyến ReLU
            </p>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Hàm kích hoạt <strong>ReLU (Rectified Linear Unit)</strong> áp dụng quy tắc đơn giản nhưng có ý nghĩa sống còn đối với mạng nơ-ron:
          </p>
          <div className="bg-white/90 border border-amber-300/80 rounded-xl p-2.5 text-center font-mono text-xs font-bold text-amber-950 shadow-sm">
            f(x) = max(0, x) = &#123; x nếu x &gt; 0, ngược lại 0 &#125;
          </div>
          <ul className="space-y-1 text-[11px] text-amber-900 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Phi tuyến tính:</strong> Cho phép mạng học các quan hệ phức tạp. Nếu không có ReLU, dù chồng 100 tầng Conv vẫn chỉ tương đương 1 phép biến đổi tuyến tính đơn giản.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Lọc âm &amp; Tính thưa thớt (Sparsity):</strong> Triệt tiêu nhiễu âm, chỉ giữ lại các nơ-ron phản hồi tích cực.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Chống triệt tiêu Gradient:</strong> Đạo hàm bằng 1 ở miền dương giúp tốc độ huấn luyện nhanh gấp 6 lần Sigmoid/Tanh.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Dimension Formula Calculation Card */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Công Thức Kích Thước Bản Đồ Đặc Trưng (Output Feature Map Size)
          </p>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            Spatial Dimensions
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Công thức tổng quát</span>
            <div className="font-mono text-cyan-300 font-bold text-xs">
              O = ⌊(W - K + 2P) / S⌋ + 1
            </div>
            <p className="text-[10px] text-slate-500">W: Input, K: Kernel, P: Pad, S: Stride</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Ví dụ mô phỏng bên trên</span>
            <div className="font-mono text-emerald-300 font-bold text-xs">
              (5 - 3 + 0) / 1 + 1 = 3 &times; 3
            </div>
            <p className="text-[10px] text-slate-500">Đầu vào 5&times;5 &rarr; Feature Map 3&times;3</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Trong mô hình thực tế (padding='same')</span>
            <div className="font-mono text-amber-300 font-bold text-xs">
              224 &times; 224 &rarr; 224 &times; 224
            </div>
            <p className="text-[10px] text-slate-500">Padding=1 giúp bảo toàn kích thước</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CnnStageShell
      stageId={3}
      stageTitle="3. Tích Chập &amp; Kích Hoạt Phi Tuyến (Conv2D &amp; ReLU)"
      stageDesc="Quét bộ lọc Kernel 3×3 trích xuất đặc trưng hình thái &amp; lọc âm bằng ReLU"
      badgeTag="Kernel 3×3 & ReLU"
      icon={BrainCircuit}
      simView={simView}
      theoryView={theoryView}
      codeData={STAGE3_CODE_DATA}
    />
  );
};

export default CnnStage3Convolution;
