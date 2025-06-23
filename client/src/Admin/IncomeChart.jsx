import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchWithAuth } from "../utils/api";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Chart = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [todayIncome, setTodayIncome] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyData, totalData] = await Promise.all([
          fetchWithAuth(`${import.meta.env.VITE_API_URL}/income/daily`, {}, navigate),
          fetchWithAuth(`${import.meta.env.VITE_API_URL}/income/total`, {}, navigate),
        ]);

        const dailyIncome = dailyData.dailyIncome || [];
        setIncomeData(dailyIncome);
        setTotalIncome(totalData.totalIncome || 0);

        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();
        const todayStr = `${dd}/${mm}/${yyyy}`;

        const todayEntry = dailyIncome.find((entry) => entry.date === todayStr);
        setTodayIncome(todayEntry?.amount || 0);
      } catch (err) {
        console.error("Error loading income chart:", err.message);
      }
    };

    fetchData();
  }, [navigate]);

  const labels = incomeData.map((entry) => entry.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Income (₹)",
        data: incomeData.map((entry) => entry.amount),
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "#60a5fa"); // blue-400
          gradient.addColorStop(1, "#3b82f6"); // blue-500
          return gradient;
        },
        hoverBackgroundColor: "#2563eb", // blue-600
        borderRadius: { topLeft: 8, topRight: 8 },
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `₹${ctx.raw.toLocaleString()}`,
        },
      },
    },
    layout: { padding: 12 },
    scales: {
      x: {
        ticks: {
          font: { size: 11 },
          color: "#374151",
          maxRotation: 45,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
          color: "#374151",
          callback: (val) => `₹${val.toLocaleString()}`,
        },
        grid: { color: "#e5e7eb", borderDash: [4] },
      },
    },
  };

  return (
    <div className="mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-blue-800">
          💸 Daily Income Chart
        </h3>
        <div className="flex flex-wrap gap-3">
          <span className="text-sm sm:text-base font-medium text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded">
            Total: ₹{totalIncome.toLocaleString()}
          </span>
          <span className="text-sm sm:text-base font-medium text-green-800 bg-green-50 border border-green-200 px-3 py-1.5 rounded">
            Today: ₹{todayIncome.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="w-full">
        <Bar data={chartData} options={chartOptions} height={300} />
      </div>
    </div>
  );
};

export default Chart;
