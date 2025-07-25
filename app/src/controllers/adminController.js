import db from "../db/client.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";

const saltRounds = 12;

export const adminIdentiyVerify = async (req, res) => {
  const { username, password } = req.body;
  const lowercaseUsername = username.toLowerCase();
  try {
    const response = await db.query(
      "SELECT * FROM admins where username = ($1)",
      [lowercaseUsername]
    );
    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const storedPassword = response.rows[0].hashed_password;
    bcrypt.compare(password, storedPassword, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Password comparision failed" });
      } else {
        try {
          if (result) {
            const token = jwt.sign({ username }, process.env.JWT_SECRET, {
              expiresIn: "30m",
            });
            res.status(200).json({ message: "Admin Verified", token });
          } else {
            res.status(401).json({ message: "Incorrect password" });
          }
        } catch (err) {
          res.status(500).json({ message: "Token generation failed" });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const tokenVerify = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(404).json({ message: "No token" });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: "Verified" });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const PasswordUpdate = async (req, res) => {
  const { oldPassword, newPassword, token } = req.body;
  const data = jwt.verify(token, process.env.JWT_SECRET);
  const username = data.username;
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
        res.json({ result: "wrngpassword" });
      }
    }
  });
};

export const AdminAdd = async (req, res) => {
  const { username, password, superUser } = req.body;
  const lowercaseUsername = username.toLowerCase();
  const usernameCheck = await db.query(
    "SELECT * FROM admins WHERE username = ($1)",
    [lowercaseUsername]
  );
  if (usernameCheck.rows.length > 0) {
    res.json({ result: "notavailable" });
  } else {
    bcrypt.hash(password, saltRounds, async (error, hash) => {
      if (error) {
        console.log(error);
      } else {
        try {
          const response = await db.query(
            "INSERT INTO admins (username, hashed_password, super_user)VALUES ($1, $2, $3) RETURNING *",
            [lowercaseUsername, hash, superUser]
          );
          res.status(201).json({ result: "success" });
        } catch (err) {
          console.log(err);
        }
      }
    });
  }
};

export const FetchAdminList = async (req, res) => {
  try {
    const response = await db.query(
      "SELECT admin_id, username, super_user, super_admin FROM admins ORDER BY admin_id"
    );
    const result = response.rows;
    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
  }
};

export const SuperUserPermissions = async (req, res) => {
  const { username, superUser } = req.body;
  try {
    const response = await db.query(
      "UPDATE admins SET super_user = ($1) WHERE username = ($2)",
      [superUser, username]
    );
    res.status(200).json({ result: "success" });
  } catch (err) {
    console.log(err);
  }
};

export const isSuperUser = async (req, res) => {
  const { token } = req.body;
  const data = jwt.verify(token, process.env.JWT_SECRET);
  const username = data.username;
  try {
    const response = await db.query(
      "SELECT super_user FROM admins WHERE username = ($1)",
      [username]
    );
    const result = response.rows[0].super_user;
    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
  }
};
