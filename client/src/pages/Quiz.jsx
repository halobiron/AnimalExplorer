import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { animalAPI, quizAPI } from "../services/api";
import { useApp } from "../context/AppContext";
import { Gamepad2, Trophy, RotateCcw, Home, Sparkles, AlertCircle, ArrowRight, CheckCircle2, XCircle, Star, History } from "lucide-react";

// Shuffle array utility
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const Quiz = () => {
  const [gameState, setGameState] = useState("fetching"); // fetching, intro, loading, playing, result, error
  const [allAnimals, setAllAnimals] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const { user } = useApp();

  // Fetch data
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const res = await animalAPI.getAll();
        if (res.data.success && res.data.animals.length >= 4) {
          setAllAnimals(res.data.animals);
          setGameState("intro");
        } else {
          setGameState("error");
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu quiz:", err);
        setGameState("error");
      }
    };
    fetchAnimals();
  }, []);

  const startNewGame = (animalsData = allAnimals) => {
    if (animalsData.length < 4) {
      setGameState("error");
      return;
    }
    
    setGameState("loading");
    
    // Create 10 random questions
    const shuffled = shuffleArray(animalsData);
    const questionCount = Math.min(10, animalsData.length);
    const selectedForQuestions = shuffled.slice(0, questionCount);
    
    const newQuestions = selectedForQuestions.map(correctAnimal => {
      // Get 3 wrong options
      const others = animalsData.filter(a => a._id !== correctAnimal._id);
      const wrongOptions = shuffleArray(others).slice(0, 3);
      
      return {
        correct: correctAnimal,
        options: shuffleArray([correctAnimal, ...wrongOptions])
      };
    });

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setUserAnswers([]);
    
    // Simulate loading for effect
    setTimeout(() => setGameState("playing"), 600);
  };

  const handleOptionClick = (option) => {
    if (selectedOption || showFeedback) return; // Prevent double click

    setSelectedOption(option);
    setShowFeedback(true);

    const isCorrect = option._id === questions[currentIndex].correct._id;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    const newAnswerRecord = {
      animal: questions[currentIndex].correct._id,
      userAnswer: option._id,
      isCorrect
    };
    setUserAnswers(prev => [...prev, newAnswerRecord]);

    // Auto next after 1.5s
    setTimeout(async () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        if (user) {
          try {
            await quizAPI.saveHistory({
              score: score + (isCorrect ? 1 : 0),
              totalQuestions: questions.length,
              questions: [...userAnswers, newAnswerRecord]
            });
          } catch (error) {
            console.error("Lỗi lưu lịch sử", error);
          }
        }
        setGameState("result");
      }
    }, 1500);
  };

  const getRank = (score, total) => {
    const percent = score / total;
    if (percent >= 0.9) return { label: "Xuất sắc", color: "text-amber-500", icon: Trophy, bg: "bg-amber-100" };
    if (percent >= 0.7) return { label: "Giỏi", color: "text-blue-500", icon: Sparkles, bg: "bg-blue-100" };
    if (percent >= 0.5) return { label: "Khá", color: "text-green-500", icon: Star, bg: "bg-green-100" };
    return { label: "Cần cố gắng", color: "text-gray-500", icon: AlertCircle, bg: "bg-gray-100" };
  };

  if (gameState === "fetching" || gameState === "loading") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse-ring mb-6">
          <Gamepad2 className="w-10 h-10 text-green-600 animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-extrabold text-green-800 animate-pulse">Đang chuẩn bị trò chơi...</h2>
        <p className="text-gray-500 mt-2">Sẵn sàng khám phá thế giới động vật nhé!</p>
      </div>
    );
  }

  if (gameState === "intro") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
        <div className="max-w-lg w-full bg-white rounded-[2rem] p-10 shadow-2xl border border-green-100 text-center animate-fade-in-up">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Gamepad2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Quiz Đoán Tên</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thử thách trí nhớ của bạn với 10 câu hỏi ngẫu nhiên về các loài động vật. Hãy xem bạn nhận ra bao nhiêu loài nhé!
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => startNewGame()}
              className="w-full btn-shimmer text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-lg"
            >
              <Gamepad2 className="w-5 h-5" /> Bắt đầu trò chơi
            </button>
            {user && (
              <Link 
                to="/quiz/history"
                className="w-full bg-blue-50 border-2 border-blue-200 text-blue-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors text-lg"
              >
                <History className="w-5 h-5" /> Lịch sử làm bài
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "error") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-lg border border-red-100 animate-fade-in-up">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không thể tải trò chơi</h2>
          <p className="text-gray-500 mb-8">Có vẻ như dữ liệu động vật chưa sẵn sàng hoặc không đủ. Vui lòng thử lại sau.</p>
          <Link to="/" className="btn-shimmer text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 mx-auto">
            <Home className="w-5 h-5" /> Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (gameState === "result") {
    const rank = getRank(score, questions.length);
    const RankIcon = rank.icon;

    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4" style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)" }}>
        <div className="max-w-lg w-full bg-white rounded-[2rem] p-10 shadow-2xl border border-green-100 text-center relative overflow-hidden animate-fade-in-up">
          {/* Confetti effect using absolute divs */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-[2rem]">
             <div className="absolute top-[-10%] left-[20%] w-3 h-3 bg-red-400 rounded-full animate-float delay-100"></div>
             <div className="absolute top-[10%] left-[80%] w-4 h-4 bg-blue-400 rounded-full animate-float delay-200"></div>
             <div className="absolute top-[40%] left-[10%] w-2 h-2 bg-yellow-400 rounded-full animate-float delay-300"></div>
             <div className="absolute top-[20%] right-[20%] w-3 h-3 bg-green-400 rounded-full animate-float delay-400"></div>
          </div>

          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${rank.bg} mb-6 relative z-10 animate-fade-in-up`}>
            <RankIcon className={`w-12 h-12 ${rank.color}`} />
          </div>
          
          <h2 className="text-4xl font-black text-gray-800 mb-2 relative z-10">Kết Quả!</h2>
          <p className="text-gray-500 text-lg mb-8 relative z-10">Bạn đã hoàn thành thử thách.</p>
          
          <div className="bg-gray-50 rounded-3xl p-6 mb-8 relative z-10 border border-gray-100">
            <div className="text-6xl font-black gradient-text mb-2 tracking-tight">
              {score}/{questions.length}
            </div>
            <div className={`text-xl font-bold ${rank.color} uppercase tracking-wider`}>
              {rank.label}
            </div>
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            <button 
              onClick={() => startNewGame()}
              className="w-full btn-shimmer text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-lg"
            >
              <RotateCcw className="w-5 h-5" /> Chơi lại ngay
            </button>
            <Link 
              to="/"
              className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors text-lg"
            >
              <Home className="w-5 h-5" /> Về trang chủ
            </Link>
            {user && (
              <Link 
                to="/quiz/history"
                className="w-full bg-blue-50 border-2 border-blue-200 text-blue-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors text-lg"
              >
                <History className="w-5 h-5" /> Lịch sử & Xem lại
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4" style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)" }}>
      <div className="max-w-4xl mx-auto">
        
        {/* Header & Progress */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-green-100">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-gray-700">Điểm: <span className="text-green-600">{score}</span></span>
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-green-100 font-bold text-gray-700">
              Câu {currentIndex + 1} / {questions.length}
            </div>
          </div>
          
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl border border-green-50">
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-800 mb-8">
            Đây là con vật gì?
          </h2>

          {/* Image */}
          <div className="relative max-w-md mx-auto aspect-square mb-10 group perspective-1000">
            <div className="absolute inset-0 bg-green-200 blur-2xl opacity-20 rounded-3xl transform group-hover:scale-105 transition-transform duration-500"></div>
            <img 
              src={currentQ.correct.imageUrl} 
              alt="Mystery Animal" 
              className="relative w-full h-full object-cover rounded-[2rem] shadow-md border-[6px] border-white z-10 transition-transform duration-300"
              style={{ transform: showFeedback && selectedOption._id === currentQ.correct._id ? 'scale(1.05)' : 'scale(1)' }}
            />
            
            {/* Correct/Incorrect overlay animation */}
            {showFeedback && (
              <div className="absolute inset-0 z-20 flex items-center justify-center animate-fade-in pointer-events-none">
                {selectedOption._id === currentQ.correct._id ? (
                  <div className="w-24 h-24 bg-green-500 rounded-full shadow-2xl flex items-center justify-center animate-fade-in-up">
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-red-500 rounded-full shadow-2xl flex items-center justify-center animate-fade-in-up">
                    <XCircle className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option) => {
              let btnClass = "bg-gray-50 border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md";
              let icon = null;

              if (showFeedback) {
                if (option._id === currentQ.correct._id) {
                  // This is the correct answer
                  btnClass = "bg-green-500 border-green-600 text-white shadow-lg scale-[1.02] z-10";
                  icon = <CheckCircle2 className="w-5 h-5 text-white animate-fade-in" />;
                } else if (option._id === selectedOption?._id) {
                  // This is the wrong answer the user selected
                  btnClass = "bg-red-50 border-red-200 text-red-600 opacity-80 scale-95";
                  icon = <XCircle className="w-5 h-5 text-red-500" />;
                } else {
                  // Other wrong options
                  btnClass = "bg-gray-50 border-gray-200 text-gray-400 opacity-50";
                }
              }

              return (
                <button
                  key={option._id}
                  onClick={() => handleOptionClick(option)}
                  disabled={showFeedback}
                  className={`relative p-5 rounded-2xl border-2 font-bold text-lg md:text-xl transition-all duration-300 flex items-center justify-between ${btnClass}`}
                >
                  <span className="flex-1 text-center">{option.vietnameseName}</span>
                  {icon && <div className="absolute right-5">{icon}</div>}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Quiz;
