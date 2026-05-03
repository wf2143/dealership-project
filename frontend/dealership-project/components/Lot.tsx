"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Vehicle, VehicleStatus } from "../app/types";
import api from "../api/axiosinstance";

const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Available",
  hold:      "On Hold",
  sold:      "Sold",
  incoming:  "Incoming",
};
const BADGE_CLASS: Record<VehicleStatus, string> = {
  available: "badge-available",
  hold:      "badge-hold",
  sold:      "badge-sold",
  incoming:  "badge-incoming",
};

interface CurrentLotProps {
  userRole: string;
}

export default function CurrentLot({ userRole: _ }: CurrentLotProps) {
  const [vehicles, setVehicles]         = useState<Vehicle[]>([]);
  const [loading, setLoading]           = useState<boolean>(true);
  const [error, setError]               = useState<string>("");
  const [search, setSearch]             = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [makeFilter, setMakeFilter]     = useState<string>("all");

  useEffect(() => {
    api.get<Vehicle[]>("/api/vehicles")
      .then((res) => setVehicles(res.data))
      .catch(() => setError("Failed to load lot — check backend connection."))
      .finally(() => setLoading(false));
  }, []);

  const makes = [...new Set(vehicles.map((v) => v.make))].sort();

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${v.year} ${v.make} ${v.model} ${v.color} ${v.lot}`
        .toLowerCase()
        .includes(q);
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchMake   = makeFilter   === "all" || v.make === makeFilter;
    return matchSearch && matchStatus && matchMake;
  });

  if (loading) {
    return <div className="lot-root" style={{ padding: "40px" }}>Loading lot…</div>;
  }

  return (
    <div className="lot-root">
      <div className="lot-header">
        <div className="page-title">Current Lot</div>
        {error && <span style={{ color: "#e74c3c", fontSize: "13px" }}>{error}</span>}
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <input
            className="search-input"
            placeholder="Search make, model, color..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="hold">On Hold</option>
          <option value="sold">Sold</option>
          <option value="incoming">Incoming</option>
        </select>

        <select
          className="filter-select"
          value={makeFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setMakeFilter(e.target.value)}
        >
          <option value="all">All Makes</option>
          {makes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <div className="results-count">{filtered.length} vehicles</div>
      </div>

      <div className="lot-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">No vehicles match your search</div>
          </div>
        ) : (
          filtered.map((v) => (
            <div key={v.id} className="vehicle-card">
              <div className="card-body">
                <span className={`card-badge ${BADGE_CLASS[v.status as VehicleStatus]}`}>
                  {STATUS_LABELS[v.status as VehicleStatus]}
                </span>
                <span className="lot-tag" style={{ marginLeft: "8px" }}>Lot {v.lot}</span>
                <div className="card-year">{v.year}</div>
                <div className="card-name">{v.make} {v.model}</div>
                <div className="card-specs">
                  <span className="card-spec">{v.trim}</span>
                  <span className="card-spec">{v.color}</span>
                  <span className="card-spec">{v.mileage.toLocaleString()} mi</span>
                </div>
                <div className="card-footer">
                  <div className="card-price">${v.price.toLocaleString()}</div>
                  <div className="card-days">{v.daysOnLot}d on lot</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
