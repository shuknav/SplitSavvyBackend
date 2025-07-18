import db from "../db/client.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";

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
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        res.json({ result: true, token });
      } else {
        res.json({ result: false });
      }
    }
  });
};

export const TokenVerify = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.json({ result: "No token" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ result: "Verified" });
  } catch (err) {
    res.json({ result: "Invalid or expired token" });
  }
};

export const UserDetails = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query("SELECT * FROM users WHERE email = ($1)", [
      decoded.email,
    ]);
    const userInfo = {
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      email: result.rows[0].email,
    };
    res.json(userInfo);
  } catch (err) {
    res.json({ result: "Invalid or expired token" });
  }
};

export const passChange = async (req, res) => {
  const { oldPass, newPass } = req.body;
  const response = await db.query("SELECT * FROM users WHERE email = ($1)", [
    "testuser@example.com",
  ]);
  const storedPassword = response.rows[0].hashed_password;
  bcrypt.compare(oldPass, storedPassword, async (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result) {
        const update = await db.query(
          "UPDATE users SET hashed_pass WHERE email = ($1)",
          ["testuser@example.com"]
        );
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        res.json({ result: true, token });
      } else {
        res.json({ result: false });
      }
    }
  });
};
