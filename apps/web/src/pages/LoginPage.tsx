import { useState, type FormEvent } from "react";
import { useRuntime } from "../providers/RuntimeProvider.js";

export function LoginPage() {
  const { login, loading, error } = useRuntime();
  const [email, setEmail] = useState("customer.demo@anact.local");
  const [password, setPassword] = useState("demo-password-123");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await login(email, password);
  }

  return (
    <main style={{ maxWidth: "420px", margin: "48px auto", padding: "16px" }}>
      <h1 style={{ marginBottom: "8px" }}>AN ACT</h1>
      <p style={{ marginTop: 0, opacity: 0.75 }}>Runtime JSON login — server authoritative</p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "12px" }}>
        <label style={{ display: "grid", gap: "4px" }}>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </label>
        <label style={{ display: "grid", gap: "4px" }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error ? <p role="alert">{error}</p> : null}
      </form>
    </main>
  );
}
