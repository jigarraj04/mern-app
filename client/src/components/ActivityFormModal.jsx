import { useState } from "react";
import { ACTIVITY_TYPES } from "../api.js";

export default function ActivityFormModal({ onSave, onClose }) {
  const [form, setForm] = useState({ type: "call", note: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.note.trim()) {
      setError("Add a short note about this activity.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Log activity</h2>
        <p className="modal-sub">Note a call, email, meeting, or general note.</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="type">Type</label>
            <select id="type" value={form.type} onChange={update("type")}>
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="note">Note</label>
            <textarea id="note" rows={3} value={form.note} onChange={update("note")} autoFocus />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Log activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
