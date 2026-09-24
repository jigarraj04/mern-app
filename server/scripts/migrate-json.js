// One-off import of the old data/db.json into MongoDB.
// Usage: npm run migrate            (skips if collections already have data)
//        npm run migrate -- --force (wipes collections first)
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { connectDB } from "../db.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import Activity from "../models/Activity.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "data", "db.json");
const force = process.argv.includes("--force");

await connectDB();

const existing = await Customer.countDocuments();
if (existing && !force) {
  console.log(`Database already has ${existing} customers. Use --force to overwrite.`);
  await mongoose.disconnect();
  process.exit(0);
}
if (force) {
  await Promise.all([Customer.deleteMany({}), Deal.deleteMany({}), Activity.deleteMany({})]);
}

const data = JSON.parse(await fs.readFile(file, "utf-8"));

// Old ids look like "c-x4vkf8n2"; Mongo needs ObjectIds, so map old -> new.
const idMap = new Map();
for (const c of data.customers || []) {
  const _id = new mongoose.Types.ObjectId();
  idMap.set(c.id, _id);
  await Customer.collection.insertOne({
    _id,
    name: c.name,
    company: c.company || "",
    email: c.email || "",
    phone: c.phone || "",
    tags: c.tags || [],
    createdAt: new Date(c.createdAt || Date.now()),
    updatedAt: new Date(c.createdAt || Date.now()),
  });
}

let dealCount = 0;
for (const d of data.deals || []) {
  const customerId = idMap.get(d.customerId);
  if (!customerId) continue; // orphaned
  await Deal.collection.insertOne({
    customerId,
    title: d.title,
    value: Number(d.value) || 0,
    stage: d.stage,
    closeDate: d.closeDate || null,
    createdAt: new Date(d.createdAt || Date.now()),
    updatedAt: new Date(d.createdAt || Date.now()),
  });
  dealCount++;
}

let actCount = 0;
for (const a of data.activities || []) {
  const customerId = idMap.get(a.customerId);
  if (!customerId) continue;
  await Activity.collection.insertOne({
    customerId,
    type: a.type || "note",
    note: a.note,
    date: new Date(a.date || Date.now()),
  });
  actCount++;
}

console.log(`Imported ${idMap.size} customers, ${dealCount} deals, ${actCount} activities.`);
await mongoose.disconnect();
