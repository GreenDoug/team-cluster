import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import useLiveDateTime from "../hooks/useLiveDateTime";

export default function EmployeeDashboard() {
  const [data, setData] = useState([]);
  const activeCluster = data[0];
  const dateTimeLabel = useLiveDateTime();

  const normalizeSchedule = schedule => {
    if (!schedule) return schedule;
    if (typeof schedule === "string") {
      try {
        return JSON.parse(schedule);
      } catch (error) {
        return schedule;
      }
    }
    return schedule;
  };

  const formatSchedule = schedule => {
    if (!schedule) return "Not assigned";
    if (Array.isArray(schedule)) {
      return schedule.join(", ");
    }
    if (typeof schedule === "object") {
      const days = Array.isArray(schedule.days) ? schedule.days : [];
      const daysLabel = days.length > 0 ? days.join(", ") : "Days TBD";
      const startTime = schedule.startTime ?? "9:00";
      const startPeriod = schedule.startPeriod ?? "AM";
      const endTime = schedule.endTime ?? "5:00";
      const endPeriod = schedule.endPeriod ?? "PM";
      return `${daysLabel} · ${startTime} ${startPeriod}–${endTime} ${endPeriod}`;
    }
    return schedule;
  };

  useEffect(() => {
    apiFetch("api/employee_clusters.php").then(response => {
      const normalized = response.map(cluster => ({
        ...cluster,
        schedule: normalizeSchedule(cluster.schedule)
      }));
      setData(normalized);
    });
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
          <span className="datetime">{dateTimeLabel}</span>
        </header>

        <section className="content">
          <div className="section-title">Your team cluster and schedules</div>

          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-label">Active cluster</div>
              <div className="overview-value">
                {activeCluster?.cluster_name ?? "Not assigned"}
              </div>
              <div className="overview-caption">
                {data.length} total cluster{data.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-label">Team coach</div>
              <div className="overview-value">
                {activeCluster?.coach_name ?? "Pending"}
              </div>
              <div className="overview-caption">Reach out for schedule changes.</div>
            </div>
            <div className="overview-card">
              <div className="overview-label">Upcoming schedule</div>
              <div className="overview-value">
                {formatSchedule(activeCluster?.schedule)}
              </div>
              <div className="overview-caption">Latest shift assignment.</div>
            </div>
          </div>

          {data.length === 0 && (
            <div className="empty-state">No cluster details available.</div>
          )}

          {data.map((c, i) => (
            <div key={i} className="card card-employee">
              <div className="card-details">
                <div className="card-meta">Team Cluster</div>
                <div className="card-title">{c.cluster_name}</div>
                <div className="card-subtitle">Coach: {c.coach_name}</div>
                <div className="card-subtitle">
                  Schedule: {formatSchedule(c.schedule)}
                </div>
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