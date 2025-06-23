import mongoose from "mongoose";

const weeklyReportSchema = new mongoose.Schema({
  aadharEntries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AadharEnrolment",
    },
  ],
  childEntries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChildAadhar",
    },
  ],
  phoneEntries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhoneNumber",
    },
  ],
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

const WeeklyReport = mongoose.model("WeeklyReport", weeklyReportSchema);
export default WeeklyReport;
