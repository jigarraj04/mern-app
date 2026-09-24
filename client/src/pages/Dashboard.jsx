import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../api.js";
import StatCard from "../components/StatCard.jsx";
import { stageStyle } from "../stageColors.js";

const currency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="main"><p className="form-error">{error}</p></div>;
  if (!stats) return <div className="main"><p className="spinner-text">Pulling the ledger…</p></div>;

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <div className="eyebrow">Overview</div>
          <h1>Dashboard</h1>
          <p className="desc">Where the pipeline stands today, at a glance.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Customers on file" value={stats.totalCustomers} />
        <StatCard label="Open deals" value={stats.openDeals} />
        <StatCard label="Pipeline value" value={currency(stats.pipelineValue)} />
        <StatCard label="Won this period" value={currency(stats.wonValue)} note={`${stats.wonCount} deal(s)`} />
      </div>

      <div className="panel">
        <div className="section-title">Deals by stage</div>
        {stats.byStage.map((s) => {
          const style = stageStyle(s.stage);
          const max = Math.max(...stats.byStage.map((x) => x.value), 1);
          const width = Math.max((s.value / max) * 100, s.count > 0 ? 4 : 0);
          return (
            <div key={s.stage} className="list-row">
              <span
                className="stage-pill"
                style={{ background: style.tint, color: style.color }}
              >
                {s.stage}
              </span>
              <div style={{ flex: 1, margin: "0 14px" }}>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: "var(--paper-line)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${width}%`,
                      background: style.color,
                    }}
                  />
                </div>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--ink-soft)" }}>
                {s.count} · {currency(s.value)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <div className="section-title">
          Recent activity
          <Link to="/customers" className="btn btn-ghost btn-sm">
            View customers
          </Link>
        </div>
        {stats.recentActivities.length === 0 && <p className="stat-note">Nothing logged yet.</p>}
        {stats.recentActivities.map((a) => (
          <div key={a.id} className="activity-row">
            <span className="activity-type">{a.type}</span>
            <span className="activity-note">{a.note}</span>
            <span className="activity-date">{new Date(a.date).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
