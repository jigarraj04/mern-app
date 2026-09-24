import { useState } from "react";

export default function CustomerFormModal({ initial, onSave, onClose }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({
    name: initial?.name || "",
    company: initial?.company || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    tags: (initial?.tags || []).join(", "),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
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
        <h2>{isEdit ? "Edit customer" : "New customer"}</h2>
        <p className="modal-sub">
          {isEdit ? "Update this contact's file." : "Add a new contact to the index."}
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={form.name} onChange={update("name")} autoFocus />
          </div>

          <div className="field">
            <label htmlFor="company">Company</label>
            <input id="company" value={form.company} onChange={update("company")} />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={update("email")} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={form.phone} onChange={update("phone")} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input id="tags" value={form.tags} onChange={update("tags")} placeholder="retail, key account" />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
