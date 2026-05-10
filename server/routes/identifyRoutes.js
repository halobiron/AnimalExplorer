import express from "express";
import multer from "multer";
import { identifySpecies } from "../controllers/identifyController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Dùng memoryStorage vì chỉ cần forward buffer sang AI service
const upload = multer({ storage: multer.memoryStorage() });

// Yêu cầu đăng nhập mới được nhận diện
router.post("/", authMiddleware, upload.single("image"), identifySpecies);

export default router;
