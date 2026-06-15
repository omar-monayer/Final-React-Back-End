import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pgclient from "./config/db.js";

import companyFiltersRoutes from "./routes/companyFiltersRoutes.js";
import companyUniqueFiltersRoutes from "./routes/companyUniqueFiltersRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import industryRoutes from "./routes/industryRoutes.js";
import sizeRoutes from "./routes/sizeRoutes.js";
import jobTitleRoutes from "./routes/jobTitleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminAuth from "./middleware/adminAuth.js";
import userHomeRoutes from "./routes/userHomeRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";


dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.get("/api/admin/check", adminAuth, (req, res) => {
  res.json({
    message: "Admin access allowed",
  });
});

app.get("/", (req, res) => {
  res.send("API server is running");
});

app.use("/api/company-filters", adminAuth, companyFiltersRoutes);
app.use("/api/company-unique-filters",adminAuth, companyUniqueFiltersRoutes);
app.use("/api/locations",adminAuth, locationRoutes);
app.use("/api/industries", adminAuth, industryRoutes);
app.use("/api/sizes", adminAuth, sizeRoutes);
app.use("/api/job-titles", adminAuth, jobTitleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userHomeRoutes);
app.use("/api/weather", weatherRoutes);

const PORT = process.env.PORT || 3000;

pgclient
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });