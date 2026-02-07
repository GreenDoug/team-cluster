import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function AdminDashboard() {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    apiFetch("api/admin_clusters.php").then(setClusters);
  }, []);

  async function updateStatus(id, status) {
    await apiFetch("api/approve_cluster.php", {
      method: "POST",
      body: JSON.stringify({ cluster_id: id, status })
    });

    setClusters(clusters.filter(c => c.id !== id));
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="avatar">AD</div>
          <div>
            <div>Admin</div>
            <div className="user-meta">Operations</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-item active">Dashboard</div>
          <div className="nav-item">Team</div>
          <div className="nav-item">Attendance</div>
          <div className="nav-item">Schedule</div>
        </nav>

        <div className="sidebar-footer">Log Out</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>TEAM</h2>
            <div className="section-title">Admin Dashboard</div>
          </div>
          <span className="datetime">0:00 PM · Wed, January 22, 2026</span>
        </header>

        <section className="content">
          <div className="section-title">Pending cluster requests</div>

          {clusters.length === 0 && (
            <div className="empty-state">No cluster requests pending.</div>
          )}

          {clusters.map(c => (
            <div key={c.id} className="card">
              <div className="card-details">
                <strong>{c.name}</strong>
                <span>{c.description}</span>
                <span>Coach: {c.coach}</span>
              </div>

              <div className="card-actions">
                <button
                  className="btn primary"
                  onClick={() => updateStatus(c.id, "approved")}
                >
                  Accept
                </button>
                <button
                  className="btn secondary"
                  onClick={() => updateStatus(c.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}