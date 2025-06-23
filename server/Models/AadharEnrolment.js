import mongoose from "mongoose";

const AadharSchema = new mongoose.Schema({
  date: String,
  time: String,
  count: Number,
  price: Number,
  subtotal: Number,
});

const AadharEnrolment = mongoose.model("AadharEnrolment", AadharSchema);
export default AadharEnrolment;
