import express from "express";
import pgclient from "../config/db.js";

const router = express.Router();

/* GET all company filters */
router.get("/", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT
        cf.cofl_id AS "id",
        cf.comp_id AS "companyId",
        c.comp_name AS "companyName",

        cf.cofl_smtp_host AS "smtpHost",
        cf.cofl_smtp_port AS "smtpPort",

        cf.cofl_smtp_sender AS "sender",
        cf.cofl_smtp_alias AS "alias",

        CASE
          WHEN cf.cofl_smtp_app_password IS NOT NULL 
          AND cf.cofl_smtp_app_password <> ''
          THEN '••••••••'
          ELSE ''
        END AS "password",

        cf.cofl_email_signature AS "emailSignature",
        cf.cofl_proposal_info AS "proposalInfo",
        cf.cofl_num_qualified_lead_per_month AS "leadsPerMonth",
        cf.cofl_calendly AS "calendly",

        CASE 
          WHEN cf.cofl_is_active = 1 THEN true 
          ELSE false 
        END AS "active"

      FROM company_filters cf
      LEFT JOIN company c ON c.comp_id = cf.comp_id
      WHERE cf.deleted = 0
      ORDER BY cf.cofl_id DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting company filters:", error);
    res.status(500).json({
      message: "Failed to get company filters",
    });
  }
});
/* GET companies for popup */
router.get("/companies", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT 
        comp_id AS "id",
        comp_name AS "name"
      FROM company
      WHERE deleted = 0
      ORDER BY comp_name ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting companies:", error);
    res.status(500).json({ message: "Failed to get companies" });
  }
});

