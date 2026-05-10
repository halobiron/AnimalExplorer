import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const setAuthCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SEVEN_DAYS_MS,
  });
};

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });

    setAuthCookie(res, user._id);
    res.status(201).json({ success: true, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    const isValidPassword = user && await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    setAuthCookie(res, user._id);
    res.json({ success: true, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Đã đăng xuất" });
};

export const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};
