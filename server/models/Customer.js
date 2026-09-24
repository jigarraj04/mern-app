import mongoose from "mongoose";
import { jsonTransform } from "../db.js";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: true }, toJSON: { transform: jsonTransform } }
);

customerSchema.index({ createdAt: -1 });
customerSchema.index({ email: 1 });
customerSchema.index({ name: 1 });

export default mongoose.model("Customer", customerSchema);
