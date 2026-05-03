"use client";
import { useState } from "react";
import { AuthUser, PageKey } from "../app/types";

const NAV_ITEMS: { key: PageKey; label: string }[] = [
  { key: "welcome",   label: "Dashboard"  },
  { key: "lot",       label: "On the Lot" },
  { key: "inventory", label: "Inventory"  },
  { key: "profile",   label: "My Profile" },
];

interface NavbarProps {
  user: AuthUser;
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
}

export default function Navbar({ user, activePage, onNavigate, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  const go = (key: PageKey): void => {
    onNavigate(key);
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        {/* Text-only logo — matches the Login page treatment */}
        <div className="nav-logo" onClick={() => go("welcome")}>
          <span className="nav-logo-text">Mario&apos;s Auto Sales</span>
        </div>

        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-link${activePage === item.key ? " active" : ""}`}
              onClick={() => go(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-user" onClick={() => go("profile")}>
            <div className="nav-avatar">{initials}</div>
            <div className="nav-user-info">
            </div>
          </div>

          <button className="nav-logout" onClick={onLogout}>Logout</button>

          <button
            className="hamburger"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`mobile-link${activePage === item.key ? " active" : ""}`}
              onClick={() => go(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}