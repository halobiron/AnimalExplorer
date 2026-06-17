import express from "express";
import multer from "multer";
import { generateGradcam, identifySpecies } from "../controllers/identifyController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Dùng memoryStorage vì chỉ cần forward buffer sang AI service
const upload = multer({ storage: multer.memoryStorage() });

// Yêu cầu đăng nhập mới được nhận diện
router.post("/", authMiddleware, upload.single("image"), identifySpecies);
router.post("/gradcam", authMiddleware, upload.single("image"), generateGradcam);

export default router;
