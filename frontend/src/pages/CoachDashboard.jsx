import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import useLiveDateTime from "../hooks/useLiveDateTime";
import useCurrentUser from "../hooks/useCurrentUser";

export default function CoachDashboard() {
  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const defaultDaySchedule = {
    startTime: "9:00",
    startPeriod: "AM",
    endTime: "5:00",
    endPeriod: "PM"
  };
  const timeOptions = Array.from({ length: 12 * 60 }, (_, index) => {
    const hour = Math.floor(index / 60) + 1;
    const minute = index % 60;
    return `${hour}:${minute.toString().padStart(2, "0")}`;
  });
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
  const [scheduleMember, setScheduleMember] = useState(null);
  const [scheduleError, setScheduleError] = useState("");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [isDisbanding, setIsDisbanding] = useState(false);
  const [activeMembers, setActiveMembers] = useState([]);
  const [activeMembersLoading, setActiveMembersLoading] = useState(false);
  const [activeMembersError, setActiveMembersError] = useState("");
  const [scheduleForm, setScheduleForm] = useState({
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    daySchedules: {
      Mon: { ...defaultDaySchedule },
      Tue: { ...defaultDaySchedule },
      Wed: { ...defaultDaySchedule },
      Thu: { ...defaultDaySchedule },
      Fri: { ...defaultDaySchedule }
    }
  });
  const dateTimeLabel = useLiveDateTime();
  const { user } = useCurrentUser();

  const normalizeSchedule = schedule => {
    if (!schedule) return schedule;
    if (typeof schedule === "string") {
      try {
        return JSON.parse(schedule);
      } catch {
        return schedule;
      }
    }
    return schedule;
  };

  const createDaySchedules = (days = [], baseSchedule = {}) => {
    const daySchedules = {};
    dayOptions.forEach(day => {
      daySchedules[day] = {
        startTime: baseSchedule.startTime ?? "9:00",
        startPeriod: baseSchedule.startPeriod ?? "AM",
        endTime: baseSchedule.endTime ?? "5:00",
        endPeriod: baseSchedule.endPeriod ?? "PM"
      };
    });

    if (baseSchedule && typeof baseSchedule === "object") {
      const source =
        baseSchedule.daySchedules && typeof baseSchedule.daySchedules === "object"
          ? baseSchedule.daySchedules
          : {};

      Object.entries(source).forEach(([day, value]) => {
        if (!dayOptions.includes(day) || !value || typeof value !== "object") return;
        daySchedules[day] = {
          startTime: value.startTime ?? daySchedules[day].startTime,
          startPeriod: value.startPeriod ?? daySchedules[day].startPeriod,
          endTime: value.endTime ?? daySchedules[day].endTime,
          endPeriod: value.endPeriod ?? daySchedules[day].endPeriod
        };
      });
    }

    days.forEach(day => {
      if (!dayOptions.includes(day)) return;
      if (!daySchedules[day]) {
        daySchedules[day] = { ...defaultDaySchedule };
      }
    });

    return daySchedules;
  };

  const buildScheduleForm = schedule => {
    if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
      const defaultDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      return {
        days: defaultDays,
        daySchedules: createDaySchedules(defaultDays)
      };
    }

    const days = Array.isArray(schedule.days)
      ? schedule.days.filter(day => dayOptions.includes(day))
      : ["Mon", "Tue", "Wed", "Thu", "Fri"];

    return {
      days,
      daySchedules: createDaySchedules(days, schedule)
    };
  };

  const formatTimeRange = schedule => {
    if (!schedule || typeof schedule !== "object") return "";
    const startTime = schedule.startTime ?? "9:00";
    const startPeriod = schedule.startPeriod ?? "AM";
    const endTime = schedule.endTime ?? "5:00";
    const endPeriod = schedule.endPeriod ?? "PM";
    return `${startTime} ${startPeriod} - ${endTime} ${endPeriod}`;
  };

  useEffect(() => {
    apiFetch("api/coach_clusters.php").then(setClusters);
  }, []);

