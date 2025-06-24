import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("isLoggedIn", "true");

      toast.success("Login successful!");
      
      if (onLogin) onLogin(); // Ensure `onLogin` exists before calling
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light p-6">
      <ToastContainer />
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="bg-secondary shadow-lg rounded px-8 py-10">
          <div className="flex justify-center mb-6">
            <FaUserCircle size={64} className="text-primary" />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="block text-light font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-dark rounded focus:ring-2 focus:ring-primary text-dark"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-light font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-dark rounded focus:ring-2 focus:ring-primary text-dark"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2 font-bold rounded transition-colors duration-300 ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-primary hover:bg-dark text-light"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
