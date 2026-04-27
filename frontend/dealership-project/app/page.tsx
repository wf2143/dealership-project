import { useState } from "react";
import Login from "../components/Login";
import Signup from "../components/Signup";
import Navbar from '../components/Navbar';
import Welcome from '../components/Welcome';
import CurrentLot from '../components/Lot';
import Inventory from '../components/Inventory';
import Profile from '../components/myProfile';
import { AuthUser, PageKey } from '../app/types';

// ─── Hardcoded demo accounts ─────────────────────────────────
// Add your real group credentials here.
// These are checked on the Login page before any backend call.
// Replace with real Spring Boot /api/auth/login later.
export const DEMO_ACCOUNTS: AuthUser[] = [
  {
    id: 1,
    firstName: "REDACTED",
    lastName: "REDACTED",
    username: "admin",
    email: "REDACTED",
    role: "General Manager",
    employeeId: "EMP-0001",
    startDate: "REDACTED",
  },
  {
    id: 2,
    firstName: "REDACTED",
    lastName: "REDACTED",
    username: "sales1",
    email: "REDACTED",
    role: "Sales Associate",
    employeeId: "EMP-0002",
    startDate: "REDACTED",
  },
  {
    id: 3,
    firstName: "REDACTED",
    lastName: "REDACTED",
    username: "lot1",
    email: "REDACTED",
    role: "Lot Manager",
    employeeId: "EMP-0003",
    startDate: "REDACTED",
  },
];

export default function App() {
  // App always starts on the login page
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState<PageKey>("login");

  const handleLogin = (userData: AuthUser): void => {
    setUser(userData);
    setPage("welcome");
  };

  const handleLogout = (): void => {
    setUser(null);
    setPage("login");
  };

  // ── Pre-auth screens (no Navbar) ──────────────────────────
  if (!user) {
    if (page === "signup") {
      return <Signup onNavigateLogin={() => setPage("login")} />;
    }
    return (
      <Login
        onLogin={handleLogin}
        onNavigateSignup={() => setPage("signup")}
      />
    );
  }

  // ── Authenticated screens ─────────────────────────────────
  const renderPage = (): JSX.Element => {
    switch (page) {
      case "welcome":
        return <Welcome user={user} onNavigate={setPage} />;
      case "lot":
        return <CurrentLot userRole={user.role} />;
      case "inventory":
        return <Inventory userRole={user.role} />;
      case "profile":
        return <Profile />;
      default:
        return <Welcome user={user} onNavigate={setPage} />;
    }
  };

  return (
    <div>
      <Navbar
        user={user}
        activePage={page}
        onNavigate={setPage}
        onLogout={handleLogout}
      />
      {renderPage()}
    </div>
  );
}