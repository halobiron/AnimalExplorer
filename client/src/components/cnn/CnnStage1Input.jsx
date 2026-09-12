import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Layers, Eye, Info, Sparkles, Grid3X3, Play, Pause, Scan, Database, CheckCircle2, ShieldCheck } from "lucide-react";
import CnnStageShell from "./CnnStageShell";

const STAGE1_CODE_DATA = {
  concept: "Dữ liệu ảnh thô từ thư mục class_name/image.jpg được đọc thành mảng Tensor 3 chiều (Height, Width, 3 Color Channels RGB), chia tập Train/Val và nạp vào mô hình.",
  frameworks: {
    numpy: {
      file: "model/cnn_from_scratch.py",
      code: `# Đọc ảnh trực tiếp từ file và chuyển thành Tensor ma trận số
from PIL import Image
import numpy as np

def load_and_preprocess_image(image_path):
    # 1. Đọc và đảm bảo định dạng 3 kênh màu RGB
    img = Image.open(image_path).convert("RGB")
    # 2. Resize kích thước chuẩn 224x224
    img = img.resize((224, 224))
    # 3. Chuyển sang mảng NumPy 3 chiều (224, 224, 3)
    arr = np.array(img, dtype=np.float32)
    # 4. Đổi thứ tự kênh màu sang NCHW: (1, 3, 224, 224)
    tensor = np.transpose(arr, (2, 0, 1))[np.newaxis, ...]
    return tensor`,
    },
    keras: {
      file: "model/train_keras.ipynb",
      code: `# Nạp tự động toàn bộ thư mục và phân chia Train / Validation
import tensorflow as tf

DATASET_DIR = "model/dataset_raw/animals/animals"
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)`,
    },
    pytorch: {
      file: "model/train_pytorch.ipynb",
      code: `# Sử dụng torchvision ImageFolder và DataLoader đa luồng
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(), # Chuyển ảnh PIL sang Tensor [C, H, W]
])

full_dataset = datasets.ImageFolder("model/dataset_raw/animals/animals", transform=transform)
train_size = int(0.8 * len(full_dataset))
val_size = len(full_dataset) - train_size

train_set, val_set = random_split(
    full_dataset, [train_size, val_size],
    generator=torch.Generator().manual_seed(42)
)

train_loader = DataLoader(train_set, batch_size=32, shuffle=True, num_workers=2)`,
    },
  },
};

