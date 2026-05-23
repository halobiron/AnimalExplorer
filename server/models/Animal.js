import mongoose from "mongoose";

const animalSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      unique: true,
    },
    vietnameseName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Animal = mongoose.model("Animal", animalSchema);
export default Animal;
