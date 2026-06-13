import express from "express";
import pgclient from "../config/db.js";

const router = express.Router();

/* GET industries */
router.get("/", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT
        industry_id AS "id",
        industry_name AS "industry",
        "industry_linkedIn_id" AS "linkedinId"
      FROM industry
      WHERE deleted = 0
      ORDER BY industry_id DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting industries:", error);

    res.status(500).json({
      message: "Failed to get industries",
    });
  }
});

/* ADD industry */
router.post("/", async (req, res) => {
  const { industry, linkedinId } = req.body;

  if (!industry) {
    return res.status(400).json({
      message: "Industry name is required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      INSERT INTO industry (
        industry_name,
        "industry_linkedIn_id",
        created_by,
        updated_by,
        deleted
      )
      VALUES ($1, $2, $3, $4, 0)
      RETURNING industry_id;
      `,
      [industry, linkedinId || null, "admin", "admin"]
    );

    res.status(201).json({
      message: "Industry added successfully",
      industryId: result.rows[0].industry_id,
    });
  } catch (error) {
    console.error("Error adding industry:", error);

    res.status(500).json({
      message: "Failed to add industry",
    });
  }
});

/* UPDATE industry */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { industry, linkedinId } = req.body;

  if (!industry) {
    return res.status(400).json({
      message: "Industry name is required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      UPDATE industry
      SET
        industry_name = $1,
        "industry_linkedIn_id" = $2,
        updated_by = $3
      WHERE industry_id = $4
        AND deleted = 0
      RETURNING industry_id;
      `,
      [industry, linkedinId || null, "admin", Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Industry not found",
      });
    }

    res.json({
      message: "Industry updated successfully",
      industryId: result.rows[0].industry_id,
    });
  } catch (error) {
    console.error("Error updating industry:", error);

    res.status(500).json({
      message: "Failed to update industry",
    });
  }
});

/* DELETE industry */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pgclient.query(
      `
      UPDATE industry
      SET
        deleted = 1,
        updated_by = $1
      WHERE industry_id = $2;
      `,
      ["admin", Number(id)]
    );

    res.json({
      message: "Industry deleted successfully",
      industryId: Number(id),
    });
  } catch (error) {
    console.error("Error deleting industry:", error);

    res.status(500).json({
      message: "Failed to delete industry",
    });
  }
});

export default router;