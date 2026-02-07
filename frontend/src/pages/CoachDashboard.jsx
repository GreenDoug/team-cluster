import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function CoachDashboard() {
  const [clusters, setClusters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiFetch("api/coach_clusters.php").then(setClusters);
  }, []);

const handleChange = event => {
    const { name, value } = event.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        name: formValues.name.trim(),
        description: formValues.description.trim()
      };

      const created = await apiFetch("api/create_cluster.php", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setClusters(prev => [created, ...prev]);
      setFormValues({ name: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setError(err?.error ?? "Unable to create cluster.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormValues({ name: "", description: "" });
    setError("");
  };

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
            <button
              className="btn primary"
              type="button"
              onClick={() => setShowForm(prev => !prev)}
            >
              {showForm ? "Close" : "+ Add Cluster"}
            </button>
          </div>
        </header>

        <section className="content">
          {showForm && (
            <form className="card cluster-form" onSubmit={handleSubmit}>
              <div className="form-header">Create Team Cluster</div>
              <div className="form-grid">
                <label className="form-field">
                  <span>Cluster Name</span>
                  <input
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    placeholder="Enter a cluster name"
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={formValues.description}
                    onChange={handleChange}
                    placeholder="Add a short description"
                    rows={3}
                  />
                </label>
              </div>
              {error && <div className="error">{error}</div>}
              <div className="form-actions">
                <button
                  className="btn secondary"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="btn primary"
                  type="submit"
                  disabled={isSubmitting || !formValues.name.trim()}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          )}
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