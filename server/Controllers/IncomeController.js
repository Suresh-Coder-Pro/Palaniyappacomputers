import AadharEnrolment from "../Models/AadharEnrolment.js";
import ChildAadhar from "../Models/ChildAadhar.js";
import PhoneNumber from "../Models/PhoneNumber.js";

export const getTotalIncome = async (req, res) => {
  try {
    const [aadhar, child, phone] = await Promise.all([
      AadharEnrolment.find(),
      ChildAadhar.find(),
      PhoneNumber.find(),
    ]);

    const allEntries = [...aadhar, ...child, ...phone];

    const totalIncome = allEntries.reduce((sum, e) => sum + (e.subtotal || 0), 0);
    const totalEnrolment = allEntries.reduce((sum, e) => sum + (e.count || 0), 0);

    res.json({ totalEnrolment, totalIncome });
  } catch (err) {
    console.error("Total income error:", err);
    res.status(500).json({ error: "Failed to calculate total income" });
  }
};

export const getDailyIncome = async (req, res) => {
  try {
    const [aadhar, child, phone] = await Promise.all([
      AadharEnrolment.find(),
      ChildAadhar.find(),
      PhoneNumber.find(),
    ]);

    const allEntries = [...aadhar, ...child, ...phone];
    const incomeMap = {};

    allEntries.forEach(({ date, count, subtotal }) => {
      if (!date) return;
      if (!incomeMap[date]) incomeMap[date] = { count: 0, subtotal: 0 };
      incomeMap[date].count += count || 0;
      incomeMap[date].subtotal += subtotal || 0;
    });

    const dailyIncome = Object.entries(incomeMap)
      .map(([date, { count, subtotal }]) => ({ date, count, amount: subtotal }))
      .sort((a, b) => {
        const [da, ma, ya] = a.date.split("/");
        const [db, mb, yb] = b.date.split("/");
        return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
      });

    res.json({ dailyIncome });
  } catch (err) {
    console.error("Daily income error:", err);
    res.status(500).json({ error: "Failed to generate daily income" });
  }
};
