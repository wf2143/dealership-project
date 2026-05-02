"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { AuthUser, UserRole } from "../app/types";
import api from "../api/axiosinstance";

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  onNavigateSignup: () => void;
}

interface LoginForm {
  username: string;
  password: string;
}

interface EmployeeResponse {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  hireDate: string;
}

export default function Login({ onLogin, onNavigateSignup }: LoginProps) {
  const [form, setForm]       = useState<LoginForm>({ username: "", password: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError]     = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleDemoLogin = (): void => {
    onLogin({
      id:         1,
      firstName:  "Demo",
      lastName:   "User",
      username:   "admin",
      email:      "demo@apexmotors.com",
      role:       "MANAGER" as UserRole,
      employeeId: "EMP-0001",
      startDate:  "2024-01-01",
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<EmployeeResponse>("/api/employees/login", {
        username: form.username,
        password: form.password,
      });
      const emp = res.data;
      const authUser: AuthUser = {
        id:         emp.id,
        firstName:  emp.firstName,
        lastName:   emp.lastName,
        username:   emp.username,
        email:      emp.email,
        role:       emp.role as UserRole,
        employeeId: `EMP-${String(emp.id).padStart(4, "0")}`,
        startDate:  emp.hireDate ?? "",
      };
      onLogin(authUser);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
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
            <button
              className="btn-login"
              type="button"
              onClick={handleDemoLogin}
              style={{ marginTop: "0.5rem", opacity: 0.75 }}
            >
              Demo Login
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