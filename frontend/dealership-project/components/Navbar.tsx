"use client";
import { useState } from "react";
import { AuthEmployee, PageKey } from "../app/types";

interface NavbarProps {
  user: AuthEmployee;
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
}

export default function Navbar({ user, onNavigate, onLogout }: NavbarProps) {
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
        <div className="nav-logo" onClick={() => go("welcome")}>
          <span className="nav-logo-text">Mario&apos;s Auto Sales</span>
        </div>

        <div className="nav-right">
          <div className="nav-user" onClick={() => go("profile")}>
            <div className="nav-avatar">{initials}</div>
            <div className="nav-user-info">
            </div>
          </div>

          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>
    </>
  );
}