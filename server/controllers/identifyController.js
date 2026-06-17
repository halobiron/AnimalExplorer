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
    let vietnameseName = extractVietnameseName(aiData);
    let animalDetails = null;

    const dbAnimal = await Animal.findOne({ label: label.toLowerCase() }).catch(() => null);
    if (dbAnimal) {
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
        gradcam: aiData.gradcam || null,
      },
    });
  } catch (error) {
    console.error("identifySpecies error:", error.message);
    res.status(500).json({ success: false, message: "Lỗi nhận diện. Thử lại sau." });
  }
};
