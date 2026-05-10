import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import cloudinary from "../configs/cloudinary.js";
import Animal from "../models/Animal.js";

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const dataPath = path.join(__dirname, "../data/animals.json");
    const animals = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    console.log(`Found ${animals.length} animals in JSON`);

    const imagesDir = path.join(__dirname, "../data/images");
    let successCount = 0;

    for (const animal of animals) {
      const { label } = animal;
      const imagePath = path.join(imagesDir, `${label}.webp`);

      if (!fs.existsSync(imagePath)) {
        console.warn(`Skipping ${label}: image file not found at ${imagePath}`);
        continue;
      }

      const existingAnimal = await Animal.findOne({ label });
      if (existingAnimal?.imageUrl) continue;

      console.log(`Uploading ${label}...`);

      const uploadResult = await cloudinary.uploader.upload(imagePath, { folder: "animals" });

      console.log(`Uploaded: ${uploadResult.secure_url}`);

      await Animal.findOneAndUpdate(
        { label },
        {
          label,
          vietnameseName: animal.vietnameseName,
          description: animal.description,
          imageUrl: uploadResult.secure_url,
        },
        { upsert: true, new: true }
      );

      console.log(`Saved [${animal.vietnameseName}] to Database\n`);
      successCount++;
    }

    console.log(`Done. Added ${successCount} animal(s) to Database.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
