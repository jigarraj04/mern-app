import mongoose from "mongoose";
import { jsonTransform } from "../db.js";

export const STAGES = ["Lead", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];

const dealSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    title: { type: String, required: true, trim: true },
    value: { type: Number, default: 0, min: 0 },
    stage: { type: String, enum: STAGES, default: "Lead" },
    closeDate: { type: String, default: null }, // "YYYY-MM-DD", as the client sends it
  },
  { timestamps: { createdAt: true, updatedAt: true }, toJSON: { transform: jsonTransform } }
);

dealSchema.index({ customerId: 1, createdAt: -1 });
dealSchema.index({ stage: 1 });

export default mongoose.model("Deal", dealSchema);
