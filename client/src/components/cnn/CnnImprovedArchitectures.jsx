import { useState } from "react";
import { Layers3, GitFork, Boxes, Sparkles, CheckCircle2, ArrowRight, Info, ShieldCheck, Zap, Cpu, Gauge } from "lucide-react";

const ARCHITECTURES = [
  {
    id: "vgg",
    name: "VGG-16 / VGG-19",
    fullName: "Visual Geometry Group (Oxford, 2014)",
    tagline: "Triết lý xếp chồng các khối Conv 3×3 nhỏ liên tiếp",
    color: "from-blue-600 to-indigo-700",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Layers3,
    coreIdea: "Thay vì dùng các bộ lọc lớn (như 7×7 hay 5×5 trong AlexNet), VGG xếp chồng 2–3 tầng Conv 3×3 liên tiếp với bước trượt 1.",
    mathAdvantage: "2 tầng 3×3 có trường nhìn hiệu dụng (Receptive Field) tương đương 1 tầng 5×5, nhưng số tham số giảm: 2×(3×3) = 18 so với 1×(5×5) = 25 (tiết kiệm ~28%), đồng thời có 2 lần kích hoạt ReLU tăng tính phi tuyến.",
    pros: [
      "Kiến trúc đồng nhất, đơn giản và cực kỳ dễ hiểu",
      "Trích xuất đặc trưng sâu sắc, phân cấp rõ rệt từ biên nét đến hình thái phức tạp",
      "Rất phổ biến làm Feature Extractor cho Transfer Learning",
    ],
    cons: [
      "Số lượng tham số rất lớn (~138 triệu tham số trong VGG-16), tiêu tốn nhiều bộ nhớ RAM/VRAM",
      "Tầng Fully Connected ở cuối chiếm tới >80% tham số",
    ],
    diagram: [
      { name: "Input", size: "224×224×3", color: "bg-slate-700" },
      { name: "Conv 3×3 (×2)", size: "224×224×64", color: "bg-blue-600" },
      { name: "MaxPool", size: "112×112×64", color: "bg-cyan-600" },
      { name: "Conv 3×3 (×2)", size: "112×112×128", color: "bg-blue-600" },
      { name: "MaxPool", size: "56×56×128", color: "bg-cyan-600" },
      { name: "Conv 3×3 (×3)", size: "56×56×256", color: "bg-indigo-600" },
      { name: "MaxPool", size: "28×28×256", color: "bg-cyan-600" },
      { name: "Conv 3×3 (×3)", size: "28×28×512", color: "bg-indigo-700" },
      { name: "FC + Softmax", size: "1×1×47", color: "bg-emerald-600" },
    ],
    codeSnippet: `# Kiến trúc khối VGG điển hình
model = Sequential([
    # Block 1
    Conv2D(64, (3, 3), padding='same', activation='relu'),
    Conv2D(64, (3, 3), padding='same', activation='relu'),
    MaxPooling2D((2, 2)),
    # Block 2
    Conv2D(128, (3, 3), padding='same', activation='relu'),
    Conv2D(128, (3, 3), padding='same', activation='relu'),
    MaxPooling2D((2, 2)),
    # Global Pooling + Dense Softmax
    GlobalAveragePooling2D(),
    Dense(47, activation='softmax')
])`,
  },
  {
    id: "resnet",
    name: "ResNet (Residual Networks)",
    fullName: "Deep Residual Learning (He et al., Microsoft, 2015)",
    tagline: "Đột phá Kết nối Tắt (Skip Connection / Shortcut Connection)",
    color: "from-emerald-600 to-teal-700",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: GitFork,
    coreIdea: "Thêm đường tắt (Residual Shortcut) cho phép tín hiệu đầu vào x cộng trực tiếp vào đầu ra của khối: H(x) = F(x) + x.",
    mathAdvantage: "Giải quyết triệt để vấn đề Biến mất Gradient (Vanishing Gradient). Khi đạo hàm lan truyền ngược: dH/dx = dF/dx + 1. Nhờ số hạng hằng số +1, gradient luôn có đường truyền thông suốt về các tầng đầu tiên, cho phép huấn luyện mạng sâu hàng trăm tầng (ResNet-50, ResNet-101, ResNet-152).",
    pros: [
      "Cho phép huấn luyện các mạng cực kỳ sâu mà không bị suy giảm độ chính xác (Degradation problem)",
      "Tốc độ hội tụ nhanh hơn, độ chính xác phân loại vượt bậc",
      "Hiện là nền tảng cốt lõi trong hầu hết kiến trúc Vision hiện đại (ResNet, ConvNeXt)",
    ],
    cons: [
      "Khối Residual phức tạp hơn trong việc đồng bộ kích thước tensor khi cộng H(x) = F(x) + x",
    ],
    diagram: [
      { name: "Input x", size: "224×224×64", color: "bg-slate-700" },
      { name: "Conv 3×3 + BN + ReLU", size: "F(x)", color: "bg-emerald-600" },
      { name: "Conv 3×3 + BN", size: "F(x)", color: "bg-teal-600" },
      { name: "Skip Connection (+ x)", size: "F(x) + x", color: "bg-amber-500 font-bold" },
      { name: "ReLU Activation", size: "Output", color: "bg-emerald-700" },
    ],
    codeSnippet: `# Khối Residual Block trong PyTorch / Keras
class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x):
        identity = x # Nhánh tắt lưu tensor gốc
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = out + identity # Phép cộng Skip Connection: F(x) + x
        return F.relu(out)`,
  },
  {
    id: "inception",
    name: "Inception / GoogLeNet",
    fullName: "Going Deeper with Convolutions (Szegedy et al., Google, 2014)",
    tagline: "Kiến trúc đa nhánh xử lý đa tỉ lệ (Multi-Scale Parallel Processing)",
    color: "from-amber-600 to-orange-700",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Boxes,
    coreIdea: "Thay vì chọn 1 kích thước Kernel cố định (chỉ 3×3 hoặc 5×5), Inception chạy song song các Kernel 1×1, 3×3, 5×5 và MaxPool 3×3 trong cùng 1 khối rồi ghép (concatenate) kết quả lại.",
    mathAdvantage: "Dùng Conv 1×1 để giảm chiều sâu kênh màu (Bottleneck Layer) trước khi qua Conv 3×3 hay 5×5, giúp giảm đáng kể chi phí tính toán FLOPs trong khi vẫn chụp được đặc trưng ở nhiều thang đo tỉ lệ khác nhau.",
    pros: [
      "Nắm bắt hoàn hảo các chi tiết ở cả kích thước cực nhỏ (vân lông, mắt) lẫn kích thước lớn (dáng thân, bối cảnh)",
      "Tối ưu số lượng tham số (~7 triệu tham số trong GoogLeNet, ít hơn 20 lần so với VGG-16)",
    ],
    cons: [
      "Cấu trúc chia nhánh phức tạp, khó tối ưu hóa bộ nhớ phần cứng (memory access overhead)",
    ],
    diagram: [
      { name: "Nhánh 1: Conv 1×1", size: "Đặc trưng điểm", color: "bg-amber-600" },
      { name: "Nhánh 2: Conv 1×1 → 3×3", size: "Đặc trưng vừa", color: "bg-orange-600" },
      { name: "Nhánh 3: Conv 1×1 → 5×5", size: "Đặc trưng lớn", color: "bg-rose-600" },
      { name: "Nhánh 4: MaxPool → 1×1", size: "Đặc trưng nổi bật", color: "bg-yellow-600" },
      { name: "Concatenate Filter", size: "Hợp nhất đa tỉ lệ", color: "bg-emerald-600 font-bold" },
    ],
    codeSnippet: `# Khối Inception Module đa nhánh
def inception_module(x, f1, f3_in, f3, f5_in, f5, pool_proj):
    # Branch 1: 1x1 Conv
    b1 = Conv2D(f1, (1, 1), padding='same', activation='relu')(x)
    # Branch 2: 1x1 Conv -> 3x3 Conv
    b2 = Conv2D(f3_in, (1, 1), padding='same', activation='relu')(x)
    b2 = Conv2D(f3, (3, 3), padding='same', activation='relu')(b2)
    # Branch 3: 1x1 Conv -> 5x5 Conv
    b3 = Conv2D(f5_in, (1, 1), padding='same', activation='relu')(x)
    b3 = Conv2D(f5, (5, 5), padding='same', activation='relu')(b3)
    # Branch 4: 3x3 MaxPool -> 1x1 Conv
    b4 = MaxPooling2D((3, 3), strides=(1, 1), padding='same')(x)
    b4 = Conv2D(pool_proj, (1, 1), padding='same', activation='relu')(b4)
    # Nối tất cả các nhánh theo chiều kênh màu
    return concatenate([b1, b2, b3, b4], axis=-1)`,
  },
];

