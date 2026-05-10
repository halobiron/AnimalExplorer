import Animal from "../models/Animal.js";

export const getAllAnimals = async (req, res) => {
  try {
    const animals = await Animal.find({}).sort({ vietnameseName: 1 });
    res.json({ success: true, animals });
  } catch (error) {
    console.error("getAllAnimals error:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};
