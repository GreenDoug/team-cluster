import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function EmployeeDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch("api/employee_clusters.php").then(setData);
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("auth/logout.php", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="avatar">EM</div>
          <div>
            <div>Employee</div>
            <div className="user-meta">Jane Smith</div>
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
            <div className="section-title">Employee Dashboard</div>
          </div>
          <span className="datetime">0:00 PM · Wed, January 22, 2026</span>
        </header>

        <section className="content">
          <div className="section-title">Your team cluster and schedules</div>

          {data.length === 0 && (
            <div className="empty-state">No cluster details available.</div>
          )}

          {data.map((c, i) => (
            <div key={i} className="card">
              <div className="card-details">
                <strong>{c.cluster_name}</strong>
                <span>Coach: {c.coach_name}</span>
                <span>
                  Schedule: {c.schedule ? JSON.stringify(c.schedule) : "Not assigned"}
                </span>
              </div>
              <div className="card-actions">
                <button className="btn secondary">View Team Cluster</button>
                <button className="btn">View Schedule</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}