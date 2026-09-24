import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getCustomer,
  getDeals,
  getActivities,
  updateCustomer,
  deleteCustomer,
  createDeal,
  updateDeal,
  deleteDeal,
  createActivity,
  deleteActivity,
} from "../api.js";
import CustomerFormModal from "../components/CustomerFormModal.jsx";
import DealFormModal from "../components/DealFormModal.jsx";
import ActivityFormModal from "../components/ActivityFormModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { stageStyle } from "../stageColors.js";

const currency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");

  const [editingCustomer, setEditingCustomer] = useState(false);
  const [dealForm, setDealForm] = useState(null); // null | {} | deal object
  const [activityForm, setActivityForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { kind, item }

  const load = () => {
    Promise.all([getCustomer(id), getDeals(id), getActivities(id)])
      .then(([c, d, a]) => {
        setCustomer(c);
        setDeals(d);
        setActivities(a);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  if (error) return <div className="main"><p className="form-error">{error}</p></div>;
  if (!customer) return <div className="main"><p className="spinner-text">Pulling the file…</p></div>;

  const initials = customer.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const saveCustomer = async (form) => {
    const updated = await updateCustomer(customer.id, form);
    setCustomer(updated);
    setEditingCustomer(false);
  };

  const removeCustomer = async () => {
    await deleteCustomer(customer.id);
    navigate("/customers");
  };

  const saveDeal = async (form) => {
    const payload = { ...form, value: Number(form.value) || 0 };
    if (dealForm?.id) {
      const updated = await updateDeal(dealForm.id, payload);
      setDeals((ds) => ds.map((d) => (d.id === updated.id ? updated : d)));
    } else {
      const created = await createDeal(payload);
      setDeals((ds) => [created, ...ds]);
    }
    setDealForm(null);
  };

  const removeDeal = async (deal) => {
    await deleteDeal(deal.id);
    setDeals((ds) => ds.filter((d) => d.id !== deal.id));
    setDeleteTarget(null);
  };

  const saveActivity = async (form) => {
    const created = await createActivity({ ...form, customerId: customer.id });
    setActivities((as) => [created, ...as]);
    setActivityForm(false);
  };

  const removeActivity = async (activity) => {
    await deleteActivity(activity.id);
    setActivities((as) => as.filter((a) => a.id !== activity.id));
    setDeleteTarget(null);
  };

  return (
    <div className="main">
      <Link to="/customers" className="btn btn-ghost btn-sm" style={{ marginBottom: 18 }}>
        ← Back to customers
      </Link>

      <div className="detail-head">
        <div className="detail-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ fontSize: 24 }}>{customer.name}</h1>
          <p className="desc" style={{ margin: "4px 0 0" }}>
            {customer.company || "No company on file"}
          </p>
          <div className="card-meta" style={{ marginTop: 8 }}>
            {customer.email && <span>{customer.email}</span>}
            {customer.phone && <span>{customer.phone}</span>}

            {customer.city && <span>{customer.city}</span>}

            
          </div>
          {customer.tags?.length > 0 && (
            <div className="tag-row">
              {customer.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditingCustomer(true)}>
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setDeleteTarget({ kind: "customer", item: customer })}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="section-title">
          Deals
          <button className="btn btn-primary btn-sm" onClick={() => setDealForm({})}>
            + New deal
          </button>
        </div>
        {deals.length === 0 && <p className="stat-note">No deals yet for this customer.</p>}
        {deals.map((d) => {
          const style = stageStyle(d.stage);
          return (
            <div key={d.id} className="list-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{d.title}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-soft)" }}>
                  {currency(d.value)}
                  {d.closeDate ? ` · closes ${d.closeDate}` : ""}
                </div>
              </div>
              <span className="stage-pill" style={{ background: style.tint, color: style.color }}>
                {d.stage}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setDealForm(d)}>
                Edit
              </button>
              <button
                className="icon-btn"
                aria-label="Delete deal"
                onClick={() => setDeleteTarget({ kind: "deal", item: d })}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <div className="section-title">
          Activity
          <button className="btn btn-primary btn-sm" onClick={() => setActivityForm(true)}>
            + Log activity
          </button>
        </div>
        {activities.length === 0 && <p className="stat-note">Nothing logged for this customer yet.</p>}
        {activities.map((a) => (
          <div key={a.id} className="activity-row">
            <span className="activity-type">{a.type}</span>
            <span className="activity-note">{a.note}</span>
            <span className="activity-date">{new Date(a.date).toLocaleDateString()}</span>
            <button
              className="icon-btn"
              aria-label="Delete activity"
              onClick={() => setDeleteTarget({ kind: "activity", item: a })}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {editingCustomer && (
        <CustomerFormModal
          initial={customer}
          onSave={saveCustomer}
          onClose={() => setEditingCustomer(false)}
        />
      )}

      {dealForm && (
        <DealFormModal
          initial={dealForm.id ? dealForm : null}
          customers={[customer]}
          defaultCustomerId={customer.id}
          onSave={saveDeal}
          onClose={() => setDealForm(null)}
        />
      )}

      {activityForm && (
        <ActivityFormModal onSave={saveActivity} onClose={() => setActivityForm(false)} />
      )}

      {deleteTarget?.kind === "customer" && (
        <ConfirmDialog
          title="Remove customer?"
          message={`This removes ${customer.name} and their deals and activity history. This can't be undone.`}
          onConfirm={removeCustomer}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {deleteTarget?.kind === "deal" && (
        <ConfirmDialog
          title="Remove deal?"
          message={`Delete "${deleteTarget.item.title}"? This can't be undone.`}
          onConfirm={() => removeDeal(deleteTarget.item)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {deleteTarget?.kind === "activity" && (
        <ConfirmDialog
          title="Remove activity?"
          message="This log entry will be deleted permanently."
          onConfirm={() => removeActivity(deleteTarget.item)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
