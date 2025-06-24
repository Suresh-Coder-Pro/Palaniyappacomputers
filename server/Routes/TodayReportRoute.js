import express from "express";
import { getTodayReport } from "../Controllers/TodayReportController.js";

const router = express.Router();

router.get("/", getTodayReport);

export default router;
