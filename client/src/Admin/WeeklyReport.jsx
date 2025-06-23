import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaDownload, FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import { fetchWithAuth } from "../utils/api";
import { useNavigate } from "react-router-dom";

const WeeklyReport = () => {
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/weekly`, {}, navigate);
        setDays(data);
      } catch (error) {
        toast.error("Failed to load weekly report");
        console.error("Weekly report error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [navigate]);

  const getCategoryTotals = (entries) => {
    const countTotal = entries.reduce((sum, entry) => sum + Number(entry.count), 0);
    const subtotalTotal = entries.reduce((sum, entry) => sum + Number(entry.subtotal), 0);
    return { countTotal, subtotalTotal };
  };

  const getDayGrandTotal = (day) => {
    const aadhar = getCategoryTotals(day.entries.aadhar || []);
    const child = getCategoryTotals(day.entries.child || []);
    const phone = getCategoryTotals(day.entries.phone || []);
    return {
      count: aadhar.countTotal + child.countTotal + phone.countTotal,
      subtotal: aadhar.subtotalTotal + child.subtotalTotal + phone.subtotalTotal,
      aadharCount: aadhar.countTotal,
      childCount: child.countTotal,
      phoneCount: phone.countTotal,
    };
  };

  const displayDays = days.length > 6 ? days.slice(0, 6) : days;

  const savePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Weekly Report", 14, 15);
    let currentY = 25;

    displayDays.forEach((day) => {
      doc.setFontSize(14);
      doc.text(
        `${day.formatted}${day.isHoliday ? ` — ${day.holidayType}` : ""}`,
        14,
        currentY
      );
      currentY += 8;

      const categoryOrder = ["aadhar", "child", "phone"];
      const categoryNames = {
        aadhar: "Aadhar Entries",
        child: "Child Enrolment",
        phone: "Phone Enrolment",
      };

      categoryOrder.forEach((cat) => {
        doc.setFontSize(13);
        doc.text(categoryNames[cat], 14, currentY);
        currentY += 6;

        const body = (day.entries[cat] || []).map((entry) => [
          `${entry.date} ${entry.time}`,
          entry.count,
          entry.price,
          entry.subtotal,
        ]);

        if (body.length === 0) body.push(["No records available", "", "", ""]);

        autoTable(doc, {
          startY: currentY,
          head: [["Date & Time", "Count", "Price", "Subtotal"]],
          body,
          theme: "grid",
          styles: { fontSize: 12, cellPadding: 4 },
          headStyles: { fillColor: [30, 64, 175] },
          margin: { left: 14, right: 14 },
        });

        currentY = doc.lastAutoTable.finalY + 8;
      });

      const totals = getDayGrandTotal(day);
      doc.setFontSize(12);
      doc.text(
        `Day Entries – Aadhar: ${totals.aadharCount}  Child: ${totals.childCount}  Phone: ${totals.phoneCount}  Overall: ${totals.count}`,
        14,
        currentY
      );
      currentY += 10;
      doc.setLineWidth(0.5);
      doc.line(14, currentY, 196, currentY);
      currentY += 10;
    });

    doc.setFontSize(14);
    doc.text("Grand Totals for the Week", 14, currentY);
    currentY += 8;

    const grand = displayDays.reduce(
      (acc, d) => {
        const day = getDayGrandTotal(d);
        return {
          aadhar: acc.aadhar + day.aadharCount,
          child: acc.child + day.childCount,
          phone: acc.phone + day.phoneCount,
          overall: acc.overall + day.count,
        };
      },
      { aadhar: 0, child: 0, phone: 0, overall: 0 }
    );

    doc.setFontSize(12);
    doc.text(`Aadhar Total: ${grand.aadhar} entries`, 14, currentY);
    doc.text(`Child Total: ${grand.child} entries`, 14, (currentY += 8));
    doc.text(`Phone Total: ${grand.phone} entries`, 14, (currentY += 8));
    doc.text(`Overall Total: ${grand.overall} entries`, 14, (currentY += 8));

    const dateStr = format(new Date(), "yyyy-MM-dd");
    doc.save(`Weekly_Report_${dateStr}.pdf`);
  };  return (
<div className="p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen">
  <ToastContainer />
  <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-blue-700">📅 Weekly Report</h2>

  {isLoading ? (
    <div className="flex justify-center items-center h-40">
      <FaSpinner className="animate-spin text-5xl text-blue-600" />
    </div>
  ) : (
    <>
      {/* Daily Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {displayDays.map((day, idx) => {
          const dayTotals = getDayGrandTotal(day);

          if (dayTotals.count === 0) {
            return (
              <div key={idx} className="bg-white border border-gray-300 rounded-lg p-6 text-center text-gray-600 shadow col-span-1">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{day.formatted}</h3>
                <p>No records available</p>
              </div>
            );
          }

          return (
            <div key={idx} className="bg-white border border-blue-200 rounded-lg shadow p-6 col-span-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <h3 className="text-xl sm:text-2xl font-semibold text-blue-800 mb-2 md:mb-0">
                  {day.formatted}
                  {day.isHoliday && <span className="text-red-600"> — {day.holidayType}</span>}
                </h3>
                <div className="text-base sm:text-lg text-gray-700">
                  Day Total (Price): Rs. {dayTotals.subtotal}
                </div>
              </div>

              <div className="text-base text-gray-600 mt-2 mb-4">
                Entries Count – Aadhar: {dayTotals.aadharCount}, Child: {dayTotals.childCount}, Phone: {dayTotals.phoneCount}, Overall: {dayTotals.count}
              </div>

              {["aadhar", "child", "phone"].map((section) => (
                <div key={section} className="mt-5">
                  <h4 className="text-lg sm:text-xl font-bold text-blue-700 border-b pb-2 mb-3">
                    {section === "aadhar"
                      ? "Aadhar Entries"
                      : section === "child"
                      ? "Child Enrolment"
                      : "Phone Enrolment"}
                  </h4>

                  {day.entries[section]?.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm sm:text-base">
                        <thead>
                          <tr className="bg-blue-600 text-white">
                            <th className="py-2 px-2">Date & Time</th>
                            <th className="py-2 px-2">Count</th>
                            <th className="py-2 px-2">Price</th>
                            <th className="py-2 px-2">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.entries[section].map((entry, i) => (
                            <tr key={i} className="border-b border-blue-100">
                              <td className="py-2 px-2">{`${entry.date} ${entry.time}`}</td>
                              <td className="py-2 px-2">{entry.count}</td>
                              <td className="py-2 px-2">Rs. {entry.price}</td>
                              <td className="py-2 px-2">Rs. {entry.subtotal}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan="3" className="font-bold text-right py-2 px-2">
                              {section === "aadhar"
                                ? "Aadhar Total (Price):"
                                : section === "child"
                                ? "Child Total (Price):"
                                : "Phone Total (Price):"}
                            </td>
                            <td className="font-bold py-2 px-2">
                              Rs. {getCategoryTotals(day.entries[section]).subtotalTotal}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No {section} records available</p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Grand Totals */}
      <div className="max-w-7xl mx-auto mt-10 p-6 sm:p-8 border border-blue-300 rounded-lg bg-blue-50 shadow-lg">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center text-blue-800">
          Grand Totals for the Week (6 Days)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base sm:text-lg text-dark">
          <p>
            Aadhar Total:{" "}
            {displayDays.reduce((t, d) => t + getCategoryTotals(d.entries.aadhar).countTotal, 0)} entries — Rs.{" "}
            {displayDays.reduce((t, d) => t + getCategoryTotals(d.entries.aadhar).subtotalTotal, 0)}
          </p>
          <p>
            Child Total:{" "}
            {displayDays.reduce((t, d) => t + getCategoryTotals(d.entries.child).countTotal, 0)} entries — Rs.{" "}
            {displayDays.reduce((t, d) => t + getCategoryTotals(d.entries.child).subtotalTotal, 0)}
          </p>
          <p>
            Phone Total:{" "}
            {displayDays.reduce((t, d) => t + getCategoryTotals(d.entries.phone).countTotal, 0)} entries — Rs.{" "}
            {displayDays.reduce((t, d) => t + getCategoryTotals(d.entries.phone).subtotalTotal, 0)}
          </p>
          <p>
            Child + Phone Total:{" "}
            {displayDays.reduce((t, d) =>
              t +
              getCategoryTotals(d.entries.child).countTotal +
              getCategoryTotals(d.entries.phone).countTotal, 0
            )} entries — Rs.{" "}
            {displayDays.reduce((t, d) =>
              t +
              getCategoryTotals(d.entries.child).subtotalTotal +
              getCategoryTotals(d.entries.phone).subtotalTotal, 0
            )}
          </p>
          <p className="font-bold col-span-1 sm:col-span-2">
            Grand Total:{" "}
            {displayDays.reduce((t, d) => t + getDayGrandTotal(d).count, 0)} entries — Rs.{" "}
            {displayDays.reduce((t, d) => t + getDayGrandTotal(d).subtotal, 0)}
          </p>
        </div>
      </div>

      {/* PDF Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={savePDF}
          className="bg-blue-700 hover:bg-blue-900 text-white font-bold px-10 py-4 rounded-lg flex items-center gap-4 text-xl"
        >
          <FaDownload /> Download Weekly Report
        </button>
      </div>
    </>
  )}
</div>
  );
};

export default WeeklyReport;
