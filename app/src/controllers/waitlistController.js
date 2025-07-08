import db from "../db/client.js";

export const addToWaitlist = async (req, res) => {
  const email = req.body.value;
  try {
    const result = await db.query(
      "INSERT INTO Waitlist (Email) VALUES ($1) RETURNING *",
      [email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log("DB Error:", err);
  }
};
