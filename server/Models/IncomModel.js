import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: "dd/mm/yyyy"
  time: { type: String },
  count: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  category: {
    type: String,
    enum: ["aadhar", "child", "phone"],
    required: true,
  },
});

export default mongoose.model("Entry", EntrySchema);
