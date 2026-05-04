"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { AuthEmployee } from "../app/types";
import api from "../api/axiosinstance";

interface ProfileProps {
  user: AuthEmployee;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  startDate: string;
}

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
  const [profile, setProfile]     = useState<UserProfile | null>(null);
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

  useEffect(() => {
    api.get<UserProfile>(`/api/users/${user.id}`)
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
    startDate: user.startDate,
    id:        user.id,
  };

  const initials =
    `${displayUser.firstName?.[0] ?? ""}${displayUser.lastName?.[0] ?? ""}`.toUpperCase();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaveError("");
    try {
      const res = await api.put<UserProfile>(
        `/api/users/${user.id}`,
        editForm
      );
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Failed to save changes.");
    }
  };

  const handlePasswordChange = async (
    e: React.FormEvent<HTMLFormElement>
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
      await api.put(`/api/users/${user.id}/password`, {
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



  return (
    <div className="profile-root">
      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="avatar-section">
            <div className="avatar-ring">
              <div className="avatar-inner">{initials}</div>
            </div>
            <div className="profile-name">
              {displayUser.firstName} {displayUser.lastName}
            </div>
            <div className="profile-role-tag">{displayUser.role}</div>
          </div>
        </div>

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
                  <label className="field-label">Start Date</label>
                  <input
                    className="field-input"
                    value={displayUser.startDate}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
