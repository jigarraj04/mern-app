import express from "express";
import cors from "cors";

import { readDB } from "./db.js";
import customersRouter from "./routes/customers.js";
import dealsRouter, { STAGES } from "./routes/deals.js";
import activitiesRouter from "./routes/activities.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/customers", customersRouter);
app.use("/api/deals", dealsRouter);
app.use("/api/activities", activitiesRouter);

// GET /api/stats -> aggregate numbers for the dashboard
app.get("/api/stats", async (req, res) => {
  const db = await readDB();

  const openStages = STAGES.filter((s) => s !== "Won" && s !== "Lost");
  const openDeals = db.deals.filter((d) => openStages.includes(d.stage));
  const wonDeals = db.deals.filter((d) => d.stage === "Won");

  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const byStage = STAGES.map((stage) => ({
    stage,
    count: db.deals.filter((d) => d.stage === stage).length,
    value: db.deals
      .filter((d) => d.stage === stage)
      .reduce((sum, d) => sum + d.value, 0),
  }));

  const recentActivities = [...db.activities]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  res.json({
    totalCustomers: db.customers.length,
    openDeals: openDeals.length,
    pipelineValue,
    wonValue,
    wonCount: wonDeals.length,
    byStage,
    recentActivities,
  });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Rolodeck CRM API listening on http://localhost:${PORT}`);
});
