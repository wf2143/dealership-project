"use client";

import { PageKey } from "../app/types";
import { useState, useEffect } from "react";
import api from "../api/axiosinstance";

const now = new Date();
const DAY = now.toLocaleDateString("en-US", { weekday: "long" });

// Activity feed pulls from the DB in the future.
// For now these represent real dealership actions shown to staff.
interface ActivityEntry {
  id: number;
  icon: string;
  description: string;
  detail: string;
  createdAt: string;
}

interface WelcomeProps {
  user?: {
    firstName: string;
    role: string;
  };
  onNavigate?: (route: PageKey) => void;
}

export default function Welcome({
  user = { firstName: "", role: "" },
  onNavigate,
}: WelcomeProps) {
  const [greeting, setGreeting]       = useState<string>("");
  const [activity, setActivity]       = useState<ActivityEntry[]>([]);
  const [activityError, setActivityError] = useState<boolean>(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  // Pull activity log from backend
  useEffect(() => {
    api.get<ActivityEntry[]>("/api/dashboard/activity?limit=8")
      .then((res) => setActivity(res.data))
      .catch(() => setActivityError(true));
  }, []);

  return (
    <div className="welcome-root">

      <div className="hero">
        <div className="hero-title">
          Welcome Back,<br />
          <span className="name-highlight">
            {user.firstName || "Employee"}.
          </span>
        </div>
      </div>

      <div className="content-area">

        <div className="main-col">
          <div className="section-header">
            <div className="section-title">Recent Activity</div>
          </div>

          {activityError && (
            <div className="activity-error">
              Could not load activity — check backend connection.
            </div>
          )}

          {!activityError && activity.length === 0 && (
            <div className="activity-empty">No recent activity on record.</div>
          )}

          <div className="activity-list">
            {activity.map((a) => (
              <div key={a.id} className="activity-item">
                <div className="activity-icon">{a.icon || ""}</div>
                <div className="activity-text">
                  <div className="activity-main">{a.description}</div>
                  <div className="activity-sub">{a.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — quick actions */}
        <div className="side-col">
          <div className="section-header">
            <div className="section-title">Quick Actions</div>
          </div>
          <div className="quick-actions">
            {[
              { icon: "", label: "Add Vehicle",  sub: "",  nav: "inventory" as PageKey },
              { icon: "", label: "Search Lot",   sub: "",    nav: "lot"       as PageKey },
              { icon: "", label: "Inventory",    sub: "",      nav: "inventory" as PageKey },
              { icon: "", label: "My Profile",   sub: "",   nav: "profile"   as PageKey },
            ].map((a) => (
              <button
                key={a.label}
                className="action-btn"
                onClick={() => onNavigate?.(a.nav)}
              >
                <div className="action-icon">{a.icon}</div>
                <span className="action-label">{a.label}</span>
                <span className="action-sub">{a.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}