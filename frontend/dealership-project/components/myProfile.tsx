"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { AuthUser } from "../app/types";
import api from "../api/axiosinstance";

interface ProfileProps {
  user: AuthUser;
}

interface EmployeeProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  hireDate: string;
  active: boolean;
}

type TabKey = "edit" | "activity" | "security";

interface PwForm {
  current: string;
  next: string;
  confirm: string;
}

const MOCK_LOG = [
  { time: "Today 9:41",  action: "Added vehicle to inventory",  detail: "2023 BMW M3 · VIN WBS8M9C59J" },
  { time: "Today 8:15",  action: "Closed sale",                 detail: "2022 Audi Q7 · $58,400" },
  { time: "Yesterday",   action: "Updated vehicle details",     detail: "2021 Ford F-150 · Mileage corrected" },
  { time: "Mon 2:30p",   action: "Submitted appraisal",         detail: "2019 Honda CR-V · Trade-in $19,200" },
  { time: "Mon 11:00a",  action: "Logged in",                   detail: "Session started" },
  { time: "Fri 4:45p",   action: "Changed vehicle status",      detail: "2020 Chevy Malibu → On Hold" },
];

export default function Profile({ user }: ProfileProps) {
  const [tab, setTab]           = useState<TabKey>("edit");
  const [saved, setSaved]       = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const [profile, setProfile]   = useState<EmployeeProfile | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", username: "", email: "" });
  const [pwForm, setPwForm]     = useState<PwForm>({ current: "", next: "", confirm: "" });

  useEffect(() => {
    api.get<EmployeeProfile>(`/api/employees/${user.id}`)
      .then((res) => {
        setProfile(res.data);
        setEditForm({
          firstName: res.data.firstName ?? "",
          lastName:  res.data.lastName  ?? "",
          username:  res.data.username  ?? "",
          email:     res.data.email     ?? "",
        });
      })
      .catch(() => {
        // Fall back to auth user data if fetch fails
        setEditForm({
          firstName: user.firstName ?? "",
          lastName:  user.lastName  ?? "",
          username:  user.username,
          email:     user.email,
        });
      });
  }, [user]);

  const handleSave = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaveError("");
    try {
      const res = await api.put<EmployeeProfile>(`/api/employees/${user.id}`, editForm);
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Failed to save changes.");
    }
  };

  const displayUser = profile ?? {
    firstName:  user.firstName,
    lastName:   user.lastName ?? "",
    username:   user.username,
    email:      user.email,
    role:       user.role,
    hireDate:   user.startDate,
    active:     true,
    id:         user.id,
  };

  return (
    <>
      <div className="profile-root">

        {/* Cover */}
        <div className="profile-cover">
          <div className="cover-pattern" />
          <div className="cover-accent" />
          <div className="cover-label">PROFILE</div>
        </div>

        <div className="profile-layout">

          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="avatar-section">
              <div className="avatar-ring">
                <div className="avatar-inner">
                  {displayUser.firstName?.[0]}{displayUser.lastName?.[0]}
                </div>
              </div>
              <div className="profile-name">{displayUser.firstName} {displayUser.lastName}</div>
              <div className="profile-role-tag">{displayUser.role}</div>
              <div className="profile-id">ID: {user.employeeId}</div>
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section">
              <div className="sidebar-label">Info</div>
              {[
                { k: "Username",     v: displayUser.username  },
                { k: "Email",        v: displayUser.email     },
                { k: "Member Since", v: displayUser.hireDate  },
                { k: "Status",       v: displayUser.active ? "Active" : "Inactive" },
              ].map((r) => (
                <div key={r.k} className="info-row">
                  <div className="info-key">{r.k}</div>
                  <div className="info-val">{r.v}</div>
                </div>
              ))}
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section">
              <div className="sidebar-label">This Month</div>
              {[
                { label: "Vehicles Added", val: "—" },
                { label: "Sales Closed",   val: "—" },
                { label: "Appraisals",     val: "—" },
              ].map((s) => (
                <div key={s.label} className="stat-pill">
                  <span className="stat-pill-label">{s.label}</span>
                  <span className="stat-pill-val">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="profile-main">
            <div className="tab-bar">
              {(["edit", "activity", "security"] as TabKey[]).map((t) => (
                <button
                  key={t}
                  className={`tab${tab === t ? " active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t === "edit" ? "Edit Profile" : t === "activity" ? "Activity Log" : "Security"}
                </button>
              ))}
            </div>

            {/* ── Edit tab ── */}
            {tab === "edit" && (
              <form className="edit-form" onSubmit={handleSave}>
                {saved      && <div className="success-banner">Profile saved.</div>}
                {saveError  && <div className="error-msg">{saveError}</div>}

                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">First Name</label>
                    <input className="field-input" value={editForm.firstName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, firstName: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Last Name</label>
                    <input className="field-input" value={editForm.lastName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, lastName: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Username</label>
                    <input className="field-input" value={editForm.username}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, username: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Role</label>
                    <input className="field-input" value={displayUser.role} disabled />
                  </div>
                  <div className="field-group full">
                    <label className="field-label">Email Address</label>
                    <input className="field-input" type="email" value={editForm.email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Employee ID</label>
                    <input className="field-input" value={user.employeeId} disabled />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Start Date</label>
                    <input className="field-input" value={displayUser.hireDate} disabled />
                  </div>
                </div>

                <div>
                  <button className="btn-save" type="submit">Save Changes</button>
                  <button className="btn-cancel" type="button">Discard</button>
                </div>
              </form>
            )}

            {/* ── Activity log tab ── */}
            {tab === "activity" && (
              <div className="log-list">
                {MOCK_LOG.map((l, i) => (
                  <div key={i} className="log-item">
                    <div className="log-time">{l.time}</div>
                    <div>
                      <div className="log-action">{l.action}</div>
                      <div className="log-detail">{l.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Security tab ── */}
            {tab === "security" && (
              <div>
                <div className="security-block">
                  <div className="security-title">Change Password</div>
                  {(["current", "next", "confirm"] as (keyof PwForm)[]).map((k) => (
                    <div key={k} className="field-group" style={{ marginBottom: "18px" }}>
                      <label className="field-label">
                        {k === "current" ? "Current Password"
                          : k === "next"  ? "New Password"
                          : "Confirm New Password"}
                      </label>
                      <input
                        className="field-input"
                        type="password"
                        placeholder="••••••••"
                        value={pwForm[k]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setPwForm({ ...pwForm, [k]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                  <button className="btn-save" style={{ marginTop: "8px" }}>
                    Update Password
                  </button>
                </div>

                <div className="danger-zone">
                  <div className="danger-title">Danger Zone</div>
                  <div className="danger-text">
                    Deactivating your account will remove access immediately.
                    Contact a manager to restore it.
                  </div>
                  <button className="btn-danger">Deactivate Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}