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

// Only two tabs — no activity log
type TabKey = "edit" | "security";

interface PwForm {
  current: string;
  next: string;
  confirm: string;
}

export default function Profile({ user }: ProfileProps) {
  const [tab, setTab]             = useState<TabKey>("edit");
  const [saved, setSaved]         = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const [profile, setProfile]     = useState<EmployeeProfile | null>(null);
  const [editForm, setEditForm]   = useState({
    firstName: "",
    lastName:  "",
    username:  "",
    email:     "",
  });
  const [pwForm, setPwForm]       = useState<PwForm>({
    current: "", next: "", confirm: "",
  });
  const [pwError, setPwError]     = useState<string>("");
  const [pwSaved, setPwSaved]     = useState<boolean>(false);

  // Load employee profile from DB
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
        // Fall back to auth session data
        setEditForm({
          firstName: user.firstName ?? "",
          lastName:  user.lastName  ?? "",
          username:  user.username,
          email:     user.email,
        });
      });
  }, [user]);

  const displayUser = profile ?? {
    firstName: user.firstName,
    lastName:  user.lastName ?? "",
    username:  user.username,
    email:     user.email,
    role:      user.role,
    hireDate:  user.startDate,
    active:    true,
    id:        user.id,
  };

  const initials =
    `${displayUser.firstName?.[0] ?? ""}${displayUser.lastName?.[0] ?? ""}`.toUpperCase();

  // Save profile edits
  const handleSave = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaveError("");
    try {
      const res = await api.put<EmployeeProfile>(
        `/api/employees/${user.id}`,
        editForm
      );
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Failed to save changes.");
    }
  };

  // Change password
  const handlePasswordChange = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setPwError("");
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError("All password fields are required.");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    try {
      await api.put(`/api/employees/${user.id}/password`, {
        currentPassword: pwForm.current,
        newPassword:     pwForm.next,
      });
      setPwSaved(true);
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    } catch {
      setPwError("Current password is incorrect.");
    }
  };

  // Deactivate account — calls DELETE on backend
  const handleDeactivate = async (): Promise<void> => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate your account? " +
        "A manager will need to restore access."
      )
    )
      return;
    try {
      await api.delete(`/api/employees/${user.id}`);
      // Redirect to login handled by parent via auth state
      window.location.reload();
    } catch {
      setSaveError("Could not deactivate account.");
    }
  };

  return (
    <div className="profile-root">
      {/* No cover banner / yellow bar */}

      <div className="profile-layout">

        {/* Sidebar — avatar, name, role, basic info only */}
        <div className="profile-sidebar">
          <div className="avatar-section">
            <div className="avatar-ring">
              <div className="avatar-inner">{initials}</div>
            </div>
            <div className="profile-name">
              {displayUser.firstName} {displayUser.lastName}
            </div>
            <div className="profile-role-tag">{displayUser.role}</div>
            <div className="profile-id">ID: {user.employeeId}</div>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <div className="sidebar-label">Info</div>
            {[
              { k: "Username",     v: displayUser.username },
              { k: "Email",        v: displayUser.email    },
              { k: "Member Since", v: displayUser.hireDate },
              {
                k: "Status",
                v: displayUser.active ? "Active" : "Inactive",
              },
            ].map((r) => (
              <div key={r.k} className="info-row">
                <div className="info-key">{r.k}</div>
                <div className="info-val">{r.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content — Edit Profile + Security only */}
        <div className="profile-main">
          <div className="tab-bar">
            {(["edit", "security"] as TabKey[]).map((t) => (
              <button
                key={t}
                className={`tab${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "edit" ? "Edit Profile" : "Security"}
              </button>
            ))}
          </div>

          {/* ── Edit Profile tab ── */}
          {tab === "edit" && (
            <form className="edit-form" onSubmit={handleSave}>
              {saved     && <div className="success-banner">Profile saved.</div>}
              {saveError && <div className="error-msg">{saveError}</div>}

              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">First Name</label>
                  <input
                    className="field-input"
                    value={editForm.firstName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Last Name</label>
                  <input
                    className="field-input"
                    value={editForm.lastName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Username</label>
                  <input
                    className="field-input"
                    value={editForm.username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Role</label>
                  <input
                    className="field-input"
                    value={displayUser.role}
                    disabled
                  />
                </div>
                <div className="field-group full">
                  <label className="field-label">Email Address</label>
                  <input
                    className="field-input"
                    type="email"
                    value={editForm.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Employee ID</label>
                  <input
                    className="field-input"
                    value={user.employeeId}
                    disabled
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Start Date</label>
                  <input
                    className="field-input"
                    value={displayUser.hireDate}
                    disabled
                  />
                </div>
              </div>

              <div>
                <button className="btn-save" type="submit">
                  Save Changes
                </button>
                <button
                  className="btn-cancel"
                  type="button"
                  onClick={() =>
                    setEditForm({
                      firstName: displayUser.firstName,
                      lastName:  displayUser.lastName,
                      username:  displayUser.username,
                      email:     displayUser.email,
                    })
                  }
                >
                  Discard
                </button>
              </div>
            </form>
          )}

          {/* ── Security tab ── */}
          {tab === "security" && (
            <div>
              <form className="security-block" onSubmit={handlePasswordChange}>
                <div className="security-title">Change Password</div>

                {pwSaved  && <div className="success-banner">Password updated.</div>}
                {pwError  && <div className="error-msg">{pwError}</div>}

                {(["current", "next", "confirm"] as (keyof PwForm)[]).map((k) => (
                  <div key={k} className="field-group" style={{ marginBottom: "18px" }}>
                    <label className="field-label">
                      {k === "current"
                        ? "Current Password"
                        : k === "next"
                        ? "New Password"
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

                <button className="btn-save" type="submit">
                  Update Password
                </button>
              </form>

              {/* Deactivate — calls DELETE /api/employees/:id */}
              <div className="danger-zone">
                <div className="danger-title">Danger Zone</div>
                <div className="danger-text">
                  Deactivating your account will remove access immediately.
                  Contact a manager to restore it.
                </div>
                <button className="btn-danger" onClick={handleDeactivate}>
                  Deactivate Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}