import axios from "axios";
import FormData from "form-data";
import Collection from "../models/Collection.js";
import Animal from "../models/Animal.js";

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

const getAIServiceError = (error) => {
  if (error.code === "ECONNREFUSED" || error.code === "ECONNABORTED") {
    return "Dịch vụ CNN chưa chạy tại http://localhost:8000. Hãy khởi động FastAPI trước khi nhận diện.";
  }

  if (error.response?.data?.detail) {
    return `Dịch vụ CNN báo lỗi: ${error.response.data.detail}`;
  }

  return "Dịch vụ CNN không thể xử lý ảnh. Kiểm tra terminal FastAPI để xem chi tiết.";
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
    const top5 = Array.isArray(aiData.top5) ? aiData.top5.map(({ class: className, score }) => ({
      label: className,
      confidence: Math.round(Number(score) * 100),
    })) : [];
    const cnnDemo = aiData.cnn_demo ? {
      inputShape: aiData.cnn_demo.input_shape,
      classCount: aiData.cnn_demo.class_count,
      preprocessing: aiData.cnn_demo.preprocessing,
      convLayers: aiData.cnn_demo.conv_layers,
    } : null;
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
        top5,
        cnnDemo,
        gradcam: aiData.gradcam || null,
        gradcamClassIndex: aiData.gradcam_class_index,
      },
    });
  } catch (error) {
    console.error("identifySpecies error:", {
      code: error.code,
      message: error.message,
      status: error.response?.status,
      detail: error.response?.data,
    });
    res.status(error.response?.status || 503).json({ success: false, message: getAIServiceError(error) });
  }
};

export const generateGradcam = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng upload ảnh" });
    }

    const { class_index, gradcam_layer } = req.body;
    if (class_index === undefined) {
      return res.status(400).json({ success: false, message: "Thiếu lớp cần xem Grad-CAM" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
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
    console.error("generateGradcam error:", {
      code: error.code,
      message: error.message,
      status: error.response?.status,
      detail: error.response?.data,
    });
    res.status(error.response?.status || 503).json({ success: false, message: getAIServiceError(error) });
  }
};
