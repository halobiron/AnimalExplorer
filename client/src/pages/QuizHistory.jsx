import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quizAPI } from "../services/api";
import { History, ChevronDown, ChevronUp, CheckCircle2, XCircle, ArrowLeft, Info, X } from "lucide-react";

const QuizHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await quizAPI.getHistory();
        if (res.data.success) {
          setHistory(res.data.history);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/quiz" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 text-gray-600 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <History className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800">Lịch Sử Làm Bài</h1>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">Bạn chưa hoàn thành bài Quiz nào.</p>
            <Link to="/quiz" className="btn-shimmer inline-block px-6 py-3 rounded-xl text-white font-bold">Chơi ngay</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div key={record._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                <button 
                  onClick={() => toggleExpand(record._id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-sm ${record.score >= record.totalQuestions * 0.7 ? 'bg-green-500' : 'bg-amber-500'}`}>
                      <span className="text-sm leading-none">{record.score}</span>
                      <span className="text-xs leading-none border-t border-white/30 pt-0.5 mt-0.5">{record.totalQuestions}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Đạt {record.score}/{record.totalQuestions} điểm</h3>
                      <p className="text-gray-500 text-sm">{formatDate(record.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {expandedId === record._id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>
                </button>

                {expandedId === record._id && (
                  <div className="px-6 pb-6 border-t border-gray-50 pt-4 bg-gray-50/50">
                    <h4 className="font-bold text-gray-700 mb-4">Chi tiết các câu hỏi:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {record.questions.map((q, idx) => (
                        <div key={q._id || idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                          <img 
                            src={q.animal.imageUrl} 
                            alt={q.animal.vietnameseName} 
                            className="w-20 h-20 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition"
                            onClick={() => setSelectedAnimal(q.animal)}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <p className="font-bold text-gray-800 cursor-pointer hover:text-green-600 transition" onClick={() => setSelectedAnimal(q.animal)}>
                                {q.animal.vietnameseName}
                              </p>
                              <button onClick={() => setSelectedAnimal(q.animal)} className="text-blue-500 hover:text-blue-700"><Info className="w-4 h-4" /></button>
                            </div>
                            <div className="mt-2 text-sm">
                              {q.isCorrect ? (
                                <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 className="w-4 h-4"/> Đúng</span>
                              ) : (
                                <div>
                                  <span className="flex items-center gap-1 text-red-500 font-semibold mb-1"><XCircle className="w-4 h-4"/> Sai</span>
                                  <span className="text-gray-500 text-xs">Bạn chọn: {q.userAnswer?.vietnameseName || "Không rõ"}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animal Info Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in-up">
            <button 
              onClick={() => setSelectedAnimal(null)}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedAnimal.imageUrl} alt={selectedAnimal.vietnameseName} className="w-full h-64 object-cover rounded-t-3xl" />
            <div className="p-8">
              <div className="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase px-3 py-1 rounded-full mb-3">
                {selectedAnimal.label}
              </div>
              <h2 className="text-3xl font-extrabold text-gray-800 mb-4">{selectedAnimal.vietnameseName}</h2>
              <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">{selectedAnimal.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistory;
