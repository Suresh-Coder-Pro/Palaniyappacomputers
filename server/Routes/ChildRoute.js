import express from "express";
import { addChildEntry, getChildEntries, deleteChaildEntry } from "../Controllers/ChildController.js";

const router = express.Router();
router.post("/", addChildEntry);
router.get("/", getChildEntries);
router.delete("/:id", deleteChaildEntry)
export default router;
