import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  FaRegFileAlt,
  FaUsers,
  FaMoneyBillWave,
  FaSpinner,
  FaDownload,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

const TodayReport = () => {
  const [reportData, setReportData] = useState({
    aadharEntries: [],
    childEntries: [],
    phoneEntries: [],
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayReport();
  }, []);

  const fetchTodayReport = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/today`, {}, navigate);
      setReportData(data);
    } catch (error) {
      console.error("Error fetching today's report:", error.message);
      toast.error("Failed to load today's report!");
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { label: "Aadhar Enrolment", entries: reportData.aadharEntries },
    { label: "Child Aadhar Enrolment", entries: reportData.childEntries },
    { label: "Phone Number Enrolment", entries: reportData.phoneEntries },
  ];

  const hasData = sections.some((section) => section.entries.length > 0);

  const savePDF = () => {
    if (!hasData) {
      toast.error("No records available to download!");
      return;
    }

    try {
      setIsDownloading(true);

      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("Today Report", 14, 15);

      autoTable(doc, {
        head: [["#", "Category", "Date", "Enrolment Count", "Earnings"]],
        body: [
          ...sections.flatMap(({ label, entries }) =>
            entries.map((entry, index) => [
              index + 1,
              label,
              entry.date,
              entry.count,
              `Rs. ${entry.subtotal.toLocaleString("en-IN")}`,
            ])
          ),
          [
            { content: "Grand Total", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } },
            {
              content: sections
                .reduce((total, section) => total + section.entries.reduce((sum, e) => sum + e.count, 0), 0)
                .toLocaleString("en-IN"),
              styles: { fontStyle: "bold" },
            },
            {
              content: "Rs. " +
                sections
                  .reduce((total, section) => total + section.entries.reduce((sum, e) => sum + e.subtotal, 0), 0)
                  .toLocaleString("en-IN"),
              styles: { fontStyle: "bold" },
            },
          ],
        ],
        theme: "grid",
        startY: 25,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 10,
          textColor: [34, 34, 34],
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 14, right: 14 },
      });

      const todayDate = new Date().toISOString().split("T")[0];
      const fileName = `Today_Report_${todayDate}.pdf`;

      doc.save(fileName);
      toast.success(`Report downloaded: ${fileName}`);
    } catch (error) {
      console.error("Error saving PDF:", error.message);
      toast.error("Failed to download PDF!");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-dark flex items-center gap-2">
        <FaRegFileAlt className="text-primary" /> Today Report
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-80">
          <FaSpinner className="animate-spin text-blue-500 text-5xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map(({ label, entries }, index) => {
              const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
              const totalEarnings = entries.reduce((sum, entry) => sum + entry.subtotal, 0);

              return (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-5 bg-white shadow"
                >
                  <h3 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                    <FaUsers className="text-secondary" />
                    {label}
                  </h3>

                  {entries.length > 0 ? (
                    <>
                      <p className="text-base sm:text-lg">
                        Total Enrolment Count:{" "}
                        <span className="font-bold">{totalCount}</span>
                      </p>
                      <p className="text-base sm:text-lg">
                        Total Earnings:{" "}
                        <span className="font-bold">Rs. {totalEarnings.toLocaleString("en-IN")}</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No records found today.</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 bg-primary text-white rounded-lg shadow p-5 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between gap-4 text-base sm:text-lg font-bold">
              <div className="flex items-center gap-2">
                <FaUsers />
                <span>
                  Total Enrolments:{" "}
                  {sections.reduce(
                    (total, section) =>
                      total + section.entries.reduce((sum, entry) => sum + entry.count, 0),
                    0
                  ).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave />
                <span>
                  Total Earnings: Rs.{" "}
                  {sections.reduce(
                    (total, section) =>
                      total + section.entries.reduce((sum, entry) => sum + entry.subtotal, 0),
                    0
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {hasData && (
            <div className="flex justify-center mt-8">
              <button
                onClick={savePDF}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300 flex items-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload /> Download Report as PDF
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TodayReport;
