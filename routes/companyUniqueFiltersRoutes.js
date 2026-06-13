import express from "express";
import pgclient from "../config/db.js";

const router = express.Router();

/* GET all company unique filters */
router.get("/", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT
        cuf.counfl_id AS "id",
        l.location_name AS "location",
        i.industry_name AS "industry",
        s.size_range AS "size",
        cuf.done_pages AS "pages",
        cuf.num_of_extracted_leads AS "extracted",
        cuf.num_of_leads_per_month AS "leads",
        CASE 
          WHEN cuf.counfl_is_active = 1 THEN true 
          ELSE false 
        END AS "active",
        CASE 
          WHEN cuf.counfl_is_done = 1 THEN 'Yes'
          ELSE 'No'
        END AS "done"
      FROM company_unique_filters cuf
      LEFT JOIN location l ON l.location_id = cuf.location_id
      LEFT JOIN industry i ON i.industry_id = cuf.industry_id
      LEFT JOIN size s ON s.size_id = cuf.size_id
      WHERE cuf.deleted = 0
      ORDER BY cuf.counfl_id DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting company unique filters:", error);
    res.status(500).json({
      message: "Failed to get company unique filters",
    });
  }
});

/* GET locations for add form */
router.get("/locations", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT
        location_id AS "id",
        location_name AS "name"
      FROM location
      WHERE deleted = 0
      ORDER BY location_name ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting locations:", error);
    res.status(500).json({
      message: "Failed to get locations",
    });
  }
});

/* GET industries for add form */
router.get("/industries", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT
        industry_id AS "id",
        industry_name AS "name"
      FROM industry
      WHERE deleted = 0
      ORDER BY industry_name ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting industries:", error);
    res.status(500).json({
      message: "Failed to get industries",
    });
  }
});

/* GET sizes for add form */
router.get("/sizes", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT
        size_id AS "id",
        size_range AS "name"
      FROM size
      WHERE deleted = 0
      ORDER BY size_id ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting sizes:", error);
    res.status(500).json({
      message: "Failed to get sizes",
    });
  }
});

/* POST add company unique filter */
router.post("/", async (req, res) => {
  const {
    locationId,
    industryId,
    sizeId,
    pages,
    extracted,
    leads,
    active,
    done,
  } = req.body;

  if (!locationId || !industryId || !sizeId) {
    return res.status(400).json({
      message: "Location, industry, and size are required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      INSERT INTO company_unique_filters (
        location_id,
        industry_id,
        size_id,
        done_pages,
        num_of_extracted_leads,
        num_of_leads_per_month,
        counfl_is_active,
        counfl_is_done,
        created_by,
        updated_by,
        deleted
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)
      RETURNING counfl_id;
      `,
      [
        Number(locationId),
        Number(industryId),
        Number(sizeId),
        Number(pages) || 0,
        Number(extracted) || 0,
        Number(leads) || 0,
        active ? 1 : 0,
        done ? 1 : 0,
        "admin",
        "admin",
      ]
    );

    res.status(201).json({
      message: "Company unique filter added successfully",
      companyUniqueFilterId: result.rows[0].counfl_id,
    });
  } catch (error) {
    console.error("Error adding company unique filter:", error);
    res.status(500).json({
      message: "Failed to add company unique filter",
    });
  }
});
router.get("/form-options", async (req, res) => {
  try {
    const locationsResult = await pgclient.query(`
      SELECT 
        location_id AS "id",
        location_name AS "name"
      FROM location
      WHERE deleted = 0
      ORDER BY location_name ASC;
    `);

    const industriesResult = await pgclient.query(`
      SELECT 
        industry_id AS "id",
        industry_name AS "name"
      FROM industry
      WHERE deleted = 0
      ORDER BY industry_name ASC;
    `);

    const sizesResult = await pgclient.query(`
      SELECT 
        size_id AS "id",
        size_range AS "name"
      FROM size
      WHERE deleted = 0
      ORDER BY size_id ASC;
    `);

    res.json({
      locations: locationsResult.rows,
      industries: industriesResult.rows,
      sizes: sizesResult.rows,
    });
  } catch (error) {
    console.error("Error getting form options:", error);

    res.status(500).json({
      message: "Failed to get form options",
    });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    locationId,
    industryId,
    sizeId,
    pages,
    extracted,
    leads,
    active,
    done,
  } = req.body;

  try {
    const currentResult = await pgclient.query(
      `
      SELECT 
        location_id,
        industry_id,
        size_id
      FROM company_unique_filters
      WHERE counfl_id = $1
        AND deleted = 0;
      `,
      [Number(id)]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Company unique filter not found",
      });
    }

    const current = currentResult.rows[0];

    const finalLocationId = locationId
      ? Number(locationId)
      : current.location_id;

    const finalIndustryId = industryId
      ? Number(industryId)
      : current.industry_id;

    const finalSizeId = sizeId
      ? Number(sizeId)
      : current.size_id;

    const result = await pgclient.query(
      `
      UPDATE company_unique_filters
      SET
        location_id = $1,
        industry_id = $2,
        size_id = $3,
        done_pages = $4,
        num_of_extracted_leads = $5,
        num_of_leads_per_month = $6,
        counfl_is_active = $7,
        counfl_is_done = $8,
        updated_by = $9
      WHERE counfl_id = $10
        AND deleted = 0
      RETURNING counfl_id;
      `,
      [
        finalLocationId,
        finalIndustryId,
        finalSizeId,
        Number(pages) || 0,
        Number(extracted) || 0,
        Number(leads) || 0,
        active ? 1 : 0,
        done ? 1 : 0,
        "admin",
        Number(id),
      ]
    );

    res.json({
      message: "Company unique filter updated successfully",
      companyUniqueFilterId: result.rows[0].counfl_id,
    });
  } catch (error) {
    console.error("Error updating company unique filter:", error);

    res.status(500).json({
      message: "Failed to update company unique filter",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pgclient.query(
      `
      UPDATE company_unique_filters
      SET
        deleted = 1,
        updated_by = $1
      WHERE counfl_id = $2
      RETURNING counfl_id;
      `,
      ["admin", Number(id)]
    );

    res.json({
      message: "Company unique filter deleted successfully",
      companyUniqueFilterId: Number(id),
    });
  } catch (error) {
    console.error("Error deleting company unique filter:", error);

    res.status(500).json({
      message: "Failed to delete company unique filter",
    });
  }
});

export default router;