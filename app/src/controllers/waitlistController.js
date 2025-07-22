import db from "../db/client.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { waitlistConfirmation } from "../emails/waitlistConfirmation.js";
import { waitlistReject } from "../emails/waitlistReject.js";
import { firstLogin } from "../emails/firstLogin.js";
import { waitlistAccept } from "../emails/waitlistAccept.js";
import { onboard } from "../emails/onboard.js";

const saltRounds = 12;

//controller function to add users to waitlist
export const addToWaitlist = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  try {
    //checking if user already in waitlist{edgecase}
    const checkWaitlist = await db.query(
      "SELECT * FROM waitlists WHERE email = ($1)",
      [email]
    );
    // checking if user is already a member{edgecase}
    const checkUserExist = await db.query(
      "SELECT * FROM users WHERE email = ($1)",
      [email]
    );
    if (checkUserExist.rows.length > 0) {
      res.status(200).json({ status: "user_exists" }); //shows already a member{edgecase}
    } else if (checkWaitlist.rows.length > 0) {
      res.status(200).json({ status: "already_waitlisted" }); // shows already in waitlist{edgecase}
    } else {
      const result = await db.query(
        "INSERT INTO waitlists (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING *", //add to waitlist
        [firstName, lastName, email]
      );
      await waitlistConfirmation(email, firstName);
      res.status(201).json({ status: "waitlisted" });
    }
  } catch (err) {
    console.log("DB Error:", err);
  }
};

//controller function to check waitlist status
export const checkInWaitlist = async (req, res) => {
  const email = req.query.email;
  try {
    const checkUserExist = await db.query(
      //checking if user already a memeber{edgecase}
      "SELECT * FROM users WHERE email = ($1)",
      [email]
    );
    const checkStatus = await db.query(
      //checking the user status
      "SELECT * FROM waitlists WHERE email = ($1)",
      [email]
    );
    if (checkUserExist.rows.length > 0) {
      res.status(200).json({ status: "user_exists" }); //returns as user already a memeber {edgecase}
    } else if (checkStatus.rows.length > 0) {
      //returns the status
      const row = checkStatus.rows[0];
      const fullName = `${row.first_name} ${row.last_name}`;
      console.log(row.status);
      console.log(fullName);
      res.status(201).json({
        status: row.status,
        name: fullName,
      });
    } else {
      res.status(200).json({ status: "not_exists" }); //error when user checking status without joining the waitlist {edgecase}
    }
  } catch (err) {
    console.log("DB Error:", err);
  }
};

export const fetchWaitlistData = async (req, res) => {
  try {
    const response = await db.query(
      "SELECT * FROM waitlists ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 WHEN 'cancelled' THEN 3 END"
    );
    const result = response.rows;
    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
  }
};

export const ApproveWaitlist = async (req, res) => {
  const { email } = req.body;
  try {
    const response = await db.query(
      "UPDATE waitlists SET status = ($1) WHERE email = ($2) RETURNING *",
      ["approved", email]
    );
    const userDetails = {
      firstName: response.rows[0].first_name,
      lastName: response.rows[0].last_name,
      email: response.rows[0].email,
    };
    await waitlistAccept(userDetails.email, userDetails.firstName);
    const token = jwt.sign(
      {
        method: "create",
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    bcrypt.hash(token, saltRounds, async (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        try {
          await db.query(
            "UPDATE waitlists SET hashed_token = ($1), is_token_valid = ($2) WHERE email = ($3)",
            [hash, true, userDetails.email]
          );
          await firstLogin(
            userDetails.email,
            userDetails.firstName,
            `${process.env.FRONTEND_URL}/setpassword?token=${token}`
          );
          res.status(200).json({ result: "success" });
        } catch (error) {
          console.log(error);
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export const RejectWaitlist = async (req, res) => {
  const { email } = req.body;
  try {
    const response = await db.query(
      "UPDATE waitlists SET status = ($1) WHERE email = ($2) RETURNING first_name",
      ["cancelled", email]
    );
    const firstName = response.rows[0].first_name;
    await waitlistReject(email, firstName);
    res.status(200).json({ result: "success" });
  } catch (err) {
    console.log(err);
  }
};

export const tokenValidation = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await db.query(
      "SELECT * FROM waitlists WHERE email = ($1)",
      [decoded.email]
    );
    bcrypt.compare(
      token,
      response.rows[0].hashed_token,
      async (err, result) => {
        if (err) {
          console.log(err);
        }
        if (!result) {
          return res.json({
            result: false,
            message: "Token mismatch. Please request a new link.",
          });
        } else if (result && response.rows[0].is_token_valid) {
          const mode = decoded.method;
          res.json({ result, mode });
        } else {
          res.json({
            result: false,
            message: "Link no longer valid. Contact support for help.",
          });
        }
      }
    );
  } catch (err) {
    res.json({ result: false, message: "Invalid or expired token" });
  }
};

export const onBoardUser = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const validityCheck = await db.query(
      "SELECT is_token_valid FROM waitlists WHERE email = ($1)",
      [decoded.email]
    );
    if (validityCheck.rows[0].is_token_valid) {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          try {
            const response = await db.query(
              "INSERT INTO users (email, first_name, last_name, hashed_password) VALUES ($1, $2, $3, $4) RETURNING *",
              [decoded.email, decoded.firstName, decoded.lastName, hash]
            );
            if (response.rows.length === 0) {
              res.json({ result: "failed" });
            } else {
              await db.query("DELETE FROM waitlists WHERE email=($1)", [
                decoded.email,
              ]);
              await onboard(decoded.email, decoded.firstName);
              res.json({ result: "success" });
            }
          } catch (err) {
            console.log(err);
          }
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};
