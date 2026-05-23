import express from "express";
import { saveQuizResult, getQuizHistory } from "../controllers/quizController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/history", saveQuizResult);
router.get("/history", getQuizHistory);

export default router;
