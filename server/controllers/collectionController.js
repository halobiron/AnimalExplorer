import Collection from "../models/Collection.js";

export const getCollection = async (req, res) => {
  try {
    const items = await Collection.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error("getCollection error:", error.message);
    res.status(500).json({ success: false, message: "Lỗi lấy bộ sưu tập" });
  }
};
