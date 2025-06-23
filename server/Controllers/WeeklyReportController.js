// controllers/weeklyReportController.js
import AadharEnrolment from "../Models/AadharEnrolment.js";
import ChildAadhar from "../Models/ChildAadhar.js";
import PhoneEnrolment from "../Models/PhoneNumber.js";
import { format } from "date-fns";

/**
 * GET /api/weekly-report
 * Aggregates records for the past 7 days.
 * Dates are converted to "d/M/yyyy" so documents stored with that string format are matched.
 */
export const getSmartWeeklyReport = async (req, res) => {
  try {
    const today = new Date();
    const week = [];

    // List of government holidays as input dates (in ISO format) that we'll then convert.
    const govtHolidaysInput = ["2024-06-19", "2024-06-21"];
    const formattedGovtHolidays = govtHolidaysInput.map((dateStr) => {
      const parsed = new Date(dateStr);
      return format(parsed, "d/M/yyyy");
    });

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // Convert each day into the string format stored in your database
      const queryDate = format(date, "d/M/yyyy");
      // Format the display date differently if desired (here: "EEE, dd MMM yyyy")
      const displayDate = format(date, "EEE, dd MMM yyyy");

      // Determine if the day is Sunday or a government holiday
      const isSunday = date.getDay() === 0;
      const isGovHoliday = formattedGovtHolidays.includes(queryDate);

      // Query the collections for this day using an exact string match.
      const [aadhar, child, phone] = await Promise.all([
        AadharEnrolment.find({ date: queryDate }),
        ChildAadhar.find({ date: queryDate }),
        PhoneEnrolment.find({ date: queryDate }),
      ]);

      week.push({
        date: queryDate,
        formatted: displayDate,
        isHoliday: isSunday || isGovHoliday,
        // Label day as "Government Holiday" or "Office Holiday" if it’s a Sunday.
        holidayType: isGovHoliday ? "Government Holiday" : isSunday ? "Office Holiday" : null,
        entries: {
          aadhar,
          child,
          phone,
        },
      });
    }

    // Reverse so that the oldest day comes first (chronological order)
    res.status(200).json(week.reverse());
  } catch (error) {
    console.error("Weekly Smart Report Error:", error);
    res.status(500).json({ message: "Error generating weekly report", error });
  }
};