export default function CnnImprovedArchitectures() {
  const [selectedArchId, setSelectedArchId] = useState("resnet");
  const current = ARCHITECTURES.find((a) => a.id === selectedArchId) || ARCHITECTURES[1];
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Kiến Trúc Nâng Cao Phát Triển Từ CNN
          </div>
          <h3 className="text-xl font-extrabold text-gray-900">
            Khám Phá Tiến Hóa Kiến Trúc: VGG · ResNet · Inception
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            So sánh cơ chế giải quyết các giới hạn của CNN truyền thống (Vanishing Gradient, tham số bùng nổ, đặc trưng đa tỉ lệ).
          </p>
        </div>

        <span className="self-start sm:self-auto text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          Đối chiếu học thuật &amp; thực nghiệm
        </span>
      </div>

      {/* Architecture Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ARCHITECTURES.map((arch) => {
          const isSelected = arch.id === selectedArchId;
          const ArchIcon = arch.icon;
          return (
            <button
              key={arch.id}
              type="button"
              onClick={() => setSelectedArchId(arch.id)}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? "bg-white border-emerald-500 shadow-lg ring-2 ring-emerald-400/30 scale-[1.02]"
                  : "bg-white/80 border-gray-200 hover:border-gray-300 hover:bg-white text-gray-600"
              }`}
            >
              <div className="w-full flex items-center justify-between mb-2">
                <span
                  className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${arch.color} shadow-sm`}
                >
                  <ArchIcon className="w-4 h-4" />
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${arch.badgeColor}`}>
                  {arch.id.toUpperCase()}
                </span>
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">{arch.name}</h4>
              <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{arch.tagline}</p>

              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Architecture Explorer Panel */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 space-y-6 shadow-xl animate-fade-in">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className={`p-3 rounded-2xl text-white bg-gradient-to-br ${current.color} shadow-md`}>
              <Icon className="w-6 h-6" />
            </span>
            <div>
              <h4 className="text-lg font-extrabold text-white flex items-center gap-2">
                {current.name}
                <span className="text-xs font-medium text-slate-400 hidden sm:inline">({current.fullName})</span>
              </h4>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">{current.tagline}</p>
            </div>
          </div>
        </div>

        {/* Core Mechanism & Math Breakthrough */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Ý Tưởng Thiết Kế Cốt Lõi
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{current.coreIdea}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Ưu Thế Toán Học &amp; Tính Toán
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{current.mathAdvantage}</p>
          </div>
        </div>

        {/* Visual Pipeline Block Diagram */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sơ đồ luồng khối (Data Flow Blocks)
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
            {current.diagram.map((block, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                <div className={`${block.color} text-white px-3 py-2 rounded-xl text-center shadow-sm min-w-[110px]`}>
                  <p className="text-[11px] font-bold leading-tight truncate">{block.name}</p>
                  <p className="text-[10px] text-white/80 font-mono mt-0.5">{block.size}</p>
                </div>
                {idx < current.diagram.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pros / Cons Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Ưu Điểm Nổi Bật
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {current.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-950/30 border border-rose-800/50 rounded-2xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-rose-400" />
              Nhược Điểm &amp; Đánh Đổi
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {current.cons.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Code implementation snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mã nguồn cấu trúc khối (Python / Framework)
            </p>
            <span className="text-[11px] font-mono text-emerald-400">model/architectures</span>
          </div>
          <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed">
            <code>{current.codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
