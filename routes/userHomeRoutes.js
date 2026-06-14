import express from "express";
import pgclient from "../config/db.js";

const router = express.Router();

/* Dashboard data based on logged-in user email */
router.get("/dashboard-companies", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      message: "User email is required",
    });
  }

  try {
    const result = await pgclient.query(
      `
      SELECT
        cf.cofl_id AS "id",
        cf.cofl_smtp_sender AS "email",
        c.comp_name AS "englishName",
        c.comp_name AS "arabicName",

        cf.cofl_email_signature AS "aboutShort",
        cf.cofl_email_signature AS "aboutFull",

        cf.cofl_proposal_info AS "serviceShort",
        cf.cofl_proposal_info AS "serviceFull",

        cf.cofl_calendly AS "redirectLink",

        CEIL(cf.cofl_num_qualified_lead_per_month::numeric / 30) AS "leadsPerDay"

      FROM userslogin ul
      INNER JOIN company c
        ON c.user_id = ul.user_id
      INNER JOIN company_filters cf
        ON cf.comp_id = c.comp_id

      WHERE LOWER(TRIM(ul.email)) = LOWER(TRIM($1))
        AND c.deleted = 0
        AND cf.deleted = 0

      ORDER BY cf.cofl_id DESC;
      `,
      [email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting dashboard companies:", error);

    res.status(500).json({
      message: "Failed to get dashboard companies",
    });
  }
});

/* Companies page data based on selected cofl_id */
router.get("/companies", async (req, res) => {
  const { coflId, email } = req.query;

  if (!email) {
    return res.status(400).json({
      message: "User email is required",
    });
  }

  try {
    const values = [email];

    let coflCondition = "";

    if (coflId) {
      values.push(Number(coflId));
      coflCondition = `AND cf.cofl_id = $2`;
    }

    const result = await pgclient.query(
      `
      SELECT DISTINCT ON (cs.comsc_id)
        cs.comsc_id AS "id",
        cs.comsc_universal_name AS "companyName",
        cs.comsc_linkedin_url AS "linkedinUrl",
        cs.comsc_website_url AS "websiteUrl",

        LEFT(COALESCE(cs.comsc_about, ''), 80) AS "aboutShort",
        cs.comsc_about AS "aboutFull"

      FROM userslogin ul
      INNER JOIN company c
        ON c.user_id = ul.user_id
      INNER JOIN company_filters cf
        ON cf.comp_id = c.comp_id
      INNER JOIN company_scraping_info csi
        ON csi.cofl_id = cf.cofl_id
      INNER JOIN company_scraping cs
        ON cs.comsc_id = csi.comsc_id

      WHERE LOWER(TRIM(ul.email)) = LOWER(TRIM($1))
        ${coflCondition}
        AND c.deleted = 0
        AND cf.deleted = 0
        AND csi.deleted = 0
        AND cs.deleted = 0

      ORDER BY cs.comsc_id DESC
      LIMIT 10;
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting user companies:", error);

    res.status(500).json({
      message: "Failed to get companies",
    });
  }
});

router.get("/leads", async (req, res) => {
  const { email, comscId } = req.query;

  if (!email) {
    return res.status(400).json({
      message: "User email is required",
    });
  }

  try {
    const values = [email];

    let comscCondition = "";

    if (comscId) {
      values.push(Number(comscId));
      comscCondition = `AND cs.comsc_id = $2`;
    }

    const result = await pgclient.query(
      `
      SELECT DISTINCT ON (l.lead_id)
        l.lead_id AS "id",
        l.lead_full_name AS "name",
        l.lead_email AS "email",
        l.lead_email AS "emailAddress",
        l.lead_job_title AS "position",
        l.lead_linkedin_profile_url AS "linkedinUrl",
        l.comsc_id AS "companyScrapingId",

        cs.comsc_universal_name AS "companyName",

        lcs.leco_last_contacted AS "lastContacted",
        lcs.leco_opened AS "opened",
        lcs.leco_clicked AS "clicked",
        lcs.leco_email AS "emailContent",
        lcs.leco_email_subject AS "emailSubject"

      FROM userslogin ul
      INNER JOIN company c
        ON c.user_id = ul.user_id
      INNER JOIN company_filters cf
        ON cf.comp_id = c.comp_id
      INNER JOIN company_scraping_info csi
        ON csi.cofl_id = cf.cofl_id
      INNER JOIN company_scraping cs
        ON cs.comsc_id = csi.comsc_id
      INNER JOIN leads l
        ON l.comsc_id = cs.comsc_id
      LEFT JOIN lead_company_scraping lcs
        ON lcs.lead_id = l.lead_id

      WHERE LOWER(TRIM(ul.email)) = LOWER(TRIM($1))
        ${comscCondition}
        AND c.deleted = 0
        AND cf.deleted = 0
        AND csi.deleted = 0
        AND cs.deleted = 0
        AND l.deleted = 0
        AND lcs.leco_email IS NOT NULL

      ORDER BY l.lead_id DESC, lcs.leco_last_contacted DESC NULLS LAST;
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting user leads:", error);

    res.status(500).json({
      message: "Failed to get leads",
    });
  }
});

export default router;