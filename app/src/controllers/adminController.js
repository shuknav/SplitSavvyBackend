import db from "../db/client.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

export const AdminIdentiyVerify = async (req, res) => {
  const passwordToVerify = req.body.value;
};

export const AdminDetailAdd = async (req, res) => {
  const PasswordToAddInDB = ""; //insert the password you want to have as admin
  bcrypt.hash(PasswordToAddInDB, saltRounds, async (err, hash) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error hashing password" });
    }
    try {
      const dbRes = await db.query(
        "INSERT INTO admins (hashed_password) VALUES ($1)",
        [hash]
      );
      res.status(201).json({ message: "Admin added successfully" });
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).json({ message: "Error saving to DB" });
    }
  });
};
