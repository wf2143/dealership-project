import { useState, ChangeEvent, FormEvent } from "react";
import { AuthUser } from "../types";
import { DEMO_ACCOUNTS } from "../app/page";

const DEMO_PASSWORD = "apexmotors2024";

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  onNavigateSignup: () => void;
}

interface LoginForm {
  username: string;
  password: string;
}

export default function Login({ onLogin, onNavigateSignup }: LoginProps) {
  const [form, setForm]       = useState<LoginForm>({ username: "", password: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError]     = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const match = DEMO_ACCOUNTS.find(
        (a) => a.username === form.username && form.password === DEMO_PASSWORD
      );
      if (match) {
        onLogin(match);
      } else {
        setError("Invalid username or password.");
      }
      setLoading(false);
    }, 400); // small delay so it feels like a real request
  };

  return (
    <>
      <div className="login-root">
        <div className="login-bg-art" />

        {/* Left brand panel */}
        <div className="login-left">
          <div className="brand-badge">
            <div className="brand-icon" />
            <span className="brand-name">Apex Motors</span>
          </div>
          <div className="login-headline">
            Drive<br />
            <span>Your</span><br />
            Inventory.
          </div>
          <div className="divider-line" />
          <p className="login-subtext">
            The complete dealership management platform for professionals
            who demand precision, speed, and control over every vehicle
            on the lot.
          </p>
        </div>

        {/* Right form panel */}
        <div className="login-right">
          <div className="form-title">Employee Login</div>
          <div className="form-subtitle">Access your dealership portal</div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Username</label>
              <input
                className="field-input"
                name="username"
                type="text"
                placeholder="your.username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="signup-prompt">
            New employee?{" "}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigateSignup(); }}
            >
              Request access
            </a>
          </div>
        </div>
      </div>
    </>
  );
}