const CnnStage1Input = ({ previewUrl }) => {
  const [activeChannel, setActiveChannel] = useState("all");
  const [hoveredPixel, setHoveredPixel] = useState({ x: 2, y: 2, r: 180, g: 120, b: 75 });
  const [isScanning, setIsScanning] = useState(true);
  const [scanPos, setScanPos] = useState(0);

  const canvasRef = useRef(null);
  const channelCanvasRef = useRef(null);
  const [pixelMatrix, setPixelMatrix] = useState([]);

  useEffect(() => {
    if (!isScanning) return undefined;
    const interval = setInterval(() => {
      setScanPos((prev) => (prev >= 100 ? 0 : prev + 1.5));
    }, 40);
    return () => clearInterval(interval);
  }, [isScanning]);

  useEffect(() => {
    if (!previewUrl) {
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
              data[i + 1] = 0;
              data[i + 2] = 0;
            } else if (activeChannel === "g") {
              data[i] = 0;
              data[i + 2] = 0;
            } else if (activeChannel === "b") {
              data[i] = 0;
              data[i + 1] = 0;
            }
          }
          fullCtx.putImageData(fullData, 0, 0);
        }
      }
    };
  }, [previewUrl, activeChannel]);

  // Simulation View (Interactive canvas + channel filters + pixel matrix)
  const simView = (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { id: "all", label: "Gộp RGB (Full)" },
            { id: "r", label: "Kênh Đỏ (Red)" },
            { id: "g", label: "Kênh Lục (Green)" },
            { id: "b", label: "Kênh Lam (Blue)" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveChannel(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeChannel === c.id
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsScanning(!isScanning)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold transition-all ${
            isScanning
              ? "bg-emerald-100 border-emerald-300 text-emerald-800"
              : "bg-gray-100 border-gray-200 text-gray-600"
          }`}
        >
          {isScanning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
          <span>{isScanning ? "Laser quét: Đang chạy" : "Tạm dừng"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-56 h-56 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-md">
            {previewUrl ? (
              <canvas ref={channelCanvasRef} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900 text-xs p-4 text-center">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <span>Nạp ảnh từ bảng điều khiển bên trái để phân tích</span>
              </div>
            )}
            {isScanning && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] transition-all duration-75 pointer-events-none"
                style={{ top: `${scanPos}%` }}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400 uppercase flex items-center gap-1">
              <Grid3X3 className="w-3.5 h-3.5" />
              Ma trận điểm ảnh 6×6 vùng trung tâm
            </span>
            <span className="text-[11px] text-slate-400 font-mono">0 - 255 uint8</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
            {pixelMatrix.map((row, y) =>
              row.map((pixel, x) => {
                const isHovered = hoveredPixel?.x === x && hoveredPixel?.y === y;
                let bgStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
                if (activeChannel === "r") bgStyle = `rgb(${pixel.r}, 0, 0)`;
                if (activeChannel === "g") bgStyle = `rgb(0, ${pixel.g}, 0)`;
                if (activeChannel === "b") bgStyle = `rgb(0, 0, ${pixel.b})`;

                return (
                  <button
                    key={`${y}-${x}`}
                    type="button"
                    onMouseEnter={() => setHoveredPixel({ x, y, ...pixel })}
                    className={`h-9 rounded-lg transition-all relative flex items-center justify-center text-[10px] font-mono font-bold ${
                      isHovered
                        ? "ring-2 ring-emerald-400 scale-110 z-10 shadow-lg"
                        : "hover:opacity-90 opacity-80"
                    }`}
                    style={{ backgroundColor: bgStyle }}
                    title={`(${x}, ${y}) - R:${pixel.r} G:${pixel.g} B:${pixel.b}`}
                  >
                    <span className="bg-black/60 px-1 rounded text-white text-[9px]">
                      {activeChannel === "r"
                        ? pixel.r
                        : activeChannel === "g"
                        ? pixel.g
                        : activeChannel === "b"
                        ? pixel.b
                        : pixel.r}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {hoveredPixel && (
            <div className="flex items-center justify-between text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/40"
                  style={{
                    backgroundColor: `rgb(${hoveredPixel.r}, ${hoveredPixel.g}, ${hoveredPixel.b})`,
                  }}
                />
                <span className="font-mono text-slate-300 font-bold">
                  Pixel [{hoveredPixel.y}, {hoveredPixel.x}]:
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800">
                  R: {hoveredPixel.r}
                </span>
                <span className="bg-green-950 text-green-300 px-2 py-0.5 rounded border border-green-800">
                  G: {hoveredPixel.g}
                </span>
                <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                  B: {hoveredPixel.b}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Theory View: Deep, structured, and pedagogical explanations
  const theoryView = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 3D Tensor Representation */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
              <Layers className="w-4 h-4" />
            </span>
            <p className="text-xs font-black text-emerald-950 uppercase">
              1. Biểu Diễn Ảnh Số Dạng Tensor (H × W × C)
            </p>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Ảnh kỹ thuật số được máy tính lưu trữ dưới dạng <strong>Tensor ma trận 3 chiều</strong>: Chiều cao (Height), Chiều rộng (Width) và Kênh màu (Channels: Red, Green, Blue).
          </p>
          <div className="bg-white/90 border border-emerald-300/80 rounded-xl p-2.5 text-center font-mono text-xs font-bold text-emerald-950 shadow-sm">
            Tensor ma trận (224 × 224 × 3) ⇒ 150,528 điểm số uint8 [0, 255]
          </div>
          <ul className="space-y-1 text-[11px] text-emerald-800 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Mỗi điểm ảnh (Pixel):</strong> Là tổ hợp 3 giá trị màu [R, G, B] thể hiện cường độ ánh sáng từ 0 (tối nhất) đến 255 (sáng nhất).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Định dạng nạp:</strong> Keras sử dụng chuẩn <code>(Batch, H, W, C)</code> trong khi PyTorch sử dụng chuẩn <code>(Batch, C, H, W)</code>.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Dataset Partitioning & Generalization */}
        <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-600 text-white shadow-sm">
              <Database className="w-4 h-4" />
            </span>
            <p className="text-xs font-black text-teal-950 uppercase">
              2. Quản Lý &amp; Phân Chia Tập Dữ Liệu
            </p>
          </div>
          <p className="text-xs text-teal-900 leading-relaxed">
            Tập dữ liệu 47 loài động vật được cấu trúc phân cấp theo danh mục thư mục <code>loài/ảnh.jpg</code> để mô hình học cách phân biệt đặc trưng sinh học:
          </p>
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
            <div className="bg-white/90 border border-teal-300 rounded-xl p-2 text-teal-950 shadow-sm">
              <span className="text-teal-700 block text-[10px] uppercase">Train Set (80%)</span>
              Tối ưu trọng số W, b
            </div>
            <div className="bg-white/90 border border-teal-300 rounded-xl p-2 text-teal-950 shadow-sm">
              <span className="text-teal-700 block text-[10px] uppercase">Val Set (20%)</span>
              Đánh giá chống Overfitting
            </div>
          </div>
          <p className="text-[11px] text-teal-800 leading-relaxed">
            • <strong>Ý nghĩa tổng quát hóa:</strong> Việc kiểm định độc lập trên tập Validation đảm bảo AI nhận diện đúng ngay cả khi gặp ảnh động vật chụp ở bối cảnh và góc nhìn mới lạ.
          </p>
        </div>
      </div>

      {/* Standard Resolution Card */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Tại Sao Chọn Kích Thước Chuẩn 224 × 224 × 3?
          </p>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            ImageNet Standard
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">1. Cân bằng Thông tin &amp; Tốc độ</strong>
            <p className="text-[11px] text-slate-400">Đủ lớn để giữ các chi tiết vi mô (mắt, mỏ, vảy), đủ nhỏ để nạp vừa bộ nhớ GPU.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-cyan-400 block">2. Giảm lũy thừa qua 5 tầng Pool</strong>
            <p className="text-[11px] text-slate-400">224 → 112 → 56 → 28 → 14 → 7 (chia hết cho 2 năm lần liên tiếp không bị lẻ kích thước).</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-amber-400 block">3. Kế thừa Transfer Learning</strong>
            <p className="text-[11px] text-slate-400">Tương thích hoàn hảo với các mô hình nạp sẵn trọng số (Pretrained Weights) trong thị giác máy tính.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CnnStageShell
      stageId={1}
      stageTitle="1. Ảnh Đầu Vào &amp; Dataset (Input Tensor)"
      stageDesc="Biểu diễn số học 3 kênh màu RGB và quy trình nạp tập dữ liệu ảnh"
      badgeTag="224×224×3 RGB"
      icon={ImageIcon}
      simView={simView}
      theoryView={theoryView}
      codeData={STAGE1_CODE_DATA[1] || STAGE1_CODE_DATA}
    />
  );
};

export default CnnStage1Input;
