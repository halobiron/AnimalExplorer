import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/authRoutes.js";
import identifyRoutes from "./routes/identifyRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import animalRoutes from "./routes/animalRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/identify", identifyRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/quiz", quizRoutes);

app.get("/", (req, res) => res.json({ message: "Species API is running" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
