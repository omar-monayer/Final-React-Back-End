import express from "express";
import pgclient from "../config/db.js";

const router = express.Router();

/* GET job titles */
router.get("/", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT
        jobt_id AS "id",
        jobt_name AS "jobTitle"
      FROM job_titles
      WHERE deleted = 0
      ORDER BY jobt_id DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting job titles:", error);

    res.status(500).json({
      message: "Failed to get job titles",
    });
  }
});

/* ADD job title */
router.post("/", async (req, res) => {
  const { jobTitle } = req.body;

  if (!jobTitle) {
    return res.status(400).json({
      message: "Job title is required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      INSERT INTO job_titles (
        jobt_name,
        created_by,
        updated_by,
        deleted
      )
      VALUES ($1, $2, $3, 0)
      RETURNING jobt_id;
      `,
      [jobTitle, "admin", "admin"]
    );

    res.status(201).json({
      message: "Job title added successfully",
      jobTitleId: result.rows[0].jobt_id,
    });
  } catch (error) {
    console.error("Error adding job title:", error);

    res.status(500).json({
      message: "Failed to add job title",
    });
  }
});

/* UPDATE job title */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { jobTitle } = req.body;

  if (!jobTitle) {
    return res.status(400).json({
      message: "Job title is required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      UPDATE job_titles
      SET
        jobt_name = $1,
        updated_by = $2
      WHERE jobt_id = $3
        AND deleted = 0
      RETURNING jobt_id;
      `,
      [jobTitle, "admin", Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job title not found",
      });
    }

    res.json({
      message: "Job title updated successfully",
      jobTitleId: result.rows[0].jobt_id,
    });
  } catch (error) {
    console.error("Error updating job title:", error);

    res.status(500).json({
      message: "Failed to update job title",
    });
  }
});

/* DELETE job title */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pgclient.query(
      `
      UPDATE job_titles
      SET
        deleted = 1,
        updated_by = $1
      WHERE jobt_id = $2;
      `,
      ["admin", Number(id)]
    );

    res.json({
      message: "Job title deleted successfully",
      jobTitleId: Number(id),
    });
  } catch (error) {
    console.error("Error deleting job title:", error);

    res.status(500).json({
      message: "Failed to delete job title",
    });
  }
});

export default router;