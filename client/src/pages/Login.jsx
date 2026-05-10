import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, User, Lock, ArrowRight, ArrowLeft } from "lucide-react";

const ANIMAL_EMOJIS = ["🦁", "🐬", "🦅", "🐯", "🦋"];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ username: "", password: "" });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      const res = isRegister
        ? await authAPI.register(form)
        : await authAPI.login(form);
      login(res.data.user);
      toast.success(isRegister ? "Đăng ký thành công!" : "Chào mừng trở lại!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex">
      <div
        className="hidden lg:flex w-[45%] flex-shrink-0 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #052e16, #14532d, #15803d)" }}
      >
        <div className="absolute top-16 -left-16 w-64 h-64 bg-green-400 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-16 -right-16 w-56 h-56 bg-yellow-300 rounded-full opacity-10 blur-3xl" />

        <div className="relative z-10 text-center text-white px-10 max-w-xs">
          <div className="text-7xl mb-5">🌿</div>
          <h2 className="text-3xl font-extrabold mb-3 leading-snug">
            Khám phá<br />
            <span className="gradient-text">Thế giới động vật</span>
          </h2>
          <p className="text-green-100/65 text-sm leading-relaxed">
            Tham gia cùng hàng nghìn nhà thám hiểm đang dùng AI để khám phá thiên nhiên.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            {ANIMAL_EMOJIS.map((emoji) => (
              <div key={emoji} className="w-9 h-9 rounded-full glass flex items-center justify-center text-base border border-white/20">
                {emoji}
              </div>
            ))}
          </div>
          <p className="text-green-100/40 text-xs mt-2">90+ loài được nhận diện</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="px-8 pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Trang chủ
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <div className="mb-7">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">
                Animal Explorer
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900">
                {isRegister ? "Tạo tài khoản" : "Chào mừng trở lại"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isRegister
                  ? "Đăng ký để bắt đầu bộ sưu tập của bạn"
                  : "Đăng nhập để tiếp tục hành trình"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập..."
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu..."
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    className="w-full pl-10 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "btn-shimmer text-white shadow-md"
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin-slow" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
              <button
                onClick={() => setIsRegister((p) => !p)}
                className="text-green-600 font-semibold hover:underline underline-offset-2"
              >
                {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
              </button>
            </p>
          </div>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
};

export default Login;
