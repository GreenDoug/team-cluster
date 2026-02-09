import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import useLiveDateTime from "../hooks/useLiveDateTime";

export default function AdminDashboard() {
  const [clusters, setClusters] = useState([]);
  const dateTimeLabel = useLiveDateTime();

  const fetchClusters = useCallback(async () => {
    try {
      const data = await apiFetch("api/admin_clusters.php");
      setClusters(data);
    } catch (error) {
      console.error("Failed to load clusters", error);
    }
  }, []);

  useEffect(() => {
    fetchClusters();
    const interval = setInterval(fetchClusters, 5000);
    return () => clearInterval(interval);
  }, [fetchClusters]);

  const handleLogout = async () => {
    try {
      await apiFetch("auth/logout.php", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      window.location.href = "/login";
    }
  };

  async function updateStatus(id, status) {
    await apiFetch("api/approve_cluster.php", {
      method: "POST",
      body: JSON.stringify({ cluster_id: id, status })
    });
    fetchClusters();
  }

  const formatDate = dateString => {
    if (!dateString) return "—";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.valueOf())) return dateString;
    return parsed.toISOString().slice(0, 10);
  };

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

        <button className="sidebar-footer" type="button" onClick={handleLogout}>
          Log Out
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>TEAM</h2>
            <div className="section-title">Admin Dashboard</div>
          </div>
          <span className="datetime">{dateTimeLabel}</span>
        </header>

        <section className="content">
          <div className="section-title">Team clusters</div>
            {clusters.length === 0 ? (
            <div className="empty-state">No team clusters available.</div>
          ) : (
            <div className="table-card">
              <div className="table-header">
                <div>Cluster Name</div>
                <div>Description</div>
                <div>Members</div>
                <div>Created</div>
                <div>Status</div>
                <div>Action</div>
              </div>
             {clusters.map(c => (
                <div key={c.id} className="table-row">
                  <div className="table-cell">{c.name}</div>
                  <div className="table-cell muted">{c.description}</div>
                  <div className="table-cell">{c.members ?? 0}</div>
                  <div className="table-cell">{formatDate(c.created_at)}</div>
                  <div className="table-cell">
                    <span className={`badge ${c.status}`}>{c.status}</span>
                  </div>
                  <div className="table-cell">
                    {c.status === "pending" ? (
                      <div className="card-actions">
                        <button
                          className="btn primary"
                          onClick={() => updateStatus(c.id, "active")}
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
                    ) : (
                      <span className="table-cell muted">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}