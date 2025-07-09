import db from "../db/client.js";

export const addToWaitlist = async (req, res) => {
  const email = req.body.value;
  try {
    const checkWaitlist = await db.query(
      "SELECT * FROM waitlists WHERE email = ($1)",
      [email]
    );
    const checkUserExist = await db.query(
      "SELECT * FROM users WHERE email = ($1)",
      [email]
    );
    if (checkUserExist.rows.length > 0) {
      res.status(200).json({ status: "user_exists" });
    } else if (checkWaitlist.rows.length > 0) {
      res.status(200).json({ status: "already_waitlisted" });
    } else {
      const result = await db.query(
        "INSERT INTO waitlists (email) VALUES ($1) RETURNING *",
        [email]
      );
      res.status(201).json({ status: "waitlisted" });
    }
  } catch (err) {
    console.log("DB Error:", err);
  }
};

export const checkInWaitlist = async (req, res) => {
  const email = req.query.email;
  try {
    const checkStatus = await db.query(
      "SELECT status FROM waitlists WHERE email = ($1)",
      [email]
    );
    res.status(201).json(checkStatus.rows[0].status);
  } catch (err) {
    console.log("DB Error:", err);
  }
};
