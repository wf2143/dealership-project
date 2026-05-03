"use client";

import { useState, ReactElement } from "react";
import Login from '../components/Login';
import Navbar from '../components/Navbar';
import Welcome from '../components/Welcome';
import CurrentLot from '../components/Lot';
import Inventory from '../components/Inventory';
import Profile from '../components/myProfile';
import { AuthEmployee, PageKey } from "./types";

export default function App(): ReactElement {
  const [user, setUser] = useState<AuthEmployee | null>(null);
  const [page, setPage] = useState<PageKey>("login");

  const handleLogin = (userData: AuthEmployee): void => {
    setUser(userData);
    setPage("welcome");
  };

  const handleLogout = (): void => {
    setUser(null);
    setPage("login");
  };

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        onNavigateSignup={() => setPage("signup")}
      />
    );
  }

  const navigate = (p: PageKey): void => setPage(p);

  const renderPage = (): ReactElement => {
    switch (page) {
      case "welcome":
        return <Welcome user={user} onNavigate={navigate} />;
      case "lot":
        return <CurrentLot userRole={user.role} />;
      case "inventory":
        return <Inventory userRole={user.role} />;
      case "profile":
        return <Profile user={user} />;
      default:
        return <Welcome user={user} onNavigate={navigate} />;
    }
  };

  return (
    <div>
      <Navbar
        user={user}
        activePage={page}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
      {renderPage()}
    </div>
  );
}