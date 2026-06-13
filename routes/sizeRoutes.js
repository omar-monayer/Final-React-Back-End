import express from "express";
import pgclient from "../config/db.js";

const router = express.Router();

/* GET sizes */
router.get("/", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT
        size_id AS "id",
        size_range AS "size"
      FROM "size"
      WHERE deleted = 0
      ORDER BY size_id DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting sizes:", error);

    res.status(500).json({
      message: "Failed to get sizes",
    });
  }
});

/* ADD size */
router.post("/", async (req, res) => {
  const { size } = req.body;

  if (!size) {
    return res.status(400).json({
      message: "Size is required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      INSERT INTO "size" (
        size_range,
        created_by,
        updated_by,
        deleted
      )
      VALUES ($1, $2, $3, 0)
      RETURNING size_id;
      `,
      [size, "admin", "admin"]
    );

    res.status(201).json({
      message: "Size added successfully",
      sizeId: result.rows[0].size_id,
    });
  } catch (error) {
    console.error("Error adding size:", error);

    res.status(500).json({
      message: "Failed to add size",
    });
  }
});

/* UPDATE size */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { size } = req.body;

  if (!size) {
    return res.status(400).json({
      message: "Size is required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      UPDATE "size"
      SET
        size_range = $1,
        updated_by = $2
      WHERE size_id = $3
        AND deleted = 0
      RETURNING size_id;
      `,
      [size, "admin", Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Size not found",
      });
    }

    res.json({
      message: "Size updated successfully",
      sizeId: result.rows[0].size_id,
    });
  } catch (error) {
    console.error("Error updating size:", error);

    res.status(500).json({
      message: "Failed to update size",
    });
  }
});

/* DELETE size */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pgclient.query(
      `
      UPDATE "size"
      SET
        deleted = 1,
        updated_by = $1
      WHERE size_id = $2;
      `,
      ["admin", Number(id)]
    );

    res.json({
      message: "Size deleted successfully",
      sizeId: Number(id),
    });
  } catch (error) {
    console.error("Error deleting size:", error);

    res.status(500).json({
      message: "Failed to delete size",
    });
  }
});

export default router;