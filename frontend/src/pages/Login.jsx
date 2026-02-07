import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        "http://localhost/team-cluster/backend/auth/login.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await res.json();

      if (!res.ok) throw data;

      const normalizedRole = String(data.role || "").toLowerCase();
      const redirectPath = data.redirect
        || (normalizedRole.includes("admin")
          ? "/admin"
          : normalizedRole.includes("coach")
            ? "/coach"
            : "/employee");

      window.location.href = redirectPath;
    } catch (err) {
      setError(err.error || "Login failed");
    }
  }

  return (
    <div className="container">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn">Login</button>

        <p>
          No account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}