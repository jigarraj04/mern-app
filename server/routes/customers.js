import { Router } from "express";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import Activity from "../models/Activity.js";
import { isValidId, escapeRegex } from "../db.js";

const router = Router();

const parseTags = (tags) =>
  Array.isArray(tags)
    ? tags.filter(Boolean)
    : String(tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

// GET /api/customers?search=term
router.get("/", async (req, res) => {
  const search = String(req.query.search || "").trim();
  const filter = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: rx }, { company: rx }, { email: rx }, { tags: rx }];
  }
  res.json(await Customer.find(filter).sort({ createdAt: -1 }));
});

// GET /api/customers/:id
router.get("/:id", async (req, res) => {
  const customer = isValidId(req.params.id) && (await Customer.findById(req.params.id));
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});

// POST /api/customers
router.post("/", async (req, res) => {
  const { name, company, email, phone, tags } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  const customer = await Customer.create({
    name,
    company: company || "",
    email: email || "",
    phone: phone || "",
    tags: parseTags(tags),
  });
  res.status(201).json(customer);
});

// PUT /api/customers/:id
router.put("/:id", async (req, res) => {
  const customer = isValidId(req.params.id) && (await Customer.findById(req.params.id));
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const { name, company, email, phone, tags } = req.body;
  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ error: "Name cannot be empty" });
  }
  if (name !== undefined) customer.name = name;
  if (company !== undefined) customer.company = company;
  if (email !== undefined) customer.email = email;
  if (phone !== undefined) customer.phone = phone;
  if (tags !== undefined) customer.tags = parseTags(tags);

  await customer.save();
  res.json(customer);
});

// DELETE /api/customers/:id -> also removes their deals and activities
router.delete("/:id", async (req, res) => {
  const customer = isValidId(req.params.id) && (await Customer.findByIdAndDelete(req.params.id));
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  await Promise.all([
    Deal.deleteMany({ customerId: customer._id }),
    Activity.deleteMany({ customerId: customer._id }),
  ]);
  res.status(204).end();
});

export default router;
