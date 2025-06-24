import express from "express";
import { addAadharEntry, getAadharEntries,deleteAadharEntry } from "../Controllers/AadharEnrolmentController.js";

const router = express.Router();
router.post("/", addAadharEntry);
router.get("/", getAadharEntries);
router.delete("/:id", deleteAadharEntry);

export default router;
