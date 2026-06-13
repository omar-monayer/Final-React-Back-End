import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pgclient from "./config/db.js";

import companyFiltersRoutes from "./routes/companyFiltersRoutes.js";
import companyUniqueFiltersRoutes from "./routes/companyUniqueFiltersRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API server is running");
});

app.use("/api/company-filters", companyFiltersRoutes);
app.use("/api/company-unique-filters", companyUniqueFiltersRoutes);

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