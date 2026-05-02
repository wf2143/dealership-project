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

export default function CurrentLot({ userRole }: CurrentLotProps) {
  const [vehicles, setVehicles]         = useState<Vehicle[]>([]);
  const [loading, setLoading]           = useState<boolean>(true);
  const [error, setError]               = useState<string>("");
  const [search, setSearch]             = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [makeFilter, setMakeFilter]     = useState<string>("all");

  useEffect(() => {
    api.get<Vehicle[]>("/api/vehicles")
      .then((res) => setVehicles(res.data))
      .catch(() => setError("Failed to load lot."))
      .finally(() => setLoading(false));
  }, []);

  const makes = [...new Set(vehicles.map((v) => v.make))];

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || `${v.year} ${v.make} ${v.model} ${v.color} ${v.lot}`.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchMake   = makeFilter   === "all" || v.make === makeFilter;
    return matchSearch && matchStatus && matchMake;
  });

  const canAddVehicle = ["General Manager", "Lot Manager"].includes(userRole);

  if (loading) return <div className="lot-root" style={{padding:"40px",textAlign:"center"}}>Loading lot…</div>;

  return (
    <>
      <div className="lot-root">

        {/* Header */}
        <div className="lot-header">
          <div>
            <div className="page-title">Current Lot</div>
            <div className="page-subtitle">Live inventory · Apex Motors Main Location</div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {error && <span style={{color:"#e74c3c",fontSize:"13px",alignSelf:"center"}}>{error}</span>}
            <button className="btn-secondary">Export CSV</button>
            {canAddVehicle && (
              <button className="btn-primary">+ Add Vehicle</button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search make, model, lot…"
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
            {makes.map((m) => <option key={m}>{m}</option>)}
          </select>

          <select className="filter-select" defaultValue="">
            <option value="">All Lots</option>
            <option>Showroom</option>
            <option>Lot A</option>
            <option>Lot B</option>
            <option>Truck Lot</option>
          </select>

          <div className="results-count">{filtered.length} vehicles</div>
        </div>

        {/* Grid */}
        <div className="lot-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-text">No vehicles match your search</div>
            </div>
          ) : (
            filtered.map((v) => (
              <div key={v.id} className="vehicle-card">

                <div className="card-image">
                  <img
                    className="card-img"
                    src="/cars/placeholder.png"
                    alt={`${v.year} ${v.make} ${v.model}`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      const placeholder = e.currentTarget.nextSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = "flex";
                    }}
                  />
                  <div className="card-img-placeholder" style={{ display: "none" }}>
                    <div className="placeholder-icon">🚗</div>
                    <div className="placeholder-label">Image coming soon</div>
                  </div>

                  <div className={`card-badge ${BADGE_CLASS[v.status as VehicleStatus]}`}>
                    {STATUS_LABELS[v.status as VehicleStatus]}
                  </div>
                  <div className="lot-tag">{v.lot}</div>
                </div>

                <div className="card-body">
                  <div className="card-year">{v.year}</div>
                  <div className="card-name">{v.make} {v.model}</div>
                  <div className="card-specs">
                    <span className="card-spec">Color: {v.color}</span>
                    <span className="card-spec">{v.mileage.toLocaleString()} mi</span>
                  </div>
                  <div className="card-footer">
                    <div className="card-price">${v.price.toLocaleString()}</div>
                    <div className="card-days">{v.daysOnLot}d on lot</div>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="mini-btn mini-btn-outline">Details</button>
                  {canAddVehicle && (
                    <button className="mini-btn mini-btn-fill">Edit</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}