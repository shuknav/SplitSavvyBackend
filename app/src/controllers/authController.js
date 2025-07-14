import db from "../db/client.js";
import bcrypt from "bcrypt";

//controller funciton for email verification
export const loginEmailVerify = async (req, res) => {
  const email = req.query.email;
  try {
    //checking if user exists or not
    const checkEmailPresence = await db.query(
      "SELECT * FROM users WHERE email = ($1)",
      [email]
    );
    if (checkEmailPresence.rows.length > 0) {
      //if exists moves to further step i.e. password field visibilty
      res.status(201).json({ status: "user_exist" });
    } else {
      // else shows the error page
      res.status(201).json({ status: "user_not_exist" });
    }
  } catch (err) {
    console.log("Err", err);
  }
};

//controller function for user verification
export const loginVerify = async (req, res) => {
  const { email, password } = req.body;
  const response = await db.query("SELECT * FROM users WHERE email = ($1)", [
    email,
  ]);
  const storedPassword = response.rows[0].hashed_password;
  bcrypt.compare(password, storedPassword, (err, result) => {
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
