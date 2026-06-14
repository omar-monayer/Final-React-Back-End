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

  if (!coflId) {
    return res.status(400).json({
      message: "Company filter ID is required",
    });
  }

  if (!email) {
    return res.status(400).json({
      message: "User email is required",
    });
  }

  try {
   const result = await pgclient.query(
  `
  SELECT 
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
    AND cf.cofl_id = $2
    AND c.deleted = 0
    AND cf.deleted = 0
    AND csi.deleted = 0
    AND cs.deleted = 0

  ORDER BY cs.comsc_id DESC
  LIMIT 10;;
  `,
  [email, Number(coflId)]
);


    res.json(result.rows);
  } catch (error) {
    console.error("Error getting user companies:", error);

    res.status(500).json({
      message: "Failed to get companies",
    });
  }
});

export default router;