import db from "../db/client.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";

export const AdminIdentiyVerify = async (req, res) => {
  const { username, password } = req.body;
  const response = await db.query(
    "SELECT * FROM admins where username = ($1)",
    [username]
  );
  if (response.rows.length === 0) {
    return res.status(200).json({ result: false, message: "notadmin" });
  }
  const storedPassword = response.rows[0].hashed_password;
  bcrypt.compare(password, storedPassword, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: "30m",
        });
        res.json({ result: true, message: "welcome", token });
      } else {
        res.json({ result: false, message: "wrngpass" });
      }
    }
  });
};

export const TokenVerify = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.json({ result: "No token" });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ result: "Verified" });
  } catch (err) {
    res.json({ result: "Invalid or expired token" });
  }
};
