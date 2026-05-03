"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { AuthEmployee, EmployeeRole } from "../app/types";
import api from "../api/axiosinstance";

interface LoginProps {
  onLogin: (user: AuthEmployee) => void;
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
  startDate?: string;
}

export default function Login({ onLogin }: LoginProps) {
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
      const res = await api.post<UserResponse>("/api/employees/login", {
        username: form.username,
        password: form.password,
      });
      const user = res.data;
      const authUser: AuthEmployee = {
        id:        user.id,
        firstName: user.firstName,
        lastName:  user.lastName,
        username:  user.username,
        email:     user.email,
        role:      user.role as EmployeeRole,
        startDate: user.startDate || "",
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

      <div className="login-left">
        <div className="login-dealer-name">Mario&apos;s<br />Auto Sales</div>
      </div>

      {/* Right — form panel */}
      <div className="login-right">
        <div className="form-title">Employee Login</div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Username</label>
            <input
              className="field-input"
              name="username"
              type="text"
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
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}