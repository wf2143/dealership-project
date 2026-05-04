"use client";
import { useEffect, useState } from "react";
import { PageKey } from "../app/types";
import api from "../api/axiosinstance";

interface SummaryRow {
  status:       string;
  vehicleCount: number;
  avgPrice:     number;
  minPrice:     number;
  maxPrice:     number;
  totalValue:   number;
}

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  hold:      "On Hold",
  incoming:  "Incoming",
  sold:      "Sold",
};

const fmt = (n: number) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

interface WelcomeProps {
  user?: { firstName: string; role: string };
  onNavigate?: (route: PageKey) => void;
}

export default function Welcome({
  user = { firstName: "", role: "" },
  onNavigate,
}: WelcomeProps) {
  const [summary, setSummary] = useState<SummaryRow[]>([]);

  useEffect(() => {
    api.get<SummaryRow[]>("/api/vehicles/summary")
      .then((res) => setSummary(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="welcome-root">
      <div className="welcome-heading">
        Welcome, {user.firstName || "Employee"} ({user.role})
      </div>

      <div className="section-title">Quick Navigation</div>
      <div className="quick-actions">
        {([
          { label: "Inventory", nav: "inventory" as PageKey },
          { label: "Customers", nav: "customers" as PageKey },
          { label: "Sales",     nav: "sales"     as PageKey },
          { label: "My Profile",nav: "profile"   as PageKey },
        ]).map((a) => (
          <button key={a.label} className="action-btn" onClick={() => onNavigate?.(a.nav)}>
            {a.label}
          </button>
        ))}
      </div>

      {summary.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <div className="section-title">Inventory Summary</div>
          <table style={{ borderCollapse: "collapse", fontSize: "13px", marginTop: "10px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc" }}>
                {["Status", "Vehicles", "Avg Price", "Min Price", "Max Price", "Lot Value"].map((h) => (
                  <th key={h} style={{ padding: "6px 18px 6px 0", textAlign: "left", fontWeight: 700, color: "#555", fontSize: "12px", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => (
                <tr key={row.status} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px 18px 8px 0", fontWeight: 600 }}>
                    {STATUS_LABELS[row.status] ?? row.status}
                  </td>
                  <td style={{ padding: "8px 18px 8px 0" }}>{row.vehicleCount}</td>
                  <td style={{ padding: "8px 18px 8px 0" }}>{fmt(row.avgPrice)}</td>
                  <td style={{ padding: "8px 18px 8px 0" }}>{fmt(row.minPrice)}</td>
                  <td style={{ padding: "8px 18px 8px 0" }}>{fmt(row.maxPrice)}</td>
                  <td style={{ padding: "8px 18px 8px 0", fontWeight: 700 }}>{fmt(row.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
