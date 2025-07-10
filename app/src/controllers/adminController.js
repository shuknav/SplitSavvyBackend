import db from "../db/client.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

export const AdminIdentiyVerify = async (req, res) => {
  const passwordToVerify = req.body.value;
  const response = await db.query("SELECT * FROM admins");
  if (response.rows.length === 0) {
    return res.status(404).json({ result: false, message: "No admin found" });
  }
  const storedPassword = response.rows[0].hashed_password;
  bcrypt.compare(passwordToVerify, storedPassword, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result) {
        res.json({ result: true });
      } else {
        res.json({ result: false });
      }
    }
  });
};

export const AdminDetailAdd = async (req, res) => {
  const PasswordToAddInDB = ""; //insert the password you want to have as admin
  //comment out function for adding admins
  // to add new admin you need to change the complete logic
  //   bcrypt.hash(PasswordToAddInDB, saltRounds, async (err, hash) => {
  //     if (err) {
  //       console.log(err);
  //       return res.status(500).json({ message: "Error hashing password" });
  //     }
  //     try {
  //       const dbRes = await db.query(
  //         "INSERT INTO admins (hashed_password) VALUES ($1)",
  //         [hash]
  //       );
  //       res.status(201).json({ message: "Admin added successfully" });
  //     } catch (dbErr) {
  //       console.error(dbErr);
  //       res.status(500).json({ message: "Error saving to DB" });
  //     }
  //   });
};
