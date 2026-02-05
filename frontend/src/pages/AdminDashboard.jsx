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
    <div className="container">
      <h2>Admin Dashboard</h2>

      {clusters.map(c => (
        <div key={c.id} className="card">
          <strong>{c.name}</strong>
          <p>{c.description}</p>
          <small>Coach: {c.coach}</small>

          <div style={{ marginTop: 10 }}>
            <button className="btn" onClick={() => updateStatus(c.id, "approved")}>
              Approve
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
    </div>
  );
}