import db from "../db/client.js";

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
  const email = req.query.email;
  const password = req.query.password;
  try {
    //need to update and use hashing right now storing and checking hardcoded passwords
    const checkEmailPresence = await db.query(
      "SELECT * FROM users WHERE email = ($1)",
      [email]
    );
    if (checkEmailPresence.rows[0].hashed_password == password) {
      res.status(201).json({ status: "verified" });
    } else {
      res.status(201).json({ status: "not_verified" });
    }
  } catch (err) {
    console.log("Err", err);
  }
};
