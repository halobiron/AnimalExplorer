import { Link } from "react-router-dom";
import { Camera, BrainCircuit, BookOpen, ArrowRight, Leaf, Shield, Zap, Sparkles, Gamepad2 } from "lucide-react";

const STEPS = [
  {
    icon: Camera,
    title: "Chụp hình",
    desc: "Tải lên hình ảnh loài động vật bạn bắt gặp trong tự nhiên hoặc từ thư viện ảnh của bạn.",
    color: "from-green-400 to-emerald-600",
    bg: "bg-green-50", border: "border-green-200", iconColor: "text-green-600",
    step: "01",
  },
  {
    icon: BrainCircuit,
    title: "AI Phân tích",
    desc: "Hệ thống AI tiên tiến quét và phân tích hình ảnh, trả về tên loài với độ chính xác cao.",
    color: "from-blue-400 to-violet-600",
    bg: "bg-blue-50", border: "border-blue-200", iconColor: "text-blue-600",
    step: "02",
  },
  {
    icon: BookOpen,
    title: "Khám phá",
    desc: "Nhận kết quả kèm thông tin sinh học phong phú từ cơ sở dữ liệu động vật của chúng tôi.",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50", border: "border-amber-200", iconColor: "text-amber-600",
    step: "03",
  },
];

const STATS = [
  { value: "90+",  label: "Loài động vật",      icon: Leaf,     color: "bg-green-100 text-green-600"  },
  { value: "95%",  label: "Độ chính xác",        icon: Shield,   color: "bg-blue-100 text-blue-600"    },
  { value: "<3s",  label: "Thời gian phân tích", icon: Zap,      color: "bg-amber-100 text-amber-600"  },
  { value: "Free", label: "Hoàn toàn miễn phí",  icon: Sparkles, color: "bg-purple-100 text-purple-600"},
];

const Home = () => {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)" }}>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-200 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-200 rounded-full opacity-20 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-[1700px] mx-auto px-10 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-green-200">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Nhận diện động vật bằng AI
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
              Khám Phá{" "}
              <span className="relative">
                <span className="text-green-600">Thế Giới</span>
              </span>
              <br />
              <span className="text-gray-700">Động Vật</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
              Chỉ cần tải lên một bức ảnh — AI sẽ nhận diện tức thì loài động vật và cung cấp toàn bộ thông tin sinh học hấp dẫn trong chớp mắt.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/identify"
                className="btn-shimmer text-white font-bold text-base px-7 py-3.5 rounded-2xl shadow-lg flex items-center gap-2.5 hover:shadow-green-200"
              >
                <Camera className="w-5 h-5" />
                Bắt đầu nhận diện
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dictionary"
                className="text-gray-700 font-semibold text-base px-7 py-3.5 rounded-2xl border-2 border-gray-200 bg-white hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all shadow-sm flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Xem từ điển
              </Link>
              <Link
                to="/quiz"
                className="text-amber-700 font-semibold text-base px-7 py-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800 transition-all shadow-sm flex items-center gap-2"
              >
                <Gamepad2 className="w-5 h-5 text-amber-600" />
                Chơi Game Đoán Tên
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-shrink-0 animate-fade-in-up delay-200">
            {STATS.map(({ value, label, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-300 min-w-[150px]"
              >
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative py-2 overflow-hidden">
        <div className="max-w-[1700px] mx-auto px-10">
          <div className="h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />
        </div>
      </div>

      <section id="how-it-works" className="py-24">
        <div className="max-w-[1700px] mx-auto px-10">
          <div className="text-center mb-14 animate-fade-in-up">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-green-200">
              Cách thức hoạt động
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Trải nghiệm chỉ với{" "}
              <span className="text-green-600">3 bước</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              Trở thành nhà thám hiểm thiên nhiên chưa bao giờ dễ dàng đến thế.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-0.5 bg-gradient-to-r from-green-200 via-blue-200 to-amber-200 z-0" />

            {STEPS.map(({ icon: Icon, title, desc, color, bg, border, iconColor, step }, i) => (
              <div
                key={title}
                className={`card-hover relative bg-white rounded-3xl p-10 border ${border} shadow-sm text-center group z-10 animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${color} text-white text-xs font-extrabold flex items-center justify-center shadow-lg`}>
                  {i + 1}
                </div>
                <div className={`w-20 h-20 ${bg} ${iconColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className="w-10 h-10" />
                </div>
                <div className="absolute top-6 right-6 text-5xl font-black text-gray-50 select-none">{step}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/identify"
              className="inline-flex items-center gap-2 btn-shimmer text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg text-base"
            >
              <Camera className="w-5 h-5" />
              Thử ngay bây giờ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-8">
        <div className="max-w-[1700px] mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-8 border-b border-gray-800">
            <div className="text-center md:text-left">
              <p className="text-white font-extrabold text-xl tracking-tight mb-1">Animal Explorer</p>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Nhận diện & khám phá thế giới động vật kỳ diệu bằng sức mạnh của AI.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-medium justify-center">
              <Link to="/" className="hover:text-green-400 transition-colors">Trang chủ</Link>
              <Link to="/dictionary" className="hover:text-green-400 transition-colors">Từ điển</Link>
              <Link to="/identify" className="hover:text-green-400 transition-colors">Nhận diện</Link>
              <Link to="/quiz" className="hover:text-green-400 transition-colors">Trò chơi</Link>
              <Link to="/collection" className="hover:text-green-400 transition-colors">Bộ sưu tập</Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 text-xs text-gray-600">
            <p>© 2026 <span className="text-gray-400 font-semibold">Animal Explorer</span>. All rights reserved.</p>
            <p className="text-gray-700">Xây dựng với tình yêu dành cho thiên nhiên</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
