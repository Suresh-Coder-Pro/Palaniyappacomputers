import express from "express";
import { addPhoneEntry, getPhoneEntries, deletePhoneEntry} from "../Controllers/PhoneController.js";

const router = express.Router();
router.post("/", addPhoneEntry);
router.get("/", getPhoneEntries);
router.delete("/:id", deletePhoneEntry);

export default router; 
