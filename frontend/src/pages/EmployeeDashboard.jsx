import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function EmployeeDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch("api/employee_clusters.php").then(setData);
  }, []);

  return (
    <div className="container">
      <h2>My Team Cluster Details</h2>

      {data.map((c, i) => (
        <div key={i} className="card">
          <strong>Cluster:</strong> {c.cluster_name}<br />
          <strong>Coach:</strong> {c.coach_name}<br />
          <strong>Schedule:</strong>{" "}
          {c.schedule ? JSON.stringify(c.schedule) : "Not assigned"}
        </div>
      ))}
    </div>
  );
}