import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import { FaFileCsv, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip);

const ChartSection = () => {
  const [aadharEntries, setAadharEntries] = useState([]);
  const [childEntries, setChildEntries] = useState([]);
  const [phoneEntries, setPhoneEntries] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [todayIncome, setTodayIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const today = new Date();
  const dd = today.getDate();
  const mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  const todayStr = `${dd}/${mm}/${yyyy}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aadhar, child, phone] = await Promise.all([
          fetchWithAuth(`${import.meta.env.VITE_API_URL}/aadhar`, {}, navigate),
          fetchWithAuth(`${import.meta.env.VITE_API_URL}/child`, {}, navigate),
          fetchWithAuth(`${import.meta.env.VITE_API_URL}/phone`, {}, navigate),
        ]);
        setAadharEntries(aadhar);
        setChildEntries(child);
        setPhoneEntries(phone);
      } catch (err) {
        console.error("Failed to load data:", err.message);
        toast.error("Failed to fetch chart data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const grouped = {};
    let income = 0;

    const accumulate = (entries, category) => {
      entries.forEach(({ date, count, subtotal }) => {
        if (!grouped[date]) {
          grouped[date] = { aadhar: 0, child: 0, phone: 0 };
        }
        grouped[date][category] += count;

        if (date === todayStr) {
          income += subtotal || 0;
        }
      });
    };

    accumulate(aadharEntries, "aadhar");
    accumulate(childEntries, "child");
    accumulate(phoneEntries, "phone");

    setGroupedData(grouped);
    setTodayIncome(income);
  }, [aadharEntries, childEntries, phoneEntries]);

  const dates = Object.keys(groupedData).sort(
    (a, b) =>
      new Date(a.split("/").reverse().join("-")) -
      new Date(b.split("/").reverse().join("-"))
  );

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: "Aadhar",
        data: dates.map((d) => groupedData[d].aadhar),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Child",
        data: dates.map((d) => groupedData[d].child),
        backgroundColor: "#10b981",
      },
      {
        label: "Phone",
        data: dates.map((d) => groupedData[d].phone),
        backgroundColor: "#f59e0b",
      },
    ],
  };

  const exportCSV = () => {
    const rows = [
      ["Date", "Aadhar Count", "Child Count", "Phone Count"],
      ...dates.map((d) => [
        d,
        groupedData[d].aadhar,
        groupedData[d].child,
        groupedData[d].phone,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "enrolment_chart_data.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-800">
            📊 Enrolment Overview by Date
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="text-sm sm:text-base font-medium text-gray-800 bg-green-100 border border-green-300 px-3 py-1.5 rounded">
              💰 Today's Income: ₹{todayIncome.toLocaleString()}
            </div>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition"
            >
              <FaFileCsv className="text-base" /> Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <FaSpinner className="animate-spin text-3xl text-blue-500" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[320px] sm:min-w-full" style={{ minHeight: "400px" }}>
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: { font: { size: 14 } },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          font: { size: 12 },
                          autoSkip: true,
                          maxRotation: 45,
                        },
                      },
                      y: {
                        beginAtZero: true,
                        ticks: { font: { size: 12 } },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
