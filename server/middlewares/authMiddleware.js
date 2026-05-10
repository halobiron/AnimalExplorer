import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Người dùng không tồn tại" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

export default authMiddleware;
