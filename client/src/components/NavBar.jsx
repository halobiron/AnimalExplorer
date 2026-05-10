import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LogOut, BookMarked, ChevronDown, Menu, X, Compass } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../assets/AnimalExplorer_NavBarLogo.png";

const NAV_LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/dictionary", label: "Từ điển" },
  { to: "/identify", label: "Nhận diện ảnh", icon: Compass },
];

const NavBar = () => {
  const { user, logout } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => setIsMobileOpen(false), [location]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    toast.success("Đã đăng xuất thành công!");
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative px-5 py-2.5 text-base font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
      isActive(path)
        ? "text-green-700 bg-green-50"
        : "text-gray-600 hover:text-green-700 hover:bg-green-50/80"
    }`;

  const mobileNavLinkClass = (path) =>
    `px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      isActive(path)
        ? "bg-green-50 text-green-700 border-l-2 border-green-500 pl-3.5"
        : "text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg shadow-green-900/5"
            : "bg-white/90 backdrop-blur-sm shadow-md"
        }`}
      >
        <div className="max-w-[1700px] mx-auto px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition group">
            <img src={logo} alt="Animal Explorer Logo" className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={navLinkClass(to)}>
                {Icon && <Icon className="w-4 h-4" />}
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-green-500 rounded-full" />
                )}
              </Link>
            ))}

            {user ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold uppercase">{user.username[0]}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-800 max-w-[80px] truncate">{user.username}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-green-600 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-fade-in origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-xs text-gray-400 mb-0.5">Đang đăng nhập</p>
                      <p className="text-sm font-bold text-gray-800 truncate">@{user.username}</p>
                    </div>

                    <Link
                      to="/collection"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                    >
                      <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                        <BookMarked className="w-4 h-4 text-green-600" />
                      </div>
                      Bộ sưu tập
                    </Link>

                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-red-500" />
                        </div>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 text-base font-bold text-white bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} className={mobileNavLinkClass(to)}>{label}</Link>
              ))}
              {user ? (
                <>
                  <Link to="/collection" className={mobileNavLinkClass("/collection")}>Bộ sưu tập</Link>
                  <div className="my-1 h-px bg-gray-100" />
                  <button onClick={handleLogout} className="text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link to="/login" className="mt-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 text-center transition-colors">
                  Đăng nhập / Đăng ký
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavBar;
