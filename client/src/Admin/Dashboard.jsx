import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AadharEnrolmentTable from "./Aadhaarenrolment";
import ChildAadhar from "./ChildAadhar";
import PhoneNumber from "./Phonenumber";
import TodayReport from "./Todayreport";
import WeeklyReport from "./WeeklyReport";
import ChartSection from "./Chart Report";
import MonthlyReport from "./MonthlyReport";
import IncomeChart from "./IncomeChart";

const Dashboard = ({ onLogout }) => {
  const [activePage, setActivePage] = useState("enrolment");
  const [aadharEntries, setAadharEntries] = useState([]);
  const [childEntries, setChildEntries] = useState([]);
  const [phoneEntries, setPhoneEntries] = useState([]);

  // ✅ Fetch data from backend on load
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const [aadharRes, childRes, phoneRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/aadhar/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/child/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/phone/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!aadharRes.ok || !childRes.ok || !phoneRes.ok)
        throw new Error("Failed to fetch data");

      const [aadharData, childData, phoneData] = await Promise.all([
        aadharRes.json(),
        childRes.json(),
        phoneRes.json(),
      ]);

      setAadharEntries(aadharData);
      setChildEntries(childData);
      setPhoneEntries(phoneData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case "enrolment":
        return (
          <AadharEnrolmentTable
            entries={aadharEntries}
            setEntries={setAadharEntries}
          />
        );
      case "child":
        return (
          <ChildAadhar entries={childEntries} setEntries={setChildEntries} />
        );
      case "phone":
        return (
          <PhoneNumber entries={phoneEntries} setEntries={setPhoneEntries} />
        );
      case "today":
        return (
          <TodayReport
            aadharEntries={aadharEntries}
            childEntries={childEntries}
            phoneEntries={phoneEntries}
          />
        );
      case "weekly":
        return (
          <WeeklyReport
            aadharEntries={aadharEntries}
            childEntries={childEntries}
            phoneEntries={phoneEntries}
          />
        );
      case "chart":
        return (
          <ChartSection
            aadharEntries={aadharEntries}
            childEntries={childEntries}
            phoneEntries={phoneEntries}
          />
        );
      case "monthly":
        return (
          <MonthlyReport
            aadharEntries={aadharEntries}
            childEntries={childEntries}
            phoneEntries={phoneEntries}
          />)
          case "income":
        return (
          <IncomeChart
            aadharEntries={aadharEntries}
            childEntries={childEntries}
            phoneEntries={phoneEntries}
          />
        );
      default:
        return (
          <AadharEnrolmentTable
            entries={aadharEntries}
            setEntries={setAadharEntries}
          />
        );
    }
  };

  return (
    <div className="flex">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={onLogout}
      />
      <main className="flex-1 bg-light min-h-screen">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
