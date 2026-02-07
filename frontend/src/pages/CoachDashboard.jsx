import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function CoachDashboard() {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    apiFetch("api/coach_clusters.php").then(setClusters);
  }, []);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="avatar">TC</div>
          <div>
            <div>Team Coach</div>
            <div className="user-meta">John Doe</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-item">Dashboard</div>
          <div className="nav-item active">Team</div>
          <div className="nav-item">Attendance</div>
          <div className="nav-item">Schedule</div>
        </nav>

        <div className="sidebar-footer">Log Out</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>TEAM</h2>
            <div className="section-title">Team Coach Dashboard</div>
          </div>
          <div className="toolbar">
            <span className="datetime">0:00 PM · Wed, January 22, 2026</span>
            <button className="btn primary">+ Add Cluster</button>
          </div>
        </header>

        <section className="content">
          <div className="section-title">Manage your team clusters</div>

          {clusters.length === 0 && (
            <div className="empty-state">No clusters assigned yet.</div>
          )}

          {clusters.map(c => (
            <div key={c.id} className="card">
              <div className="card-details">
                <strong>{c.name}</strong>
                <span className={`badge ${c.status}`}>{c.status}</span>
              </div>

              <div className="card-actions">
                <button className="btn secondary">Edit</button>
                <button
                  className="btn"
                  disabled={c.status !== "approved"}
                  onClick={() =>
                    window.location.href =
                      `/coach/manage_members.php?cluster_id=${c.id}`
                  }
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}