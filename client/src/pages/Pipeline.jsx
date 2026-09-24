import { useEffect, useState } from "react";
import { getDeals, getCustomers, updateDeal, createDeal, STAGES } from "../api.js";
import DealFormModal from "../components/DealFormModal.jsx";
import { stageStyle } from "../stageColors.js";

const currency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function Pipeline() {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [dragOverStage, setDragOverStage] = useState(null);

  const load = () => {
    Promise.all([getDeals(), getCustomers()])
      .then(([d, c]) => {
        setDeals(d);
        setCustomers(c);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const customerName = (id) => customers.find((c) => c.id === id)?.name || "Unknown";

  const moveDeal = async (dealId, stage) => {
    setDeals((ds) => ds.map((d) => (d.id === dealId ? { ...d, stage } : d)));
    try {
      await updateDeal(dealId, { stage });
    } catch (e) {
      setError(e.message);
      load(); // revert on failure
    }
  };

  const handleDrop = (stage) => (e) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/deal-id");
    setDragOverStage(null);
    if (dealId) moveDeal(dealId, stage);
  };

  const createInStage = async (form) => {
    const created = await createDeal({ ...form, value: Number(form.value) || 0 });
    setDeals((ds) => [created, ...ds]);
    setShowForm(false);
  };

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <div className="eyebrow">Pipeline</div>
          <h1>Deals board</h1>
          <p className="desc">Drag a card between tabs to move it through the pipeline.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} disabled={customers.length === 0}>
          + New deal
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {customers.length === 0 && (
        <div className="empty-state">
          <h3>Add a customer first</h3>
          <p>Deals need a customer to belong to — add one from the Customers page.</p>
        </div>
      )}

      <div className="board">
        {STAGES.map((stage) => {
          const style = stageStyle(stage);
          const stageDeals = deals.filter((d) => d.stage === stage);
          const total = stageDeals.reduce((sum, d) => sum + d.value, 0);
          return (
            <div
              key={stage}
              className={`board-column${dragOverStage === stage ? " drag-over" : ""}`}
              style={{ "--stage-color": style.color }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
              onDrop={handleDrop(stage)}
            >
              <div className="board-column-tab">
                <span>{stage}</span>
                <span className="count">{stageDeals.length}</span>
              </div>
              <div className="board-column-body">
                {stageDeals.map((d) => (
                  <div
                    key={d.id}
                    className="deal-card"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/deal-id", d.id)}
                  >
                    <div className="deal-title">{d.title}</div>
                    <div className="deal-customer">{customerName(d.customerId)}</div>
                    <div className="deal-value">{currency(d.value)}</div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <p style={{ fontSize: 11.5, color: "var(--ink-faint)", padding: "4px 2px" }}>Drop deals here</p>
                )}
              </div>
              <div className="board-column-total">{currency(total)}</div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <DealFormModal customers={customers} onSave={createInStage} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
