const BASE_URL = "http://localhost/team-cluster/backend";

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}