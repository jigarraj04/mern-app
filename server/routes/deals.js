import { Router } from "express";
import { readDB, writeDB, id } from "../db.js";

const router = Router();

export const STAGES = [
  "Lead",
  "Contacted",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

// GET /api/deals?customerId=c-1001 -> list deals, optionally by customer
router.get("/", async (req, res) => {
  const db = await readDB();
  let deals = db.deals;
  if (req.query.customerId) {
    deals = deals.filter((d) => d.customerId === req.query.customerId);
  }
  deals = [...deals].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(deals);
});

// GET /api/deals/:id
router.get("/:id", async (req, res) => {
  const db = await readDB();
  const deal = db.deals.find((d) => d.id === req.params.id);
  if (!deal) return res.status(404).json({ error: "Deal not found" });
  res.json(deal);
});

// POST /api/deals -> create a deal
router.post("/", async (req, res) => {
  const { customerId, title, value, stage, closeDate } = req.body;

  if (!customerId || !title || !title.trim()) {
    return res.status(400).json({ error: "customerId and title are required" });
  }
  if (stage && !STAGES.includes(stage)) {
    return res.status(400).json({ error: `stage must be one of ${STAGES.join(", ")}` });
  }

  const db = await readDB();
  if (!db.customers.some((c) => c.id === customerId)) {
    return res.status(400).json({ error: "Unknown customerId" });
  }

  const deal = {
    id: id("d"),
    customerId,
    title: title.trim(),
    value: Number(value) || 0,
    stage: stage || "Lead",
    closeDate: closeDate || null,
    createdAt: new Date().toISOString(),
  };

  db.deals.push(deal);
  await writeDB(db);
  res.status(201).json(deal);
});

// PUT /api/deals/:id -> update a deal (used for stage moves + edits)
router.put("/:id", async (req, res) => {
  const db = await readDB();
  const idx = db.deals.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Deal not found" });

  const { title, value, stage, closeDate } = req.body;
  if (stage !== undefined && !STAGES.includes(stage)) {
    return res.status(400).json({ error: `stage must be one of ${STAGES.join(", ")}` });
  }

  db.deals[idx] = {
    ...db.deals[idx],
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(value !== undefined ? { value: Number(value) || 0 } : {}),
    ...(stage !== undefined ? { stage } : {}),
    ...(closeDate !== undefined ? { closeDate } : {}),
  };

  await writeDB(db);
  res.json(db.deals[idx]);
});

// DELETE /api/deals/:id
router.delete("/:id", async (req, res) => {
  const db = await readDB();
  const exists = db.deals.some((d) => d.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Deal not found" });

  db.deals = db.deals.filter((d) => d.id !== req.params.id);
  await writeDB(db);
  res.status(204).end();
});

export default router;
