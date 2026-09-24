import { Router } from "express";
import Activity, { ACTIVITY_TYPES } from "../models/Activity.js";
import Customer from "../models/Customer.js";
import { isValidId } from "../db.js";

const router = Router();

export { ACTIVITY_TYPES };

// GET /api/activities?customerId=...
router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.customerId) {
    if (!isValidId(req.query.customerId)) return res.json([]);
    filter.customerId = req.query.customerId;
  }
  res.json(await Activity.find(filter).sort({ date: -1 }));
});

// POST /api/activities
router.post("/", async (req, res) => {
  const { customerId, type, note, date } = req.body;

  if (!customerId || !note || !note.trim()) {
    return res.status(400).json({ error: "customerId and note are required" });
  }
  if (type && !ACTIVITY_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of ${ACTIVITY_TYPES.join(", ")}` });
  }
  if (!isValidId(customerId) || !(await Customer.exists({ _id: customerId }))) {
    return res.status(400).json({ error: "Unknown customerId" });
  }

  const activity = await Activity.create({
    customerId,
    type: type || "note",
    note,
    date: date || new Date(),
  });
  res.status(201).json(activity);
});

// DELETE /api/activities/:id
router.delete("/:id", async (req, res) => {
  const activity = isValidId(req.params.id) && (await Activity.findByIdAndDelete(req.params.id));
  if (!activity) return res.status(404).json({ error: "Activity not found" });
  res.status(204).end();
});

export default router;
