import { useState, useEffect, useRef } from "react";
import { BrainCircuit, Sparkles, Check, Play, Pause, RotateCcw, Info, Sliders, ChevronRight, Eye, GitFork, ShieldCheck, Zap } from "lucide-react";
import CnnStageShell from "./CnnStageShell";
import CnnImprovedArchitectures from "./CnnImprovedArchitectures";

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

  // Theory & Improved Architectures View
  const theoryView = (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
        <p className="text-xs font-black text-emerald-900 uppercase flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-emerald-600" />
          Cơ Chế Tích Chập (Conv2D) &amp; Hàm Kích Hoạt ReLU
        </p>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Phép nhân chập <code>Conv2D</code> sử dụng bộ lọc Kernel 3×3 trượt trên ảnh để trích xuất các đặc trưng cơ bản (góc, cạnh, hoa văn). Hàm phi tuyến <code>ReLU f(x) = max(0, x)</code> loại bỏ toàn bộ các giá trị âm, giữ lại các kích hoạt tích cực.
        </p>
      </div>

      {/* Embedded Improved Architectures (VGG, ResNet, Inception) */}
      <CnnImprovedArchitectures />
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
