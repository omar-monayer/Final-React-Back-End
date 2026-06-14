import express from "express";
import pgclient from "../config/db.js";

const router = express.Router();

/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN BODY:", req.body);

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      SELECT *
      FROM userslogin
      WHERE email = $1
        AND password = $2;
      `,
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];
    delete user.password;

    res.json({ user });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Failed to login",
    });
  }
});

export default router;