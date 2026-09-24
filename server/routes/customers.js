import { Router } from "express";
import { readDB, writeDB, id } from "../db.js";

const router = Router();

// GET /api/customers?search=term  -> list customers, optionally filtered
router.get("/", async (req, res) => {
  const db = await readDB();
  const search = (req.query.search || "").toLowerCase().trim();

  let customers = db.customers;
  if (search) {
    customers = customers.filter((c) =>
      [c.name, c.company, c.email, ...(c.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  // newest first
  customers = [...customers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json(customers);
});

// GET /api/customers/:id -> one customer
router.get("/:id", async (req, res) => {
  const db = await readDB();
  const customer = db.customers.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});

// POST /api/customers -> create a customer
router.post("/", async (req, res) => {
  const { name, company, email, phone, tags } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  const db = await readDB();
  const customer = {
    id: id("c"),
    name: name.trim(),
    company: (company || "").trim(),
    email: (email || "").trim(),
    phone: (phone || "").trim(),
    tags: Array.isArray(tags)
      ? tags.filter(Boolean)
      : String(tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
    createdAt: new Date().toISOString(),
  };

  db.customers.push(customer);
  await writeDB(db);
  res.status(201).json(customer);
});

// PUT /api/customers/:id -> update a customer
router.put("/:id", async (req, res) => {
  const db = await readDB();
  const idx = db.customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Customer not found" });

  const { name, company, email, phone, tags } = req.body;
  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  const existing = db.customers[idx];
  db.customers[idx] = {
    ...existing,
    ...(name !== undefined ? { name: name.trim() } : {}),
    ...(company !== undefined ? { company: company.trim() } : {}),
    ...(email !== undefined ? { email: email.trim() } : {}),
    ...(phone !== undefined ? { phone: phone.trim() } : {}),
    ...(tags !== undefined
      ? {
          tags: Array.isArray(tags)
            ? tags.filter(Boolean)
            : String(tags)
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        }
      : {}),
  };

  await writeDB(db);
  res.json(db.customers[idx]);
});

// DELETE /api/customers/:id -> remove a customer and their deals/activities
router.delete("/:id", async (req, res) => {
  const db = await readDB();
  const exists = db.customers.some((c) => c.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Customer not found" });

  db.customers = db.customers.filter((c) => c.id !== req.params.id);
  db.deals = db.deals.filter((d) => d.customerId !== req.params.id);
  db.activities = db.activities.filter((a) => a.customerId !== req.params.id);

  await writeDB(db);
  res.status(204).end();
});

export default router;
