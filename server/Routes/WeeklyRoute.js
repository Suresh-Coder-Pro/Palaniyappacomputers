// routes/weeklyReportRoutes.js
import express from "express";
import { getSmartWeeklyReport } from "../Controllers/WeeklyReportController.js";

const router = express.Router();

router.get("/", getSmartWeeklyReport);

export default router;
