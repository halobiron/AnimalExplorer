import axios from "axios";
import FormData from "form-data";
import Collection from "../models/Collection.js";
import Animal from "../models/Animal.js";
import { getImagenetFallbackLabel } from "../utils/imagenetLabels.js";

const extractVietnameseName = (aiData) =>
  aiData.class_vi ||
  aiData.vietnamese_name ||
  aiData.vietnameseName ||
  aiData.name_vi ||
  aiData.vietnamese ||
  "";

const getAIGradcamUrl = () => {
  const predictUrl = process.env.AI_SERVICE_URL;
  return process.env.AI_GRADCAM_URL || predictUrl.replace(/\/predict\/?$/, "/gradcam");
};

const addToCollection = async (userId, label, vietnameseName, confidence, imageUrl) => {
  const existing = await Collection.findOne({ userId, label });

  if (existing) {
    await Collection.findByIdAndUpdate(existing._id, {
      $inc: { count: 1 },
      lastSeenAt: new Date(),
      ...(confidence > existing.bestConfidence && { bestConfidence: confidence }),
    });
    return;
  }

  await Collection.create({
    userId,
    label,
    vietnameseName,
    ...(imageUrl ? { imageUrl } : {}),
    count: 1,
    bestConfidence: confidence,
    lastSeenAt: new Date(),
  });
};

export const identifySpecies = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng upload ảnh" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    if (req.body?.gradcam_layer) {
      formData.append("gradcam_layer", req.body.gradcam_layer);
    }

    const { data: aiData } = await axios.post(process.env.AI_SERVICE_URL, formData, {
      headers: formData.getHeaders(),
    });

    const label = aiData.class || aiData.label;
    const confidence = Math.round(aiData.confidence * 100);
    const modelUsed = aiData.model_used || (aiData.fallback_used ? "fallback" : "custom");
    let vietnameseName = extractVietnameseName(aiData);
    let animalDetails = null;
    let isAnimal = false;
    let warning = "";

    const dbAnimal = await Animal.findOne({ label: label.toLowerCase() }).catch(() => null);
    if (dbAnimal) {
      isAnimal = true;
      vietnameseName = dbAnimal.vietnameseName;
      animalDetails = {
        vietnameseName: dbAnimal.vietnameseName,
        description: dbAnimal.description,
        imageUrl: dbAnimal.imageUrl || "",
      };
    } else if (modelUsed === "fallback") {
      const imagenetLabel = getImagenetFallbackLabel(label);
      vietnameseName = imagenetLabel.vietnameseName;
      warning = `ImageNet dự phòng nhận diện ảnh là "${imagenetLabel.englishName}". Nhãn này không nằm trong danh sách loài vật của hệ thống.`;
      animalDetails = {
        vietnameseName: imagenetLabel.vietnameseName,
        imageUrl: "",
        isFallbackLabel: true,
        englishName: imagenetLabel.englishName,
      };
    }

    if (req.user?._id && dbAnimal) {
      addToCollection(req.user._id, label, vietnameseName, confidence, dbAnimal.imageUrl);
    }

    res.json({
      success: true,
      result: {
        label,
        vietnameseName,
        confidence,
        details: animalDetails,
        isAnimal,
        warning,
        gradcam: aiData.gradcam || null,
        modelUsed,
        gradcamClassIndex: aiData.gradcam_class_index,
      },
    });
  } catch (error) {
    console.error("identifySpecies error:", error.message);
    res.status(500).json({ success: false, message: "Lỗi nhận diện. Thử lại sau." });
  }
};

export const generateGradcam = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng upload ảnh" });
    }

    const { model_used, class_index, gradcam_layer } = req.body;
    if (!model_used || class_index === undefined) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin model hoặc lớp cần xem Grad-CAM" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append("model_used", model_used);
    formData.append("class_index", class_index);
    if (gradcam_layer) {
      formData.append("gradcam_layer", gradcam_layer);
    }

    const { data: aiData } = await axios.post(getAIGradcamUrl(), formData, {
      headers: formData.getHeaders(),
    });

    res.json({
      success: true,
      gradcam: aiData.gradcam || null,
    });
  } catch (error) {
    console.error("generateGradcam error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Lỗi tạo Grad-CAM. Thử lại sau." });
  }
};
