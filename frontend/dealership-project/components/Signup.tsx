"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import api from "../api/axiosinstance";

const ROLES = [
  "Sales Associate",
  "Finance Manager",
  "Lot Manager",
  "Service Advisor",
  "General Manager",
] as const;

interface SignupProps {
  onNavigateLogin: () => void;
}

interface SignupForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}

const BLANK: SignupForm = {
  firstName: "", lastName: "", username: "",
  email: "", role: "", password: "", confirmPassword: "",
};

export default function Signup({ onNavigateLogin }: SignupProps) {
  const [form, setForm]       = useState<SignupForm>(BLANK);
  const [error, setError]     = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = (): string | null => {
    if (Object.values(form).some((v) => !v)) return "All fields are required.";
    if (form.password.length < 6)            return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (!form.email.includes("@"))           return "Please enter a valid email address.";
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await api.post("/api/employees/register", {
        firstName: form.firstName,
        lastName:  form.lastName,
        username:  form.username,
        email:     form.email,
        password:  form.password,
        role:      form.role,
        active:    true,
      });
      setSuccess(`Account created for ${form.firstName} ${form.lastName}. You can now log in.`);
      setForm(BLANK);
    } catch {
      setError("Failed to create account. Username may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="signup-root">
        <div className="grid-bg" />
        <div className="signup-card">
          <div className="corner-deco" />

          <button className="back-btn" onClick={onNavigateLogin}>
            ← Back to Login
          </button>

          <div className="signup-title">Create Account</div>
          <div className="signup-subtitle">Register your dealership employee profile</div>

          {error   && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="section-divider"><span>Personal Info</span></div>
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">First Name</label>
                <input className="field-input" name="firstName" placeholder="John"
                  value={form.firstName} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Last Name</label>
                <input className="field-input" name="lastName" placeholder="Smith"
                  value={form.lastName} onChange={handleChange} />
              </div>
              <div className="field-group full-width">
                <label className="field-label">Email Address</label>
                <input className="field-input" name="email" type="email"
                  placeholder="john.smith@apexmotors.com"
                  value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="section-divider"><span>Account Setup</span></div>
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">Username</label>
                <input className="field-input" name="username" placeholder="j.smith"
                  value={form.username} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Role</label>
                <div className="select-wrapper">
                  <select className="field-select" name="role"
                    value={form.role} onChange={handleChange}>
                    <option value="">Select role…</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Password</label>
                <input className="field-input" name="password" type="password"
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Confirm Password</label>
                <input className="field-input" name="confirmPassword" type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            <button className="btn-signup" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Submit Request"}
            </button>
          </form>

          <div className="login-link">
            Already have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateLogin(); }}>
              Sign in
            </a>
          </div>
        </div>
      </div>
    </>
  );
}