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

  const formatScheduleTime = schedule => {
    if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
      return "Time TBD";
    }
    const startTime = schedule.startTime ?? "9:00";
    const startPeriod = schedule.startPeriod ?? "AM";
    const endTime = schedule.endTime ?? "5:00";
    const endPeriod = schedule.endPeriod ?? "PM";
    return `${startTime} ${startPeriod}–${endTime} ${endPeriod}`;
  };

  const getActiveDays = schedule => {
    if (!schedule) return [];
    if (Array.isArray(schedule)) {
      return schedule.map(day => day.slice(0, 3));
    }
    if (typeof schedule === "object") {
      const days = Array.isArray(schedule.days) ? schedule.days : [];
      return days.map(day => day.slice(0, 3));
    }
    return [];
  };

  const scheduleDays = getActiveDays(activeCluster?.schedule);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const scheduleTimeLabel = formatScheduleTime(activeCluster?.schedule);

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
          <div className="nav-item">Dashboard</div>
          <div className="nav-item active">Team</div>
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
            <div className="section-title">My team cluster overview</div>
          </div>
          <span className="datetime">{dateTimeLabel}</span>
        </header>

        <section className="content content-muted">

          {data.length === 0 && (
            <div className="empty-state">No team cluster details available.</div>
          )}

          {data.length > 0 && (
            <div className="employee-panel">
              <div className="employee-card">
                <div className="employee-card-header">
                  <div className="employee-card-title">My Team Cluster Details</div>
                </div>
                <div className="employee-card-body">
                  <div className="employee-field">
                    <div className="employee-field-label">Cluster Name</div>
                    <div className="employee-field-value">
                      {activeCluster?.cluster_name ?? "Not assigned"}
                    </div>
                  </div>
                  <div className="employee-field">
                    <div className="employee-field-label">Team Coach</div>
                    <div className="employee-field-value">
                      {activeCluster?.coach_name ?? "Pending"}
                    </div>
                  </div>
                </div>
                <div className="employee-card-footer">
                  <button className="btn link" type="button">
                    View
                  </button>
                </div>
              </div>
              <div className="employee-card">
                <div className="employee-card-header">
                  <div className="employee-card-title">My Schedule</div>
                </div>
                <div className="employee-card-body">
                  <div className="schedule-week">
                    {dayLabels.map(day => (
                      <div
                        key={day}
                        className={`schedule-day${
                          scheduleDays.includes(day) ? " active" : ""
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                   <div className="schedule-times">
                    {dayLabels.map(day => {
                      const isActive = scheduleDays.includes(day);
                      return (
                        <div
                          key={`${day}-time`}
                          className={`schedule-time${isActive ? " active" : ""}`}
                        >
                          {isActive ? scheduleTimeLabel : "—"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}