import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import ClusterCard from "../src/components/ClusterCard";

export default function CoachDashboard() {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    apiFetch("coach/get_clusters.php").then(setClusters);
  }, []);

  return (
    <div className="container">
      <h2>Team Coach Dashboard</h2>

      <div className="list">
        {clusters.map(c => (
          <ClusterCard key={c.id} cluster={c} />
        ))}
      </div>
    </div>
  );
}