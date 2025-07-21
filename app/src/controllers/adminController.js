import db from "../db/client.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";

const saltRounds = 12;

export const AdminIdentiyVerify = async (req, res) => {
  const { username, password } = req.body;
  const lowercaseUsername = username.toLowerCase();
  const response = await db.query(
    "SELECT * FROM admins where username = ($1)",
    [lowercaseUsername]
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
        res.json({ result: "wrngpassword" });
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
