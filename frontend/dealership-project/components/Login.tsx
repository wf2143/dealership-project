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

interface EmployeeResponse {
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
      const res = await api.post<EmployeeResponse>("/api/employees/login", {
        username: form.username,
        password: form.password,
      });
      const emp = res.data;
      const authEmployee: AuthEmployee = {
        id:        emp.id,
        firstName: emp.firstName,
        lastName:  emp.lastName,
        username:  emp.username,
        email:     emp.email,
        role:      emp.role as EmployeeRole,
        startDate: emp.startDate || "",
      };
      onLogin(authEmployee);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-title">Mario&apos;s Auto Sales — Login</div>

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
