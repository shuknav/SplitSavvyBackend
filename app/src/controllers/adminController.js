import db from "../db/client.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";

const saltRounds = 12;

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

export const PasswordUpdate = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const username = "whisker";
  const response = await db.query(
    "SELECT * FROM admins where username = ($1)",
    [username]
  );
  const storedPassword = response.rows[0].hashed_password;
  bcrypt.compare(oldPassword, storedPassword, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result) {
        bcrypt.hash(newPassword, saltRounds, async (error, hash) => {
          if (error) {
            console.log(error);
          } else {
            try {
              const response = await db.query(
                "UPDATE admins SET hashed_password = ($1) WHERE username = ($2)",
                [hash, username]
              );
              res.json({ result: "Success" });
            } catch (err) {
              console.log(err);
            }
          }
        });
      } else {
        res.json({ result: "incorrect current password" });
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

export const AdminAdd = async (req, res) => {
  const { username, password, sudo } = req.body;
  bcrypt.hash(password, saltRounds, async (error, hash) => {
    if (error) {
      console.log(error);
    } else {
      try {
        const response = await db.query(
          "INSERT INTO admins (username, hashed_password, sudo)VALUES ($1, $2, $3) RETURNING *",
          [username, hash, sudo]
        );
        res.status(201).json({ result: "success" });
      } catch (err) {
        console.log(err);
      }
    }
  });
};