/* GET job titles for popup */
router.get("/job-titles", async (req, res) => {
  try {
    const result = await pgclient.query(`
      SELECT 
        jobt_id AS "id",
        jobt_name AS "name"
      FROM job_titles
      WHERE deleted = 0
      ORDER BY jobt_name ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting job titles:", error);
    res.status(500).json({ message: "Failed to get job titles" });
  }
});

/* POST create new company filter */
router.post("/", async (req, res) => {
  const {
    companyId,
    companyProfile,
    senderArabicName,
    senderEnglishName,
    numberOfLeads,
    smtpHost,
    smtpPort,
    smtpSender,
    smtpAlias,
    smtpAppPassword,
    emailSignature,
    proposalInfo,
    calendly,
    jobTitleIds,
  } = req.body;

  if (!companyId) {
    return res.status(400).json({ message: "Company is required" });
  }

  if (!smtpHost || !smtpPort || !smtpSender || !smtpAlias || !smtpAppPassword) {
    return res.status(400).json({ message: "SMTP fields are required" });
  }

  if (!emailSignature || !proposalInfo || !numberOfLeads) {
    return res.status(400).json({ message: "Email signature, proposal info, and number of leads are required" });
  }

  try {
    await pgclient.query("BEGIN");

    const insertFilterResult = await pgclient.query(
      `
      INSERT INTO company_filters (
        comp_id,
        cofl_smtp_host,
        cofl_smtp_port,
        cofl_smtp_sender,
        cofl_smtp_alias,
        cofl_smtp_app_password,
        cofl_email_signature,
        cofl_proposal_info,
        cofl_num_qualified_lead_per_month,
        cofl_calendly,
        cofl_company_profile,
        cofl_sender_english_name,
        cofl_sender_arabic_name,
        created_by,
        updated_by,
        deleted,
        cofl_is_active
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, 0, 1
      )
      RETURNING cofl_id;
      `,
      [
        Number(companyId),
        smtpHost,
        Number(smtpPort),
        smtpSender,
        smtpAlias,
        smtpAppPassword,
        emailSignature,
        proposalInfo,
        Number(numberOfLeads),
        calendly || null,
        companyProfile || null,
        senderEnglishName || null,
        senderArabicName || null,
        "admin",
        "admin",
      ]
    );

    const newCompanyFilterId = insertFilterResult.rows[0].cofl_id;

    if (Array.isArray(jobTitleIds) && jobTitleIds.length > 0) {
      for (const jobTitleId of jobTitleIds) {
        await pgclient.query(
          `
          INSERT INTO company_job (
            cofl_id,
            jobt_id,
            created_by,
            updated_by,
            deleted
          )
          VALUES ($1, $2, $3, $4, 0);
          `,
          [newCompanyFilterId, Number(jobTitleId), "admin", "admin"]
        );
      }
    }

    await pgclient.query("COMMIT");

    res.status(201).json({
      message: "Company filter created successfully",
      companyFilterId: newCompanyFilterId,
    });
  } catch (error) {
    await pgclient.query("ROLLBACK");
    console.error("Error creating company filter:", error);

    res.status(500).json({
      message: "Failed to create company filter",
    });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    smtpHost,
    smtpPort,
    sender,
    alias,
    password,
    emailSignature,
    proposalInfo,
    leadsPerMonth,
    calendly,
    active,
  } = req.body;

  if (!smtpHost || !smtpPort || !sender || !alias) {
    return res.status(400).json({
      message: "SMTP host, port, sender, and alias are required",
    });
  }

  if (!emailSignature || !proposalInfo || !leadsPerMonth) {
    return res.status(400).json({
      message: "Email signature, proposal info, and leads per month are required",
    });
  }

  try {
    let result;

    if (password && password.trim() !== "" && password !== "••••••••") {
      result = await pgclient.query(
        `
        UPDATE company_filters
        SET
          cofl_smtp_host = $1,
          cofl_smtp_port = $2,
          cofl_smtp_sender = $3,
          cofl_smtp_alias = $4,
          cofl_smtp_app_password = $5,
          cofl_email_signature = $6,
          cofl_proposal_info = $7,
          cofl_num_qualified_lead_per_month = $8,
          cofl_calendly = $9,
          cofl_is_active = $10,
          updated_by = $11
        WHERE cofl_id = $12
          AND deleted = 0
        RETURNING cofl_id;
        `,
        [
          smtpHost,
          Number(smtpPort),
          sender,
          alias,
          password,
          emailSignature,
          proposalInfo,
          Number(leadsPerMonth),
          calendly || null,
          active ? 1 : 0,
          "admin",
          Number(id),
        ]
      );
    } else {
      result = await pgclient.query(
        `
        UPDATE company_filters
        SET
          cofl_smtp_host = $1,
          cofl_smtp_port = $2,
          cofl_smtp_sender = $3,
          cofl_smtp_alias = $4,
          cofl_email_signature = $5,
          cofl_proposal_info = $6,
          cofl_num_qualified_lead_per_month = $7,
          cofl_calendly = $8,
          cofl_is_active = $9,
          updated_by = $10
        WHERE cofl_id = $11
          AND deleted = 0
        RETURNING cofl_id;
        `,
        [
          smtpHost,
          Number(smtpPort),
          sender,
          alias,
          emailSignature,
          proposalInfo,
          Number(leadsPerMonth),
          calendly || null,
          active ? 1 : 0,
          "admin",
          Number(id),
        ]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Company filter not found",
      });
    }

    res.json({
      message: "Company filter updated successfully",
      companyFilterId: result.rows[0].cofl_id,
    });
  } catch (error) {
    console.error("Error updating company filter:", error);

    res.status(500).json({
      message: "Failed to update company filter",
    });
  }
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pgclient.query("BEGIN");

    await pgclient.query(
      `
      UPDATE company_filters
      SET 
        deleted = 1,
        updated_by = $1
      WHERE cofl_id = $2;
      `,
      ["admin", Number(id)]
    );

    await pgclient.query(
      `
      UPDATE company_job
      SET 
        deleted = 1,
        updated_by = $1
      WHERE cofl_id = $2;
      `,
      ["admin", Number(id)]
    );

    await pgclient.query("COMMIT");

    res.json({
      message: "Company filter deleted successfully",
      companyFilterId: Number(id),
    });
  } catch (error) {
    await pgclient.query("ROLLBACK");

    console.error("Error deleting company filter:", error);

    res.status(500).json({
      message: "Failed to delete company filter",
    });
  }
});

export default router;