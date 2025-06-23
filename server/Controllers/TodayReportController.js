import AadharEnrolment from "../Models/AadharEnrolment.js";
import ChildAadhar from "../Models/ChildAadhar.js";
import PhoneEnrolment from "../Models/PhoneNumber.js";
import WeeklyReport from "../Models/WeeklyReportModel.js";

// ✅ Get Today's Report
export const getTodayReport = async (req, res) => {
  try {
    const todayDate = new Date().toLocaleDateString();

    const aadharEntries = await AadharEnrolment.find({ date: todayDate });
    const childEntries = await ChildAadhar.find({ date: todayDate });
    const phoneEntries = await PhoneEnrolment.find({ date: todayDate });

    res.json({ aadharEntries, childEntries, phoneEntries });
  } catch (error) {
    res.status(500).json({ message: "Error fetching today's report", error });
  }
};



