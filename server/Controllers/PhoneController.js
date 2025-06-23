import PhoneNumber from "../Models/PhoneNumber.js";

export const addPhoneEntry = async (req, res) => {
  try {
    const newEntry = new PhoneNumber(req.body);
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: "Error saving entry", error });
  }
};

export const getPhoneEntries = async (req, res) => {
  try {
    const entries = await PhoneNumber.find();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entries", error });
  }
};

// ✅ Delete Phone Entry
export const deletePhoneEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the entry
    const deletedEntry = await PhoneNumber.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry removed successfully!" });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ message: "Failed to delete entry" });
  }
};
