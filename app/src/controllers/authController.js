import db from "../db/client.js";

export const loginEmailVerify = async (req, res) => {
  const email = req.query.email;
  try {
    const checkEmailPresence = await db.query(
      "SELECT * FROM users WHERE email = ($1)",
      [email]
    );
    if (checkEmailPresence.rows.length > 0) {
      res.status(201).json({ status: "user_exist" });
    } else {
      res.status(201).json({ status: "user_not_exist" });
    }
  } catch (err) {
    console.log("Err", err);
  }
};
