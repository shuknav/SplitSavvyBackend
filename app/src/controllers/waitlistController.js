import db from "../db/client.js";
import { waitlistConfirmation } from "../emails/waitlistConfirmation.js";
import { waitlistReject } from "../emails/waitlistReject.js";
import { firstLogin } from "../emails/firstLogin.js";
import { waitlistAccept } from "../emails/waitlistAccept.js";

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
      "UPDATE waitlists SET status = ($1) WHERE email = ($2) RETURNING first_name",
      ["approved", email]
    );
    const firstName = response.rows[0].first_name;
    await waitlistAccept(email, firstName);
    await firstLogin(
      email,
      firstName,
      "https://www.youtube.com/watch?v=xvFZjo5PgG0"
    );
    res.status(200).json({ result: "success" });
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
