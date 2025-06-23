import mongoose from "mongoose";

const PhoneSchema = new mongoose.Schema({
  date: String,
  time: String,
  count: Number,
  price: Number,
  subtotal: Number,
});

const PhoneNumber = mongoose.model("PhoneNumber", PhoneSchema);
export default PhoneNumber;
