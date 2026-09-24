import { useState } from "react";
import { STAGES } from "../api.js";

export default function DealFormModal({ initial, customers, defaultCustomerId, onSave, onClose }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({
    customerId: initial?.customerId || defaultCustomerId || (customers[0]?.id ?? ""),
    title: initial?.title || "",
    value: initial?.value ?? "",
    stage: initial?.stage || "Lead",
    closeDate: initial?.closeDate || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Deal title is required.");
      return;
    }
    if (!form.customerId) {
      setError("Choose a customer.");
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
        <h2>{isEdit ? "Edit deal" : "New deal"}</h2>
        <p className="modal-sub">
          {isEdit ? "Update this opportunity." : "Add an opportunity to the pipeline."}
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="customerId">Customer</label>
            <select
              id="customerId"
              value={form.customerId}
              onChange={update("customerId")}
              disabled={Boolean(defaultCustomerId)}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company || "No company"}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="title">Deal title</label>
            <input id="title" value={form.title} onChange={update("title")} autoFocus />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="value">Value (INR)</label>
              <input id="value" type="number" min="0" value={form.value} onChange={update("value")} />
            </div>
            <div className="field">
              <label htmlFor="stage">Stage</label>
              <select id="stage" value={form.stage} onChange={update("stage")}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="closeDate">Expected close date</label>
            <input id="closeDate" type="date" value={form.closeDate || ""} onChange={update("closeDate")} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
