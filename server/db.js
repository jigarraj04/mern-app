import mongoose from "mongoose";

const DEFAULT_URI = "mongodb://127.0.0.1:27017/rolodeck";

/** Connect to MongoDB. URI comes from MONGODB_URI (see .env.example). */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export const isValidId = (v) => mongoose.isValidObjectId(v);

/** Escape user input before using it inside a RegExp. */
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Shared toJSON: expose `_id` as a string `id` and drop `__v`, so the
 * React client keeps working unchanged (it expects `id`, not `_id`).
 */
export function jsonTransform(_doc, ret) {
  ret.id = String(ret._id);
  if (ret.customerId) ret.customerId = String(ret.customerId);
  delete ret._id;
  delete ret.__v;
  return ret;
}
