import { useState, useEffect } from "react";
import { collectionAPI } from "../services/api";
import { BookMarked, Search, AlertCircle, Compass, X, CheckCircle2, TrendingUp } from "lucide-react";

const TOTAL_SPECIES = 90;

const CollectionCard = ({ item, index }) => {
  const conf = item.bestConfidence ?? 0;
  const confColor =
    conf >= 80 ? "bg-green-500 text-white" :
    conf >= 50 ? "bg-amber-400 text-white" :
                 "bg-red-400 text-white";
  const dotColor =
    conf >= 80 ? "bg-green-400" :
    conf >= 50 ? "bg-amber-400" :
                 "bg-red-400";

  const isNew = (Date.now() - new Date(item.createdAt).getTime()) < 24 * 60 * 60 * 1000;

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 hover:-translate-y-1 transition-all duration-300 flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 0.04, 0.6)}s` }}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={item.imageUrl}
          alt={item.vietnameseName || item.label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <span className={`absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${confColor}`}>
          <CheckCircle2 className="w-3 h-3" />
          {conf}%
        </span>

        {isNew && (
          <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-400 text-yellow-900 shadow-md">
            Mới!
          </span>
        )}

        {item.count > 1 && (
          <span className="absolute bottom-12 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
            ×{item.count}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-extrabold text-base capitalize leading-snug drop-shadow-sm">
            {item.vietnameseName || item.label}
          </p>
          {item.vietnameseName && (
            <p className="text-white/60 text-xs italic mt-0.5 capitalize">{item.label}</p>
          )}
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">
          {new Date(item.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
      </div>
    </div>
  );
};

const Collection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    collectionAPI.getCollection()
      .then((res) => setItems(res.data.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) =>
    [item.label, item.vietnameseName]
      .filter(Boolean)
      .some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const progressPercent = Math.min((items.length / TOTAL_SPECIES) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%)" }}
      >
        <div className="w-14 h-14 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Đang tải bộ sưu tập...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12"
      style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%)" }}
    >
      <div className="max-w-[1700px] mx-auto px-10">

        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-5 border border-green-200">
            <BookMarked className="w-4 h-4" />
            Khám phá & Thu thập
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                Bộ sưu tập <span className="text-green-600">của bạn</span>
              </h1>
              <p className="text-gray-500 text-base">
                Đã khám phá{" "}
                <span className="font-bold text-green-600">{items.length}</span>
                {" "}/ {TOTAL_SPECIES} loài động vật.
              </p>
            </div>

            {items.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 min-w-[240px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    Tiến trình
                  </div>
                  <span className="text-sm font-extrabold text-green-600">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{TOTAL_SPECIES - items.length} loài chưa khám phá</p>
              </div>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="relative mb-8 animate-fade-in-up delay-100">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm trong bộ sưu tập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-green-400 transition shadow-sm font-medium text-gray-700 placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center animate-fade-in">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Compass className="w-12 h-12 text-green-300" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-700 mb-2">Bộ sưu tập trống</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              Hãy nhận diện loài đầu tiên để bắt đầu bộ sưu tập của bạn!
            </p>
            <a
              href="/identify"
              className="inline-flex items-center gap-2 btn-shimmer text-white font-bold px-7 py-3.5 rounded-2xl text-sm shadow-lg"
            >
              <Compass className="w-4 h-4" />
              Bắt đầu khám phá
            </a>
          </div>

        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-14 text-center animate-fade-in">
            <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-1">Không tìm thấy kết quả</p>
            <p className="text-gray-400 text-sm mb-4">Không có loài nào khớp với &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => setSearch("")}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 hover:underline underline-offset-2"
            >
              <X className="w-3.5 h-3.5" />
              Xóa tìm kiếm
            </button>
          </div>

        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map((item, idx) => (
              <CollectionCard key={item._id} item={item} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
