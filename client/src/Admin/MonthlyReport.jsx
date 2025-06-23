import React, { useEffect, useState } from "react";
import { FaSpinner, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchWithAuth } from "../utils/api";
import { useNavigate } from "react-router-dom";

const MonthlyReport = ({ aadharEntries = [], childEntries = [], phoneEntries = [] }) => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [localAadhar, setLocalAadhar] = useState([]);
  const [localChild, setLocalChild] = useState([]);
  const [localPhone, setLocalPhone] = useState([]);

  useEffect(() => {
    const fetchIfEmpty = async () => {
      if (!aadharEntries.length || !childEntries.length || !phoneEntries.length) {
        try {
          const [aadhar, child, phone] = await Promise.all([
            fetchWithAuth(`${import.meta.env.VITE_API_URL}/aadhar`, {}, navigate),
            fetchWithAuth(`${import.meta.env.VITE_API_URL}/child`, {}, navigate),
            fetchWithAuth(`${import.meta.env.VITE_API_URL}/phone`, {}, navigate),
          ]);
          setLocalAadhar(aadhar);
          setLocalChild(child);
          setLocalPhone(phone);
        } catch (err) {
          toast.error("Failed to fetch monthly data.");
        }
      } else {
        setLocalAadhar(aadharEntries);
        setLocalChild(childEntries);
        setLocalPhone(phoneEntries);
      }
    };

    fetchIfEmpty();
  }, [aadharEntries, childEntries, phoneEntries, navigate]);

  useEffect(() => {
    if (localAadhar.length || localChild.length || localPhone.length) {
      groupMonthlyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localAadhar, localChild, localPhone]);

  const groupMonthlyData = () => {
    const grouped = {};

    const pushEntries = (entries, type) => {
      entries.forEach((entry) => {
        const day = entry.date;
        if (!grouped[day]) {
          grouped[day] = { aadhar: [], child: [], phone: [] };
        }
        grouped[day][type].push(entry);
      });
    };

    pushEntries(localAadhar, "aadhar");
    pushEntries(localChild, "child");
    pushEntries(localPhone, "phone");

    const sortedDates = Object.keys(grouped).sort(
      (a, b) =>
        new Date(a.split("/").reverse().join("-")) -
        new Date(b.split("/").reverse().join("-"))
    );

    const dailyData = sortedDates.map((date) => ({
      date,
      dateFormatted: date,
      aadhar: grouped[date].aadhar,
      child: grouped[date].child,
      phone: grouped[date].phone,
    }));

    setReportData(dailyData);
    setIsLoading(false);
  };

  const getTotals = (entries) => {
    const count = entries.reduce((sum, e) => sum + e.count, 0);
    const subtotal = entries.reduce((sum, e) => sum + e.subtotal, 0);
    return { count, subtotal };
  };

  const getOverallTotals = () => {
    let totalCount = 0;
    let totalAmount = 0;
    reportData.forEach((day) => {
      totalCount +=
        getTotals(day.aadhar).count +
        getTotals(day.child).count +
        getTotals(day.phone).count;
      totalAmount +=
        getTotals(day.aadhar).subtotal +
        getTotals(day.child).subtotal +
        getTotals(day.phone).subtotal;
    });
    return { totalCount, totalAmount };
  };

  const savePDF = () => {
    const doc = new jsPDF();
    const categoryLabels = {
      aadhar: "Aadhar Entries",
      child: "Child Enrolment",
      phone: "Phone Enrolment",
    };

    reportData.forEach((day, index) => {
      if (index > 0) doc.addPage();
      doc.setFontSize(18);
      doc.text("Monthly Report", 14, 15);
      doc.setFontSize(15);
      doc.text(day.dateFormatted || day.date, 14, 25);

      let currentY = 33;

      ["aadhar", "child", "phone"].forEach((cat) => {
        doc.setFontSize(13);
        doc.setTextColor(30, 64, 175);
        doc.text(categoryLabels[cat], 14, currentY);
        currentY += 6;

        const entries = day[cat] || [];
        const body = entries.length
          ? entries.map((e) => [
              `${e.date} ${e.time}`,
              e.count,
              `₹${e.price}`,
              `₹${e.subtotal}`,
            ])
          : [["No records available", "", "", ""]];

        autoTable(doc, {
          startY: currentY,
          head: [["Date & Time", "Count", "Price", "Subtotal"]],
          body,
          theme: "grid",
          styles: { fontSize: 11, cellPadding: 3 },
          headStyles: { fillColor: [59, 130, 246], fontSize: 12 },
          margin: { left: 14, right: 14 },
        });

        currentY = doc.lastAutoTable.finalY + 6;
      });

      const a = getTotals(day.aadhar);
      const c = getTotals(day.child);
      const p = getTotals(day.phone);
      const count = a.count + c.count + p.count;
      const amount = a.subtotal + c.subtotal + p.subtotal;

      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      currentY += 8;
      doc.text("End of Day Summary", 18, currentY);
      currentY += 8;
      doc.setFont(undefined, "normal");
      doc.text(
        `Aadhar: ${a.count} × ₹${a.subtotal.toLocaleString()} | Child: ${c.count} × ₹${c.subtotal.toLocaleString()} | Phone: ${p.count} × ₹${p.subtotal.toLocaleString()}`,
        14,
        currentY
      );
      currentY += 7;
      doc.text(
        `Total Entries: ${count} | Total Amount: ₹${amount.toLocaleString()}`,
        14,
        currentY
      );
      currentY += 6;
      doc.setLineWidth(0.5);
      doc.line(14, currentY, 196, currentY);
    });

    doc.addPage();
    doc.setFontSize(18);
    doc.text("Grand Totals for the Month", 14, 20);

    const totals = getOverallTotals();
    const countA = localAadhar.reduce((sum, e) => sum + e.count, 0);
    const countC = localChild.reduce((sum, e) => sum + e.count, 0);
    const countP = localPhone.reduce((sum, e) => sum + e.count, 0);
    const grandCount = countA + countC + countP;

    let y = 35;
    doc.setFontSize(13);
    doc.setFont(undefined, "normal");
    doc.text(`Aadhar Total: ${countA} entries`, 14, y);
    doc.text(`Child Total: ${countC} entries`, 14, (y += 8));
    doc.text(`Phone Total: ${countP} entries`, 14, (y += 8));
    doc.text(`Overall Total: ${grandCount} entries`, 14, (y += 8));

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 128, 0);
    doc.text(`Total Income for the Month: ₹${totals.totalAmount.toLocaleString()}`, 14, (y += 10));

    const now = new Date().toISOString().split("T")[0];
    doc.save(`Monthly_Report_${now}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  const { totalCount, totalAmount } = getOverallTotals();

  return (
     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-blue-800">📅 Monthly Enrolment Summary</h2>
          <button
            onClick={savePDF}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            <FaDownload /> Export PDF
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reportData.map((day, index) => {
                const a = getTotals(day.aadhar);
                const c = getTotals(day.child);
                const p = getTotals(day.phone);
                const total = a.count + c.count + p.count;
                const amount = a.subtotal + c.subtotal + p.subtotal;

                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">{day.dateFormatted}</h3>
                    <p className="text-base text-gray-800 mb-1">
                      💰 <span className="font-medium">Day Total (Price):</span> {amount.toLocaleString()}
                    </p>
                    <p className="text-base text-gray-800">
                      📊 <span className="font-medium">Entries:</span> Aadhar: {a.count}, Child: {c.count}, Phone: {p.count},{" "}
                      <span className="font-medium">Overall:</span> {total}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 bg-blue-100 border border-blue-300 rounded-lg shadow p-6 text-center">
              <h4 className="text-xl font-bold text-blue-800 mb-2">📊 Grand Totals (Last 30 Days)</h4>
              <p className="text-lg font-semibold text-gray-900">
                Total Enrolments: {totalCount} — Total Amount: {totalAmount.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>

  );
};

export default MonthlyReport;
