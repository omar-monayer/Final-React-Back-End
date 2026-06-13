import express from "express";
import pgclient from "../config/db.js";

const router = express.Router();

/* GET locations */
router.get("/", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT
        location_id AS "id",
        location_name AS "location",
        "location_linkedIn_id" AS "linkedinId"
      FROM location
      WHERE deleted = 0
      ORDER BY location_id DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting locations:", error);

    res.status(500).json({
      message: "Failed to get locations",
    });
  }
});

/* ADD location */
router.post("/", async (req, res) => {
  const { location, linkedinId } = req.body;

  if (!location) {
    return res.status(400).json({
      message: "Location name is required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      INSERT INTO location (
        location_name,
        "location_linkedIn_id",
        created_by,
        updated_by,
        deleted
      )
      VALUES ($1, $2, $3, $4, 0)
      RETURNING location_id;
      `,
      [location, linkedinId || null, "admin", "admin"]
    );

    res.status(201).json({
      message: "Location added successfully",
      locationId: result.rows[0].location_id,
    });
  } catch (error) {
    console.error("Error adding location:", error);

    res.status(500).json({
      message: "Failed to add location",
    });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { location, linkedinId } = req.body;

  if (!location) {
    return res.status(400).json({
      message: "Location name is required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      UPDATE location
      SET
        location_name = $1,
        "location_linkedIn_id" = $2,
        updated_by = $3
      WHERE location_id = $4
        AND deleted = 0
      RETURNING location_id;
      `,
      [location, linkedinId || null, "admin", Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    res.json({
      message: "Location updated successfully",
      locationId: result.rows[0].location_id,
    });
  } catch (error) {
    console.error("Error updating location:", error);

    res.status(500).json({
      message: "Failed to update location",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pgclient.query(
      `
      UPDATE location
      SET
        deleted = 1,
        updated_by = $1
      WHERE location_id = $2;
      `,
      ["admin", Number(id)]
    );

    res.json({
      message: "Location deleted successfully",
      locationId: Number(id),
    });
  } catch (error) {
    console.error("Error deleting location:", error);

    res.status(500).json({
      message: "Failed to delete location",
    });
  }
});

export default router;