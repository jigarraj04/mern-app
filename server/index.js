import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./db.js";
import Customer from "./models/Customer.js";
import Deal, { STAGES } from "./models/Deal.js";
import Activity from "./models/Activity.js";
import customersRouter from "./routes/customers.js";
import dealsRouter from "./routes/deals.js";
import activitiesRouter from "./routes/activities.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/customers", customersRouter);
app.use("/api/deals", dealsRouter);
app.use("/api/activities", activitiesRouter);

// GET /api/stats -> aggregate numbers for the dashboard
app.get("/api/stats", async (req, res, next) => {
  try {
    const [totalCustomers, stageAgg, recentActivities] = await Promise.all([
      Customer.countDocuments(),
      Deal.aggregate([
        { $group: { _id: "$stage", count: { $sum: 1 }, value: { $sum: "$value" } } },
      ]),
      Activity.find().sort({ date: -1 }).limit(5),
    ]);

    const byStage = STAGES.map((stage) => {
      const row = stageAgg.find((r) => r._id === stage);
      return { stage, count: row?.count || 0, value: row?.value || 0 };
    });

    const open = byStage.filter((s) => s.stage !== "Won" && s.stage !== "Lost");
    const won = byStage.find((s) => s.stage === "Won");

    res.json({
      totalCustomers,
      openDeals: open.reduce((n, s) => n + s.count, 0),
      pipelineValue: open.reduce((n, s) => n + s.value, 0),
      wonValue: won.value,
      wonCount: won.count,
      byStage,
      recentActivities,
    });
  } catch (err) {
    next(err);
  }
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Central error handler (bad JSON, validation errors, DB errors)
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  res.status(err.status || 500).json({ error: err.status ? err.message : "Server error" });
});

connectDB()
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Rolodeck CRM API listening on http://localhost:${PORT}`)
    )
  )
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
