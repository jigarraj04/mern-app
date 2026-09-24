// Fill the database with sample data. Usage: npm run seed
// Wipes customers, deals and activities first.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import Activity from "../models/Activity.js";

await connectDB();
await Promise.all([Customer.deleteMany({}), Deal.deleteMany({}), Activity.deleteMany({})]);

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

const customers = await Customer.insertMany([
  { name: "Priya Sharma", company: "Sharma Textiles", email: "priya@sharmatextiles.example", phone: "+91 98765 43210", tags: ["retail", "vip"] },
  { name: "Arjun Reddy", company: "Reddy Agro Foods", email: "arjun@reddyagro.example", phone: "+91 90000 11122", tags: ["wholesale"] },
  { name: "Meera Nair", company: "Nair Design Studio", email: "meera@nairdesign.example", phone: "+91 99887 76655", tags: ["services", "design"] },
  { name: "Jigar Patel", company: "Jigar Footwear", email: "jigar@example.com", phone: "123456789", tags: ["retail", "shoes"] },
]);
const [priya, arjun, meera, jigar] = customers;

await Deal.insertMany([
  { customerId: priya._id, title: "Annual fabric supply", value: 250000, stage: "Negotiation", closeDate: "2026-10-15" },
  { customerId: priya._id, title: "Showroom display units", value: 80000, stage: "Proposal", closeDate: "2026-11-01" },
  { customerId: arjun._id, title: "Bulk grain contract", value: 480000, stage: "Contacted", closeDate: "2026-12-05" },
  { customerId: meera._id, title: "Brand refresh project", value: 120000, stage: "Lead", closeDate: null },
  { customerId: jigar._id, title: "Shoes", value: 50000, stage: "Won", closeDate: "2026-09-12" },
  { customerId: arjun._id, title: "Cold storage pilot", value: 60000, stage: "Lost", closeDate: "2026-08-20" },
]);

await Activity.insertMany([
  { customerId: priya._id, type: "call", note: "Discussed volume pricing for next year.", date: daysAgo(1) },
  { customerId: priya._id, type: "email", note: "Sent revised quotation.", date: daysAgo(3) },
  { customerId: arjun._id, type: "meeting", note: "Site visit at the warehouse.", date: daysAgo(6) },
  { customerId: meera._id, type: "note", note: "Interested in a brand workshop; follow up next week.", date: daysAgo(2) },
  { customerId: jigar._id, type: "call", note: "Order confirmed, invoice sent.", date: daysAgo(12) },
]);

console.log("Seeded 4 customers, 6 deals, 5 activities.");
await mongoose.disconnect();
