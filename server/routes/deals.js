import { Router } from "express";
import Deal, { STAGES } from "../models/Deal.js";
import Customer from "../models/Customer.js";
import { isValidId } from "../db.js";

const router = Router();

export { STAGES };

const stageError = `stage must be one of ${STAGES.join(", ")}`;

// GET /api/deals?customerId=...
router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.customerId) {
    if (!isValidId(req.query.customerId)) return res.json([]);
    filter.customerId = req.query.customerId;
  }
  res.json(await Deal.find(filter).sort({ createdAt: -1 }));
});

// GET /api/deals/:id
router.get("/:id", async (req, res) => {
  const deal = isValidId(req.params.id) && (await Deal.findById(req.params.id));
  if (!deal) return res.status(404).json({ error: "Deal not found" });
  res.json(deal);
});

// POST /api/deals
router.post("/", async (req, res) => {
  const { customerId, title, value, stage, closeDate } = req.body;

  if (!customerId || !title || !title.trim()) {
    return res.status(400).json({ error: "customerId and title are required" });
  }
  if (stage && !STAGES.includes(stage)) {
    return res.status(400).json({ error: stageError });
  }
  if (!isValidId(customerId) || !(await Customer.exists({ _id: customerId }))) {
    return res.status(400).json({ error: "Unknown customerId" });
  }

  const deal = await Deal.create({
    customerId,
    title,
    value: Math.max(0, Number(value) || 0),
    stage: stage || "Lead",
    closeDate: closeDate || null,
  });
  res.status(201).json(deal);
});

// PUT /api/deals/:id (edits + stage moves)
router.put("/:id", async (req, res) => {
  const deal = isValidId(req.params.id) && (await Deal.findById(req.params.id));
  if (!deal) return res.status(404).json({ error: "Deal not found" });

  const { title, value, stage, closeDate } = req.body;
  if (stage !== undefined && !STAGES.includes(stage)) {
    return res.status(400).json({ error: stageError });
  }

  if (title !== undefined) deal.title = title;
  if (value !== undefined) deal.value = Math.max(0, Number(value) || 0);
  if (stage !== undefined) deal.stage = stage;
  if (closeDate !== undefined) deal.closeDate = closeDate || null;

  await deal.save();
  res.json(deal);
});

// DELETE /api/deals/:id
router.delete("/:id", async (req, res) => {
  const deal = isValidId(req.params.id) && (await Deal.findByIdAndDelete(req.params.id));
  if (!deal) return res.status(404).json({ error: "Deal not found" });
  res.status(204).end();
});

export default router;
