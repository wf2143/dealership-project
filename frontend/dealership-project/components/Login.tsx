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

interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  employeeId?: string;
  startDate?: string;
}

export default function Login({ onLogin, onNavigateSignup }: LoginProps) {
  const [form, setForm]       = useState<LoginForm>({ username: "", password: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError]     = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<UserResponse>("/api/users/login", {
        username: form.username,
        password: form.password,
      });
      const user = res.data;
      const authUser: AuthUser = {
        id:         user.id,
        firstName:  user.firstName,
        lastName:   user.lastName,
        username:   user.username,
        email:      user.email,
        role:       user.role as UserRole,
        employeeId: user.employeeId || `EMP-${String(user.id).padStart(4, "0")}`,
        startDate:  user.startDate || "",
      };
      onLogin(authUser);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-bg-art" />

      {/* Left — dealership name only, no logo, no motto */}
      <div className="login-left">
        <div className="login-dealer-name">Mario&apos;s<br />Auto Sales</div>
        <div className="divider-line" />
      </div>

      {/* Right — form panel */}
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
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateSignup(); }}>
            Request access
          </a>
        </div>
      </div>
    </div>
  );
}