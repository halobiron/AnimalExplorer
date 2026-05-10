import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    vietnameseName: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    bestConfidence: {
      type: Number,
      required: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

collectionSchema.index({ userId: 1, label: 1 }, { unique: true });

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;
