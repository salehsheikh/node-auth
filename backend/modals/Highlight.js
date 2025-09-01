import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    story: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
    title: { type: String, default: "Highlights" }, 
  },
  { timestamps: true }
);

export default mongoose.model("Highlight", highlightSchema);
