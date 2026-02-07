import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function CoachDashboard() {
  const [clusters, setClusters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCluster, setActiveCluster] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberError, setMemberError] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState("");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    apiFetch("api/coach_clusters.php").then(setClusters);
  }, []);

  useEffect(() => {
    if (!activeCluster) return;
    setMemberLoading(true);
    setEmployeeLoading(true);
    setMemberError("");
    setEmployeeError("");
    setShowMemberForm(false);
    setSelectedEmployee("");

    Promise.all([
      apiFetch(`api/manage_members.php?cluster_id=${activeCluster.id}`),
      apiFetch("api/employee_list.php")
    ])
      .then(([memberData, employeeData]) => {
        setMembers(memberData);
        const assigned = new Set(memberData.map(member => member.id));
        setAvailableEmployees(
          employeeData.filter(employee => !assigned.has(employee.id))
        );
      })
      .catch(err => {
        const message = err?.error ?? "Unable to load team members.";
        setMemberError(message);
        setEmployeeError(message);
      })
      .finally(() => {
        setMemberLoading(false);
        setEmployeeLoading(false);
      });
  }, [activeCluster]);

  const handleLogout = async () => {
    try {
      await apiFetch("auth/logout.php", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      window.location.href = "/login";
    }
  };

  const handleChange = event => {
    const { name, value } = event.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = value => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 10);
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

  const handleManageClick = cluster => {
    setActiveCluster(cluster);
  };

  const handleCloseModal = () => {
    setActiveCluster(null);
    setMembers([]);
    setAvailableEmployees([]);
    setMemberError("");
    setEmployeeError("");
  };

  const handleAddMember = async () => {
    if (!selectedEmployee || isAddingMember || !activeCluster) return;
    setIsAddingMember(true);
    setMemberError("");

    try {
      const added = await apiFetch("api/add_member.php", {
        method: "POST",
        body: JSON.stringify({
          cluster_id: activeCluster.id,
          employee_id: Number(selectedEmployee)
        })
      });
      setMembers(prev => [...prev, added]);
      setAvailableEmployees(prev =>
        prev.filter(employee => employee.id !== added.id)
      );
      setSelectedEmployee("");
      setShowMemberForm(false);
      setClusters(prev =>
        prev.map(cluster =>
          cluster.id === activeCluster.id
            ? { ...cluster, members: (cluster.members ?? 0) + 1 }
            : cluster
        )
      );
    } catch (err) {
      setMemberError(err?.error ?? "Unable to add member.");
    } finally {
      setIsAddingMember(false);
    }
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

        <button className="sidebar-footer" type="button" onClick={handleLogout}>
          Log Out
        </button>
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
        
          {clusters.length > 0 && (
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
                  <div className="table-cell muted">
                    {c.description || "—"}
                  </div>
                  <div className="table-cell">{c.members ?? 0}</div>
                  <div className="table-cell">{formatDate(c.created_at)}</div>
                  <div className="table-cell">
                    <span className={`badge ${c.status}`}>{c.status}</span>
                  </div>
                  <div className="table-cell">
                    <button
                      className="btn link"
                      type="button"
                      disabled={c.status !== "active"}
                      onClick={() => handleManageClick(c)}
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {activeCluster && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <div className="modal-title">Manage Team</div>
                  <div className="modal-subtitle">
                    {activeCluster.name}
                  </div>
                </div>
                <button
                  className="btn link"
                  type="button"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
              <div className="modal-body">
                <p className="modal-text">
                  Add or update members for this team cluster.
                </p>
                {memberLoading ? (
                  <div className="modal-text">Loading members...</div>
                ) : (
                  <div className="member-list">
                    {members.length === 0 && (
                      <div className="modal-text">No members assigned yet.</div>
                    )}
                    {members.map(member => (
                      <div key={member.id} className="member-item">
                        {member.fullname}
                      </div>
                    ))}
                  </div>
                )}
                {memberError && <div className="error">{memberError}</div>}
                <div className="member-actions">
                  <button
                    className="btn primary"
                    type="button"
                    onClick={() => setShowMemberForm(prev => !prev)}
                    disabled={employeeLoading || availableEmployees.length === 0}
                  >
                    + Add Member
                  </button>
                  {employeeLoading && (
                    <span className="modal-text">Loading employees...</span>
                  )}
                  {!employeeLoading &&
                    availableEmployees.length === 0 &&
                    !employeeError && (
                      <span className="modal-text">
                        All employees are already assigned.
                      </span>
                    )}
                </div>
                {employeeError && <div className="error">{employeeError}</div>}
                {showMemberForm && availableEmployees.length > 0 && (
                  <div className="member-form">
                    <label className="form-field">
                      <span>Select employee</span>
                      <select
                        className="member-select"
                        value={selectedEmployee}
                        onChange={event => setSelectedEmployee(event.target.value)}
                      >
                        <option value="">Choose a member</option>
                        {availableEmployees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.fullname}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={handleAddMember}
                      disabled={!selectedEmployee || isAddingMember}
                    >
                      {isAddingMember ? "Adding..." : "Confirm"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}