import express from "express";
import { getDailyIncome,getTotalIncome } from "../Controllers/IncomeController.js";

const router = express.Router();
router.get("/total", getTotalIncome);
router.get("/daily", getDailyIncome);

export default router;
