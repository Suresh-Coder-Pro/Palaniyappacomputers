import AadharEnrolment from "../Models/AadharEnrolment.js";

export const addAadharEntry = async (req, res) => {
  try {
    const newEntry = new AadharEnrolment(req.body);
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error saving entry:", error);
    res.status(500).json({ message: "Error saving entry", error });
  }
};

export const getAadharEntries = async (req, res) => {
  try {
    const entries = await AadharEnrolment.find();
    console.log("Fetched Entries:", entries); // Debugging log
    res.json(entries);
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ message: "Error fetching entries", error });
  }
};


// ✅ Delete Aadhar Enrolment Entry
export const deleteAadharEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the entry
    const deletedEntry = await AadharEnrolment.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry removed successfully!" });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ message: "Failed to delete entry" });
  }
};
