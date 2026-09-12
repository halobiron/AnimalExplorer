import { CheckCircle2, FileCode, FolderArchive, Layers, ExternalLink, Sparkles, Database, Terminal, Cpu, ShieldCheck } from "lucide-react";

const MODULES_LIST = [
  {
    id: "M1",
    tag: "Dữ liệu & Tiền xử lý",
    title: "Quản lý & Chuẩn hoá tập dữ liệu ảnh",
    desc: "Nạp tập dữ liệu 47 loài động vật, phân chia tập Train (80%) và Validation (20%), chuẩn hóa RGB [0.0, 1.0].",
    artifact: "model/dataset_raw/animals/animals",
    tech: "NumPy / PIL / tf.data / torchvision",
    status: "Đã hoàn thành",
    evidence: "Dùng chung một cấu trúc thư mục dữ liệu chuẩn; demo trực tiếp tại Bước 1 & Bước 2.",
  },
  {
    id: "M2",
    tag: "Khám phá CNN",
    title: "Mô phỏng trực quan luồng nơ-ron CNN",
    desc: "Khám phá luồng dữ liệu liên hoàn: Input Tensor -> Tiền xử lý -> Conv2D & ReLU -> MaxPooling -> Dense Softmax -> Grad-CAM.",
    artifact: "client/src/components/cnn/*",
    tech: "Interactive 6-Stage Visualizer",
    status: "Đã hoàn thành",
    evidence: "Mô phỏng quét laser, trượt Kernel 3×3, pooling 2×2 và tính toán phân phối xác suất thời gian thực.",
  },
  {
    id: "M3",
    tag: "Kiến trúc nâng cao",
    title: "Nghiên cứu & Đối chiếu VGG, ResNet, Inception",
    desc: "So sánh các kỹ thuật giải quyết giới hạn CNN: VGG (xếp chồng 3×3), ResNet (Skip Connection F(x)+x), Inception (đa nhánh đa tỉ lệ).",
    artifact: "model/architectures & Bước 3",
    tech: "VGG · ResNet · Inception Visualizer",
    status: "Đã hoàn thành",
    evidence: "Mô hình hoá và so sánh ưu/nhược, trường nhìn Receptive Field và công thức toán học.",
  },
  {
    id: "M4",
    tag: "NumPy from Scratch",
    title: "Cài đặt thuật toán CNN từ đầu bằng NumPy",
    desc: "Tự lập trình mô hình CNN bằng NumPy thuần: tự định nghĩa forward và backward cho Conv2D (einsum), ReLU, MaxPool, Dense, Softmax.",
    artifact: "model/cnn_from_scratch.py",
    tech: "Pure Python + NumPy einsum",
    status: "Đã hoàn thành",
    evidence: "Toàn bộ phép tính ma trận và lan truyền ngược đạo hàm được tự cài đặt không dùng thư viện Deep Learning.",
  },
  {
    id: "M5",
    tag: "TensorFlow / Keras",
    title: "Huấn luyện & Phục vụ API Keras / FastAPI",
    desc: "Xây dựng mô hình Keras Sequential, huấn luyện và xuất file animal_image_classifier.keras phục vụ backend API.",
    artifact: "model/train_keras.ipynb & model/main.py",
    tech: "TensorFlow 2.x / Keras / FastAPI",
    status: "Đã hoàn thành",
    evidence: "Cung cấp FastAPI endpoints /predict, /gradcam và hiển thị Top-5 độ tin cậy trên giao diện.",
  },
  {
    id: "M6",
    tag: "PyTorch Module",
    title: "Huấn luyện mô hình chuẩn nghiên cứu PyTorch",
    desc: "Định nghĩa lớp AnimalCNN kế thừa torch.nn.Module, DataLoader đa luồng, vòng lặp huấn luyện thủ công và lưu file .pt.",
    artifact: "model/train_pytorch.ipynb",
    tech: "PyTorch (torch.nn, torchvision)",
    status: "Đã hoàn thành",
    evidence: "Huấn luyện qua các epoch với Adam Optimizer, CrossEntropyLoss và lưu mô hình animal_cnn_pytorch.pt.",
  },
];

export default function CnnRequirementsMatrix() {
  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Tổng Hợp Kiến Trúc &amp; Minh Chứng Kỹ Thuật
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
            Hệ Thống Thành Phần Đã Xây Dựng
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Minh chứng các module trong mã nguồn dự án tương ứng với từng kỹ thuật đã triển khai.
          </p>
        </div>

        <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Đã triển khai 6/6 Module
        </span>
      </div>

      {/* Grid of Components Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MODULES_LIST.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-2.5 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  {item.tag}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {item.status}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">{item.title}</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">{item.desc}</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-gray-100 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Tệp nguồn:</span>
                <code className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded font-mono truncate max-w-[200px]">
                  {item.artifact}
                </code>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Chi tiết: </strong>
                {item.evidence}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
