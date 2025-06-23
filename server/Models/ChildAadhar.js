import mongoose from "mongoose";

const ChildSchema = new mongoose.Schema({
  date: String,
  time: String,
  count: Number,
  price: Number,
  subtotal: Number,
});

const ChildAadhar = mongoose.model("ChildAadhar", ChildSchema);
export default ChildAadhar;
