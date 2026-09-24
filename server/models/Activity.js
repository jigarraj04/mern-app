import mongoose from "mongoose";
import { jsonTransform } from "../db.js";

export const ACTIVITY_TYPES = ["call", "email", "meeting", "note"];

const activitySchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    type: { type: String, enum: ACTIVITY_TYPES, default: "note" },
    note: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: false, toJSON: { transform: jsonTransform } }
);

activitySchema.index({ customerId: 1, date: -1 });
activitySchema.index({ date: -1 });

export default mongoose.model("Activity", activitySchema);
