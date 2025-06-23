import {
  FaIdCard,
  FaChild,
  FaPhone,
  FaRegChartBar,
  FaCalendarAlt,
  FaSignOutAlt,
  FaChartPie,
  FaCalendar,
  FaMoneyCheckAlt
} from "react-icons/fa";

const Sidebar = ({ activePage, setActivePage, onLogout }) => {
  const menuItems = [
    { key: "enrolment", label: "Aadhar Enrolment", icon: <FaIdCard /> },
    { key: "child", label: "Child Aadhar", icon: <FaChild /> },
    { key: "phone", label: "Phone Number", icon: <FaPhone /> },
    { key: "today", label: "Today Report", icon: <FaRegChartBar /> },
    { key: "weekly", label: "Weekly Report", icon: <FaCalendarAlt /> },
    { key: "monthly", label: "Monthly Report", icon: <FaCalendar /> },
    { key: "chart", label: "Chart Report", icon: <FaChartPie /> },
    { key: "income", label: "Income Report", icon: <FaMoneyCheckAlt /> },
  ];

  return (
    <aside className="bg-dark text-light min-h-screen p-4 flex flex-col w-20 md:w-64 transition-all duration-300">
      {/* Logo Section */}
      <div className="text-center py-4">
        <img
          src="https://static.vecteezy.com/system/resources/previews/020/429/953/original/admin-icon-vector.jpg"
          alt="App Logo"
          className="rounded-full w-10 md:w-16 mx-auto"
        />
      </div>

      {/* Navigation Menu */}
      <ul className="flex-grow">
        {menuItems.map((item) => (
          <li
            key={item.key}
            onClick={() => setActivePage(item.key)}
            className={`flex items-center justify-center md:justify-start p-3 my-2 rounded cursor-pointer hover:bg-secondary transition-colors ${
              activePage === item.key ? "bg-secondary" : ""
            }`}
          >
            <div className="text-xl">{item.icon}</div>
            <span className="ml-2 hidden md:inline">{item.label}</span>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="mt-auto w-full bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded flex items-center justify-center md:justify-start gap-2 transition"
      >
        <FaSignOutAlt />
        <span className="hidden md:inline">Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
