import express from "express";
import { getCollection } from "../controllers/collectionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCollection);

export default router;
