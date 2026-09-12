import { Image as ImageIcon, SlidersHorizontal, BrainCircuit, Shrink, Waypoints, ScanSearch, ArrowRight } from "lucide-react";

export const STAGES_CONFIG = [
  {
    id: 1,
    title: "Input Tensor",
    shortTitle: "1. Ảnh RGB",
    desc: "Biểu diễn số học 3 kênh màu (H × W × 3)",
    icon: ImageIcon,
    badge: "224×224×3",
    color: "emerald",
  },
  {
    id: 2,
    title: "Tiền xử lý",
    shortTitle: "2. Chuẩn hoá",
    desc: "Resize & chia 255 sang float32 [0, 1]",
    icon: SlidersHorizontal,
    badge: "Chuẩn hoá [0, 1]",
    color: "teal",
  },
  {
    id: 3,
    title: "Tích chập (Conv2D & ReLU)",
    shortTitle: "3. Tích chập",
    desc: "Quét Kernel 3×3 trích xuất đường nét, cạnh, vân",
    icon: BrainCircuit,
    badge: "Trích xuất đặc trưng",
    color: "green",
  },
  {
    id: 4,
    title: "Max Pooling",
    shortTitle: "4. Pooling",
    desc: "Giảm 75% kích thước không gian, giữ đặc trưng mạnh",
    icon: Shrink,
    badge: "Giảm chiều 50%",
    color: "cyan",
  },
  {
    id: 5,
    title: "Dense & Softmax",
    shortTitle: "5. Softmax",
    desc: "Phẳng hóa tensor và tính xác suất Top-5 lớp",
    icon: Waypoints,
    badge: "Phân loại 47 loài",
    color: "blue",
  },
  {
    id: 6,
    title: "Grad-CAM (XAI)",
    shortTitle: "6. Grad-CAM",
    desc: "Bản đồ nhiệt giải thích vùng AI tập trung",
    icon: ScanSearch,
    badge: "Bản đồ nhiệt XAI",
    color: "amber",
  },
];

const CnnArchitectureMap = ({ currentStep, onSelectStep, isRunning }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Sơ đồ luồng xử lý CNN (Data Flow Pipeline)
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          6 Giai đoạn liên hoàn
        </span>
      </div>

      {/* Pipeline Track */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {STAGES_CONFIG.map((stage) => {
          const isActive = currentStep === stage.id;
          const isDone = currentStep > stage.id;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectStep(stage.id)}
              disabled={isRunning}
              className={`group relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-b from-emerald-50 to-teal-50/60 border-emerald-500 shadow-md shadow-emerald-500/10 scale-[1.02] ring-2 ring-emerald-400/30"
                  : isDone
                  ? "bg-emerald-50/30 border-emerald-200/70 hover:bg-emerald-50/80 text-gray-700"
                  : "bg-gray-50/70 border-gray-200/60 hover:bg-gray-100/80 text-gray-500"
              } ${isRunning ? "cursor-wait opacity-80" : "cursor-pointer"}`}
            >
              {/* Step number badge & icon */}
              <div className="w-full flex items-center justify-between mb-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                      : isDone
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-200/80 text-gray-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : isDone
                      ? "bg-emerald-200/70 text-emerald-800"
                      : "bg-gray-200/70 text-gray-600"
                  }`}
                >
                  Bước {stage.id}
                </span>
              </div>

              {/* Title & info */}
              <p
                className={`text-xs font-extrabold leading-snug line-clamp-1 ${
                  isActive ? "text-emerald-950" : isDone ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {stage.title}
              </p>

              <div className="mt-1 flex items-center justify-between w-full">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? "bg-emerald-200/80 text-emerald-900" : "bg-gray-200/60 text-gray-600"
                }`}>
                  {stage.badge}
                </span>
              </div>

              <p className="text-[10px] text-gray-500 leading-tight mt-1 line-clamp-2">
                {stage.desc}
              </p>

              {/* Bottom active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CnnArchitectureMap;
