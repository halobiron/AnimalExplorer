import QuizHistory from "../models/QuizHistory.js";

export const saveQuizResult = async (req, res) => {
  try {
    const { score, totalQuestions, questions } = req.body;
    const history = new QuizHistory({
      user: req.user._id,
      score,
      totalQuestions,
      questions,
    });
    await history.save();
    res.status(201).json({ success: true, history });
  } catch (error) {
    console.error("saveQuizResult error:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

export const getQuizHistory = async (req, res) => {
  try {
    const history = await QuizHistory.find({ user: req.user._id })
      .populate("questions.animal")
      .populate("questions.userAnswer")
      .sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (error) {
    console.error("getQuizHistory error:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};
