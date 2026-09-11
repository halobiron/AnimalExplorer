import express from "express";
import multer from "multer";
import { generateGradcam, identifySpecies } from "../controllers/identifyController.js";

const router = express.Router();

// Dùng memoryStorage vì chỉ cần forward buffer sang AI service
const upload = multer({ storage: multer.memoryStorage() });

// CNN demo mở công khai để thuận tiện trình bày và kiểm thử.
router.post("/", upload.single("image"), identifySpecies);
router.post("/gradcam", upload.single("image"), generateGradcam);

export default router;
