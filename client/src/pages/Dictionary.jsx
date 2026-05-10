import { useState, useEffect } from "react";
import { animalAPI } from "../services/api";
import { Search, Info, X, BookOpen, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const Dictionary = () => {
  const [animals, setAnimals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  useEffect(() => {
    animalAPI.getAll()
      .then((res) => setAnimals(res.data.animals))
      .catch(() => toast.error("Không thể tải danh sách động vật"))
      .finally(() => setLoading(false));
  }, []);

  const filteredAnimals = searchQuery
    ? animals.filter((a) => {
        const q = searchQuery.toLowerCase();
        return a.vietnameseName.toLowerCase().includes(q) || a.label.toLowerCase().includes(q);
      })
    : animals;

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 60%, #f0fdf4 100%)" }}
    >
      <div className="relative overflow-hidden bg-white border-b border-gray-100 py-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-100 rounded-full opacity-40 blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-100 rounded-full opacity-30 blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-[1700px] mx-auto px-10 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-green-200 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                Bách khoa động vật
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Từ điển{" "}
                <span className="text-green-600">Động Vật</span>
              </h1>
              <p className="text-gray-500 mt-3 text-base font-medium max-w-md leading-relaxed">
                Khám phá{" "}
                <span className="text-green-600 font-bold">{animals.length} loài</span>{" "}
                động vật kỳ thú trong tự nhiên với thông tin sinh học đầy đủ.
              </p>
            </div>

            <div className="w-full lg:w-[560px] animate-fade-in-up delay-100">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-2xl bg-white shadow-sm focus:ring-0 focus:border-green-400 transition-all outline-none text-gray-700 placeholder:text-gray-400 font-medium"
                  placeholder="Tìm theo tên tiếng Việt hoặc tên khoa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-2 pl-1">
                  Tìm thấy <span className="font-bold text-green-600">{filteredAnimals.length}</span> kết quả cho &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-10 py-10">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-72 gap-4">
            <div className="w-14 h-14 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm font-medium">Đang tải danh sách động vật...</p>
          </div>
        ) : filteredAnimals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredAnimals.map((animal, idx) => (
              <div
                key={animal._id}
                onClick={() => setSelectedAnimal(animal)}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-green-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5 flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx * 0.03, 0.6)}s` }}
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  {animal.imageUrl ? (
                    <img
                      src={animal.imageUrl}
                      alt={animal.vietnameseName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full items-center justify-center text-4xl bg-gradient-to-br from-green-50 to-emerald-100"
                    style={{ display: animal.imageUrl ? "none" : "flex" }}
                  >
                    🐾
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                    <Info className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors capitalize leading-snug">
                    {animal.vietnameseName}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium capitalize mt-0.5 truncate">
                    {animal.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 animate-fade-in">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-400 mb-6">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Xóa tìm kiếm
            </button>
          </div>
        )}
      </div>

      {selectedAnimal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedAnimal(null)}
          />
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col md:flex-row max-h-[90vh]">
            <button
              onClick={() => setSelectedAnimal(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 hover:bg-black/30 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="md:w-[45%] flex-shrink-0 bg-gray-100 relative">
              <div className="aspect-square md:aspect-auto md:h-full relative">
                <img
                  src={selectedAnimal.imageUrl}
                  alt={selectedAnimal.vietnameseName}
                  className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/30">
                    {selectedAnimal.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:w-[55%] p-8 md:p-10 flex flex-col overflow-y-auto">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
                    Thông tin loài
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 capitalize leading-tight mb-1">
                  {selectedAnimal.vietnameseName}
                </h2>
                <p className="text-base text-gray-400 italic font-medium capitalize">
                  {selectedAnimal.label}
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-green-200 to-transparent mb-6" />

              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Thông tin sinh học
                </h4>
                <p className="text-gray-700 leading-relaxed text-base">
                  {selectedAnimal.description || "Chưa có mô tả cho loài này."}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <button
                  onClick={() => setSelectedAnimal(null)}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-700 text-white font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dictionary;
