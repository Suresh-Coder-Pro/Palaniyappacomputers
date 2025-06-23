import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, message: "Login successful!" });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  };
  };