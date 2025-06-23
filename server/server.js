import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Import route handlers
import aadharRoutes from "./Routes/AadharRoute.js";
import childRoutes from "./Routes/ChildRoute.js";
import phoneRoutes from "./Routes/PhoneRoute.js";
import incomeRoutes from "./Routes/IncomeRoute.js";
import todayRoutes from "./Routes/TodayReportRoute.js";
import weeklyRoutes from "./Routes/WeeklyRoute.js";
import loginRoute from "./Routes/LoginRoute.js"
// Middleware
import { authenticate } from "./middleware/authenticate.js";

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Protected routes
app.use("/login",loginRoute)
app.use("/aadhar", authenticate, aadharRoutes);
app.use("/child", authenticate, childRoutes);
app.use("/phone", authenticate, phoneRoutes);
app.use("/income", authenticate, incomeRoutes);
app.use("/today", authenticate, todayRoutes);
app.use("/weekly", authenticate, weeklyRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// MongoDB connection + server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
