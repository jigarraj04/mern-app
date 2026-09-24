import { Router } from "express";
import { readDB, writeDB, id } from "../db.js";

const router = Router();

export const ACTIVITY_TYPES = ["call", "email", "meeting", "note"];

// GET /api/activities?customerId=c-1001
router.get("/", async (req, res) => {
  const db = await readDB();
  let activities = db.activities;
  if (req.query.customerId) {
    activities = activities.filter((a) => a.customerId === req.query.customerId);
  }
  activities = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(activities);
});

// POST /api/activities -> log an activity against a customer
router.post("/", async (req, res) => {
  const { customerId, type, note, date } = req.body;

  if (!customerId || !note || !note.trim()) {
    return res.status(400).json({ error: "customerId and note are required" });
  }
  if (type && !ACTIVITY_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of ${ACTIVITY_TYPES.join(", ")}` });
  }

  const db = await readDB();
  if (!db.customers.some((c) => c.id === customerId)) {
    return res.status(400).json({ error: "Unknown customerId" });
  }

  const activity = {
    id: id("a"),
    customerId,
    type: type || "note",
    note: note.trim(),
    date: date || new Date().toISOString(),
  };

  db.activities.push(activity);
  await writeDB(db);
  res.status(201).json(activity);
});

// DELETE /api/activities/:id
router.delete("/:id", async (req, res) => {
  const db = await readDB();
  const exists = db.activities.some((a) => a.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Activity not found" });

  db.activities = db.activities.filter((a) => a.id !== req.params.id);
  await writeDB(db);
  res.status(204).end();
});

export default router;
