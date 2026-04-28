"use client";

import { PageKey } from "../app/types";
import { useState, useEffect } from "react";


const now = new Date();
const DAY = now.toLocaleDateString("en-US", { weekday: "long" });
const DATE = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const MOCK_ACTIVITY = [
  { icon: "🚗", main: "2023 BMW M3 added to inventory", sub: "VIN: WBS8M9C59J5L12345", time: "9:41 AM" },
  { icon: "💰", main: "Sale closed — 2022 Audi Q7", sub: "Customer: R. Thompson · $58,400", time: "8:15 AM" },
  { icon: "🔧", main: "Service completed — 2021 Ford F-150", sub: "Oil change & tire rotation", time: "Yesterday" },
  { icon: "📋", main: "Appraisal submitted — 2019 Honda CR-V", sub: "Trade-in estimate: $19,200", time: "Yesterday" },
  { icon: "📦", main: "Lot transfer — 3 vehicles moved to Lot B", sub: "Sedan section, Row 4", time: "Mon" },
];

const MOCK_ALERTS = [
  { critical: false, bold: "7 vehicles", text: " have been on lot for 60+ days" },
  { critical: true, bold: "Insurance docs missing", text: " for 3 vehicles — action required" },
  { critical: false, bold: "Inventory audit", text: " scheduled for Friday, May 3" },
];

interface WelcomeProps {
  user?: {
    firstName: string;
    role: string;
  };
  onNavigate?: (route: PageKey) => void;
}

export default function Welcome({ user = { firstName: "Alex", role: "Sales Associate" }, onNavigate }: WelcomeProps) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  return (
    <>
      <div className="welcome-root">
        {/* Hero */}
        <div className="hero">
          <div className="hero-glow" />
          <div className="hero-eyebrow">{greeting}</div>
          <div className="hero-title">
            Welcome Back,<br />
            <span className="name-highlight">{user.firstName}.</span>
          </div>
          <div className="hero-subtitle">
            Here's what's happening at Apex Motors today. You're logged in as <strong style={{color:"var(--platinum)"}}>{user.role}</strong>.
          </div>
          <div className="hero-date">
            <div className="hero-date-day">{now.getDate()}</div>
            <div className="hero-date-label">{DAY.toUpperCase()} · {now.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            { label: "Vehicles on Lot", value: "247", delta: "▲ 12 this week", up: true },
            { label: "Sales This Month", value: "38", delta: "▲ 6 vs last month", up: true, gold: true },
            { label: "Avg. Days on Lot", value: "31", delta: "▼ 4 days", up: true },
            { label: "Pending Appraisals", value: "9", delta: "▼ 2 from yesterday", up: false },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value${s.gold ? " gold" : ""}`}>{s.value}</div>
              <div className={`stat-delta${!s.up ? " down" : ""}`}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="content-area">
          <div className="main-col">
            <div className="section-header">
              <div className="section-title">Recent Activity</div>
              <span className="section-link" onClick={() => onNavigate?.("inventory")}>View All →</span>
            </div>
            <div className="activity-list">
              {MOCK_ACTIVITY.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-icon">{a.icon}</div>
                  <div className="activity-text">
                    <div className="activity-main">{a.main}</div>
                    <div className="activity-sub">{a.sub}</div>
                  </div>
                  <div className="activity-time">{a.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="side-col">
            <div className="section-header">
              <div className="section-title">Quick Actions</div>
            </div>
            <div className="quick-actions">
              {[
                { icon: "➕", label: "Add Vehicle", sub: "List new unit", nav: "inventory" },
                { icon: "🔍", label: "Search Lot", sub: "Find by VIN", nav: "lot" },
                { icon: "📊", label: "Reports", sub: "Sales data", nav: "inventory" },
                { icon: "👤", label: "My Profile", sub: "Edit account", nav: "profile" },
              ].map((a) => (
                <button key={a.label} className="action-btn" onClick={() => onNavigate?.(a.nav as PageKey)}>
                  <div className="action-icon">{a.icon}</div>
                  <span className="action-label">{a.label}</span>
                  <span className="action-sub">{a.sub}</span>
                </button>
              ))}
            </div>

            <div className="section-header">
              <div className="section-title">Alerts</div>
            </div>
            <div className="alert-list">
              {MOCK_ALERTS.map((a, i) => (
                <div key={i} className={`alert-item${a.critical ? " critical" : ""}`}>
                  <div className="alert-dot" />
                  <div className="alert-text">
                    <span className="alert-bold">{a.bold}</span>{a.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}