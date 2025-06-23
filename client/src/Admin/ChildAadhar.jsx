import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaSpinner, FaTrash } from "react-icons/fa";
import { fetchWithAuth } from "../utils/api";
import { useNavigate } from "react-router-dom";

const ChildAadhar = () => {
  const [count, setCount] = useState("");
  const [price, setPrice] = useState("");
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/child/`, {}, navigate);
      const today = new Date().toLocaleDateString();
      const todayEntries = data.filter((entry) => entry.date === today);
      setEntries(todayEntries);

      if (todayEntries.length === 0) {
        toast.info("No entries found for today.");
      }
    } catch (error) {
      toast.error("Error fetching entries!");
      console.error("Error fetching entries:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    toast.info("Processing entry...");

    const newEntry = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      count: Number(count),
      price: Number(price),
      subtotal: Number(count) * Number(price),
    };

    try {
      const saved = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/child/`,
        {
          method: "POST",
          body: JSON.stringify(newEntry),
        },
        navigate
      );

      setEntries((prev) => [...prev, saved]);
      toast.success("Entry saved successfully!");
      setCount("");
      setPrice("");
    } catch (error) {
      toast.error("Failed to save entry!");
      console.error("Error saving entry:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/child/${id}`,
        { method: "DELETE" },
        navigate
      );

      setEntries((prev) => prev.filter((entry) => entry._id !== id));
      toast.success("Entry removed successfully!");
    } catch (error) {
      toast.error("Failed to delete entry!");
      console.error("Error deleting entry:", error.message);
    }
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 bg-gray-100 min-h-screen text-xs sm:text-sm">
      <div className="w-full sm:w-[90%] md:w-[90%] lg:w-full mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-blue-600 text-center">
          📌 Child Aadhar Enrolment (Today)
        </h2>

        {/* Entry Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
        >
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Child Enrolment Count
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Each Enrolment Price (Rs.)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              {isLoading ? "Processing..." : "Add Entry"}
            </button>
          </div>
        </form>

        {/* Entries Table */}
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-4">
            📜 Today's Child Aadhar Records
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <FaSpinner className="animate-spin text-blue-500 text-3xl" />
            </div>
          ) : entries.length > 0 ? (
            <div className="w-full min-w-[500px]">
              <table className="w-full table-auto text-xs sm:text-sm border border-gray-300">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    {["#", "Count", "Price", "Subtotal", "Time", "Remove"].map((header) => (
                      <th key={header} className="px-2 sm:px-3 py-2 font-semibold text-left">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry._id || index} className="border-t text-gray-700">
                      <td className="px-2 sm:px-3 py-2">{index + 1}</td>
                      <td className="px-2 sm:px-3 py-2">{entry.count}</td>
                      <td className="px-2 sm:px-3 py-2">₹{entry.price}</td>
                      <td className="px-2 sm:px-3 py-2">₹{entry.subtotal}</td>
                      <td className="px-2 sm:px-3 py-2">{entry.time}</td>
                      <td className="px-2 sm:px-3 py-2">
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8 italic">
              😔 No entries made today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildAadhar;
