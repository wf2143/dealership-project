"use client";
import { PageKey } from "../app/types";

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
  return (
    <div className="welcome-root">
      <div className="welcome-heading">
        Welcome, {user.firstName || "Employee"} ({user.role})
      </div>

      <div className="section-title">Quick Navigation</div>

      <div className="quick-actions">
        {([
          { label: "Dashboard",  nav: "welcome"   as PageKey },
          { label: "On the Lot", nav: "lot"       as PageKey },
          { label: "Inventory",  nav: "inventory" as PageKey },
          { label: "My Profile", nav: "profile"   as PageKey },
        ]).map((a) => (
          <button
            key={a.label}
            className="action-btn"
            onClick={() => onNavigate?.(a.nav)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
