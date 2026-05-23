import mongoose from "mongoose";

const quizHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    questions: [
      {
        animal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Animal",
          required: true,
        },
        userAnswer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Animal",
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const QuizHistory = mongoose.model("QuizHistory", quizHistorySchema);
export default QuizHistory;
