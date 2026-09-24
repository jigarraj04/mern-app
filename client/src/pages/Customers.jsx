import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../api.js";
import CustomerFormModal from "../components/CustomerFormModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = (search = "") => {
    setLoading(true);
    getCustomers(search)
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(search), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSave = async (form) => {
    if (editing) {
      const updated = await updateCustomer(editing.id, form);
      setCustomers((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const created = await createCustomer(form);
      setCustomers((cs) => [created, ...cs]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    await deleteCustomer(deleting.id);
    setCustomers((cs) => cs.filter((c) => c.id !== deleting.id));
    setDeleting(null);
  };

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <div className="eyebrow">Index</div>
          <h1>Customers</h1>
          <p className="desc">Every contact on file, searchable by name, company, or tag.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="search-field">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + New customer
          </button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p className="spinner-text">Flipping through the cards…</p>}

      {!loading && customers.length === 0 && (
        <div className="empty-state">
          <h3>No customers found</h3>
          <p>Try a different search, or add a new contact to start the file.</p>
        </div>
      )}

      <div className="card-grid">
        {customers.map((c) => (
          <div key={c.id} className="index-card">
            <Link to={`/customers/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card-name">{c.name}</div>
              {c.company && <div className="card-company">{c.company}</div>}
            </Link>
            <div className="card-meta">
              {c.email && <span>{c.email}</span>}
              {c.phone && <span>{c.phone}</span>}
            </div>
            {c.tags?.length > 0 && (
              <div className="tag-row">
                {c.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setEditing(c);
                  setShowForm(true);
                }}
              >
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleting(c)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <CustomerFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Remove customer?"
          message={`This removes ${deleting.name} and their deals and activity history. This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
