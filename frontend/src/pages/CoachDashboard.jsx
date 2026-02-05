import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function CoachDashboard() {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    apiFetch("api/coach_clusters.php").then(setClusters);
  }, []);

  return (
    <div className="container">
      <h2>Team Coach Dashboard</h2>

      {clusters.map(c => (
        <div key={c.id} className="card list-item">
          <div>
            <strong>{c.name}</strong><br />
            <span className={`badge ${c.status}`}>{c.status}</span>
          </div>

          <button
            className="btn"
            disabled={c.status !== "approved"}
            onClick={() =>
              window.location.href =
                `/coach/manage_members.php?cluster_id=${c.id}`
            }
          >
            Manage Cluster
          </button>
        </div>
      ))}
    </div>
  );
}