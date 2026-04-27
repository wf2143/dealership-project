import { useState, ChangeEvent, FormEvent } from "react";

const REDACTED = "REDACTED";

const REDACTED_USER = {
  firstName:  REDACTED,
  lastName:   REDACTED,
  username:   REDACTED,
  email:      REDACTED,
  role:       REDACTED,
  employeeId: REDACTED,
  startDate:  REDACTED,
};

const MOCK_LOG = [
  { time: "Today 9:41",  action: "Added vehicle to inventory",  detail: "2023 BMW M3 · VIN WBS8M9C59J" },
  { time: "Today 8:15",  action: "Closed sale",                 detail: "2022 Audi Q7 · $58,400 · Customer: REDACTED" },
  { time: "Yesterday",   action: "Updated vehicle details",     detail: "2021 Ford F-150 · Mileage corrected" },
  { time: "Mon 2:30p",   action: "Submitted appraisal",        detail: "2019 Honda CR-V · Trade-in $19,200" },
  { time: "Mon 11:00a",  action: "Logged in",                   detail: "Session started" },
  { time: "Fri 4:45p",   action: "Changed vehicle status",      detail: "2020 Chevy Malibu → On Hold" },
];

type TabKey = "edit" | "activity" | "security";

interface PwForm {
  current: string;
  next: string;
  confirm: string;
}

export default function Profile() {
  const [tab, setTab]       = useState<TabKey>("edit");
  const [saved, setSaved]   = useState<boolean>(false);
  const [pwForm, setPwForm] = useState<PwForm>({ current: "", next: "", confirm: "" });

  // All profile fields are REDACTED until DB connection is live
  const user = REDACTED_USER;

  const handleSave = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // TODO: call employeeApi.updateProfile() when backend is ready
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
                <div className="avatar-inner">??</div>
              </div>
              <div className="profile-name">{user.firstName} {user.lastName}</div>
              <div className="profile-role-tag">{user.role}</div>
              <div className="profile-id">ID: {user.employeeId}</div>
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section">
              <div className="sidebar-label">Info</div>
              {[
                { k: "Username",     v: user.username  },
                { k: "Email",        v: user.email     },
                { k: "Member Since", v: user.startDate },
                { k: "Status",       v: "Active"       },
              ].map((r) => (
                <div key={r.k} className="info-row">
                  <div className="info-key">{r.k}</div>
                  <div className="info-val">
                    {r.v === REDACTED
                      ? <span className="redacted-tag">REDACTED</span>
                      : r.v}
                  </div>
                </div>
              ))}
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section">
              <div className="sidebar-label">This Month</div>
              {/* Replace with real employeeApi.getMonthlyStats() */}
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
                <div className="redacted-notice">
                  <strong>Note:</strong> User fields are REDACTED until the MySQL database
                  connection is live. Connect your Spring Boot{" "}
                  <code>/api/employees/&#123;id&#125;</code> endpoint and replace
                  the placeholder values.
                </div>

                {saved && <div className="success-banner">Profile saved (demo only — no DB yet).</div>}

                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">First Name</label>
                    <input className="field-input" defaultValue={REDACTED} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Last Name</label>
                    <input className="field-input" defaultValue={REDACTED} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Username</label>
                    <input className="field-input" defaultValue={REDACTED} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Role</label>
                    <input className="field-input" defaultValue={REDACTED} disabled />
                  </div>
                  <div className="field-group full">
                    <label className="field-label">Email Address</label>
                    <input className="field-input" type="email" defaultValue={REDACTED} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Employee ID</label>
                    <input className="field-input" defaultValue={REDACTED} disabled />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Start Date</label>
                    <input className="field-input" defaultValue={REDACTED} disabled />
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