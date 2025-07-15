import db from "../db/client.js";
import bcrypt from "bcrypt";

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
        res.json({ result: true, message: "welcome" });
      } else {
        res.json({ result: false, message: "wrngpass" });
      }
    }
  });
};