useEffect(() => {
    const active = clusters.find(cluster => cluster.status === "active");
    if (!active) {
      setActiveMembers([]);
      setActiveMembersError("");
      setActiveMembersLoading(false);
      return;
    }

    setActiveMembersLoading(true);
    setActiveMembersError("");

    apiFetch(`api/manage_members.php?cluster_id=${active.id}`)
      .then(memberData => {
        const normalizedMembers = memberData.map(member => ({
          ...member,
          schedule: normalizeSchedule(member.schedule)
        }));
        setActiveMembers(normalizedMembers);
      })
      .catch(err => {
        setActiveMembersError(err?.error ?? "Unable to load active team members.");
      })
      .finally(() => {
        setActiveMembersLoading(false);
      });
  }, [clusters]);

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
        const normalizedMembers = memberData.map(member => ({
          ...member,
          schedule: normalizeSchedule(member.schedule)
        }));
        setMembers(normalizedMembers);
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
    } catch {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("teamClusterUser");
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
    if (clusters.length > 0) {
      setError("Only one team cluster is allowed per team coach.");
      return;
    }
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

  const handleDisbandCluster = async cluster => {
    if (!cluster || isDisbanding) return;
    const confirmed = window.confirm(
      `Disband ${cluster.name}? This will remove all members and schedules.`
    );
    if (!confirmed) return;

    setIsDisbanding(true);
    setError("");

    try {
      await apiFetch("api/disband_cluster.php", {
        method: "POST",
        body: JSON.stringify({ cluster_id: cluster.id })
      });
      setClusters(prev => prev.filter(item => item.id !== cluster.id));
      if (activeCluster?.id === cluster.id) {
        handleCloseModal();
      }
      setShowForm(false);
    } catch (err) {
      setError(err?.error ?? "Unable to disband cluster.");
    } finally {
      setIsDisbanding(false);
    }
  };

  const handleCloseModal = () => {
    setActiveCluster(null);
    setMembers([]);
    setAvailableEmployees([]);
    setMemberError("");
    setEmployeeError("");
    setScheduleMember(null);
    setScheduleError("");
  };

  const handleOpenSchedule = member => {
    const normalizedSchedule = normalizeSchedule(member?.schedule);
    setScheduleMember({ ...member, schedule: normalizedSchedule });
    setScheduleError("");
    setScheduleForm(buildScheduleForm(normalizedSchedule));
  };

  const handleCloseSchedule = () => {
    setScheduleMember(null);
    setScheduleError("");
  };

  const handleToggleDay = day => {
    setScheduleForm(prev => {
      const hasDay = prev.days.includes(day);
      return {
        ...prev,
         days: hasDay ? prev.days.filter(item => item !== day) : [...prev.days, day],
        daySchedules: {
          ...prev.daySchedules,
          [day]: prev.daySchedules?.[day] ?? { ...defaultDaySchedule }
        }
      };
    });
  };

  const handleChangeDayTime = (day, field, value) => {
    setScheduleForm(prev => ({
      ...prev,
      daySchedules: {
        ...prev.daySchedules,
        [day]: {
          ...(prev.daySchedules?.[day] ?? { ...defaultDaySchedule }),
          [field]: value
        }
      }
    }));
  };

  const renderScheduleDays = member => {
    if (!member?.schedule) return "Not scheduled";
    const normalizedSchedule = normalizeSchedule(member.schedule);
    if (Array.isArray(normalizedSchedule)) return normalizedSchedule.join(", ");
    if (
      normalizedSchedule &&
      typeof normalizedSchedule === "object" &&
      Array.isArray(normalizedSchedule.days) &&
      normalizedSchedule.days.length > 0
    ) {
      return normalizedSchedule.days
        .map(day => {
          const daySchedule = normalizedSchedule.daySchedules?.[day];
          return daySchedule ? `${day} (${formatTimeRange(daySchedule)})` : day;
        })
        .join(", ");
    }
    return "Not scheduled";
  };

  const getScheduleSummary = member => {
    const normalizedSchedule = normalizeSchedule(member?.schedule);
    if (!normalizedSchedule || Array.isArray(normalizedSchedule)) {
      return "Not scheduled";
    }

    const days = Array.isArray(normalizedSchedule.days) ? normalizedSchedule.days : [];
    if (days.length === 0) return "Not scheduled";

    const firstDaySchedule = normalizedSchedule.daySchedules?.[days[0]];
    if (!firstDaySchedule) return "Schedule set";

    const firstRange = formatTimeRange(firstDaySchedule);
    const hasMixedRanges = days.some(day => {
      const daySchedule = normalizedSchedule.daySchedules?.[day];
      if (!daySchedule) return true;
      return formatTimeRange(daySchedule) !== firstRange;
    });

    return hasMixedRanges ? "Variable shifts" : firstRange;
  };

  const getAssignedDays = member => {
    const normalizedSchedule = normalizeSchedule(member?.schedule);
    if (
      normalizedSchedule &&
      typeof normalizedSchedule === "object" &&
      !Array.isArray(normalizedSchedule) &&
      Array.isArray(normalizedSchedule.days) &&
      normalizedSchedule.days.length > 0
    ) {
      return normalizedSchedule.days;
    }

    if (Array.isArray(normalizedSchedule) && normalizedSchedule.length > 0) {
      return normalizedSchedule;
    }

    return [];
  };

  const handleSaveSchedule = async () => {
    if (!scheduleMember || !activeCluster || isSavingSchedule) return;
    setIsSavingSchedule(true);
    setScheduleError("");

    try {
      const payload = {
        cluster_id: activeCluster.id,
        employee_id: scheduleMember.id,
        schedule: scheduleForm
      };

      await apiFetch("api/save_schedule.php", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setMembers(prev =>
        prev.map(member =>
          member.id === scheduleMember.id
            ? { ...member, schedule: scheduleForm }
            : member
        )
      );
      setActiveMembers(prev =>
        prev.map(member =>
          member.id === scheduleMember.id
            ? { ...member, schedule: scheduleForm }
            : member
        )
      );
      setScheduleMember(prev =>
        prev ? { ...prev, schedule: scheduleForm } : prev
      );
      handleCloseSchedule();
    } catch (err) {
      setScheduleError(err?.error ?? "Unable to save schedule.");
    } finally {
      setIsSavingSchedule(false);
    }
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
      setActiveMembers(prev => [...prev, added]);
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

  const handleDeleteMember = async member => {
    if (!member || !activeCluster || isDeletingMember) return;
    const confirmed = window.confirm(
      `Remove ${member.fullname} from ${activeCluster.name}?`
    );
    if (!confirmed) return;
    setIsDeletingMember(true);
    setMemberError("");

    try {
      await apiFetch("api/delete_member.php", {
        method: "POST",
        body: JSON.stringify({
          cluster_id: activeCluster.id,
          employee_id: member.id
        })
      });

      setMembers(prev => prev.filter(item => item.id !== member.id));
      setActiveMembers(prev => prev.filter(item => item.id !== member.id));
      setAvailableEmployees(prev => [...prev, { id: member.id, fullname: member.fullname }]);
      setClusters(prev =>
        prev.map(cluster =>
          cluster.id === activeCluster.id
            ? { ...cluster, members: Math.max((cluster.members ?? 1) - 1, 0) }
            : cluster
        )
      );
    } catch (err) {
      setMemberError(err?.error ?? "Unable to remove member.");
    } finally {
      setIsDeletingMember(false);
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="avatar">TC</div>
          <div>
            <div>Team Coach</div>
            <div className="user-meta">{user?.fullname ?? "Team Coach"}</div>
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
            <span className="datetime">{dateTimeLabel}</span>
           {clusters.length === 0 && (
              <button
                className="btn primary"
                type="button"
                onClick={() => setShowForm(prev => !prev)}
              >
                {showForm ? "Close" : "+ Add Cluster"}
              </button>
            )}
          </div>
        </header>

        <section className="content">
          {showForm && clusters.length === 0 && (
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
                    <button
                      className="btn danger"
                      type="button"
                      onClick={() => handleDisbandCluster(c)}
                      disabled={isDisbanding}
                    >
                      {isDisbanding ? "Disbanding..." : "Disband"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {clusters.some(cluster => cluster.status === "active") && (
            <div className="active-team-panel">
              <div className="section-title">Active Team Members</div>
              {activeMembersLoading && (
                <div className="modal-text">Loading members...</div>
              )}
              {!activeMembersLoading && activeMembersError && (
                <div className="error">{activeMembersError}</div>
              )}
              {!activeMembersLoading && !activeMembersError && activeMembers.length === 0 && (
                <div className="empty-state">No employees added to the active cluster yet.</div>
              )}
              {!activeMembersLoading && !activeMembersError && activeMembers.length > 0 && (
                <div className="member-list member-list-dashboard">
                  <div className="member-header">
                    <span>Members</span>
                    <span>Assigned Days</span>
                    <span />
                  </div>
                  {activeMembers.map(member => (
                    <div key={member.id} className="member-item">
                      <div className="member-name">{member.fullname}</div>
                      <div className="member-days">
                        {renderScheduleDays(member)}
                      </div>
                      <div />
                    </div>
                  ))}
                </div>
              )}
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
                   className="btn link modal-close-btn"
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
                    {members.length > 0 && (
                      <div className="member-header">
                        <span>Members</span>
                        <span>Current Schedule</span>
                        <span>Assigned Days</span>
                        <span className="member-action-col">Actions</span>
                      </div>
                    )}
                    {members.map(member => (
                      <div key={member.id} className="member-item">
                        <div className="member-name">{member.fullname}</div>
                        <div className="member-schedule-summary">
                          {getScheduleSummary(member)}
                        </div>
                        <div className="member-days">
                          {getAssignedDays(member).length > 0 ? (
                            <div className="member-day-chips">
                              {getAssignedDays(member).map(day => (
                                <span key={`${member.id}-${day}`} className="member-day-chip">
                                  {day}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "Not scheduled"
                          )}
                        </div>
                        <div className="member-action">
                          <button
                            className="btn link"
                            type="button"
                            onClick={() => handleOpenSchedule(member)}
                          >
                            Schedule
                          </button>
                          <button
                            className="btn danger"
                            type="button"
                            onClick={() => handleDeleteMember(member)}
                            disabled={isDeletingMember}
                          >
                            Delete
                          </button>
                        </div>
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
        {scheduleMember && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card schedule-modal">
              <div className="modal-header">
                <div>
                  <div className="modal-title">Manage Member Schedule</div>
                  <div className="modal-subtitle">
                    {scheduleMember.fullname}
                  </div>
                </div>
                <button
                   className="btn link modal-close-btn"
                  type="button"
                  onClick={handleCloseSchedule}
                >
                  Close
                </button>
              </div>
              <div className="modal-body">
                <div className="schedule-card">
                  <div className="schedule-label">Schedule Details</div>
                  <div className="schedule-day-grid">
                    {dayOptions.map(day => {
                      const isWorkingDay = scheduleForm.days.includes(day);
                      const daySchedule = scheduleForm.daySchedules?.[day] ?? defaultDaySchedule;

                      return (
                        <div key={day} className="schedule-day-row">
                          <label className="schedule-day-toggle">
                            <input
                              type="checkbox"
                              checked={isWorkingDay}
                              onChange={() => handleToggleDay(day)}
                            />
                            <span>{day}</span>
                          </label>
                          {isWorkingDay ? (
                            <div className="schedule-time-row">
                              <select
                                value={daySchedule.startTime}
                                onChange={event =>
                                  handleChangeDayTime(day, "startTime", event.target.value)
                                }
                              >
                                {timeOptions.map(time => (
                                  <option key={`${day}-start-${time}`} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={daySchedule.startPeriod}
                                onChange={event =>
                                  handleChangeDayTime(day, "startPeriod", event.target.value)
                                }
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                              <select
                                value={daySchedule.endTime}
                                onChange={event =>
                                  handleChangeDayTime(day, "endTime", event.target.value)
                                }
                              >
                                {timeOptions.map(time => (
                                  <option key={`${day}-end-${time}`} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={daySchedule.endPeriod}
                                onChange={event =>
                                  handleChangeDayTime(day, "endPeriod", event.target.value)
                                }
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          ) : (
                            <div className="schedule-not-working">Not working</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="form-actions">
                  {scheduleError && <div className="error">{scheduleError}</div>}
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={handleCloseSchedule}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn primary"
                    type="button"
                    onClick={handleSaveSchedule}
                    disabled={isSavingSchedule}
                  >
                    {isSavingSchedule ? "Saving..." : "Save Schedule"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}