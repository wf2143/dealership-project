import { useState, ChangeEvent } from "react";
import { VehicleStatus } from "../types";

interface LotVehicle {
  id: number;
  year: string;
  make: string;
  model: string;
  color: string;
  mileage: string;
  price: string;
  status: VehicleStatus;
  lot: string;
  days: number;
  image: string; // path to PNG, e.g. "/cars/bmw-m3.png"
}

const MOCK_VEHICLES: LotVehicle[] = [
  { id: 1, year: "2024", make: "BMW",           model: "M3 Competition", color: "Brooklyn Grey",   mileage: "1,200",  price: "$82,900",  status: "available", lot: "Lot A · Row 2",     days: 8,  image: "/cars/placeholder.png" },
  { id: 2, year: "2023", make: "Mercedes-Benz", model: "GLE 53 AMG",     color: "Obsidian Black",  mileage: "8,450",  price: "$79,500",  status: "hold",      lot: "Showroom",           days: 23, image: "/cars/placeholder.png" },
  { id: 3, year: "2022", make: "Porsche",        model: "Cayenne GTS",    color: "Carmine Red",     mileage: "14,200", price: "$91,200",  status: "available", lot: "Lot B · Row 1",     days: 41, image: "/cars/placeholder.png" },
  { id: 4, year: "2024", make: "Audi",           model: "RS6 Avant",      color: "Nardo Grey",      mileage: "3,100",  price: "$115,000", status: "available", lot: "Showroom",           days: 5,  image: "/cars/placeholder.png" },
  { id: 5, year: "2023", make: "Chevrolet",      model: "Corvette Z06",   color: "Rapid Blue",      mileage: "6,700",  price: "$104,500", status: "sold",      lot: "Lot A · Row 7",     days: 62, image: "/cars/placeholder.png" },
  { id: 6, year: "2021", make: "Ford",           model: "F-150 Raptor",   color: "Iconic Silver",   mileage: "28,900", price: "$58,700",  status: "available", lot: "Truck Lot · Row 3", days: 17, image: "/cars/placeholder.png" },
  { id: 7, year: "2022", make: "Lexus",          model: "LC 500h",        color: "Atomic Silver",   mileage: "19,000", price: "$72,000",  status: "available", lot: "Lot A · Row 4",     days: 33, image: "/cars/placeholder.png" },
  { id: 8, year: "2023", make: "Range Rover",    model: "Sport SVR",      color: "Carpathian Grey", mileage: "11,300", price: "$138,000", status: "hold",      lot: "Showroom",           days: 12, image: "/cars/placeholder.png" },
];

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
  const [search, setSearch]           = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = MOCK_VEHICLES.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || `${v.year} ${v.make} ${v.model} ${v.color} ${v.lot}`.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const canAddVehicle = ["General Manager", "Lot Manager"].includes(userRole);

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

          <select className="filter-select" defaultValue="">
            <option value="">All Makes</option>
            {[...new Set(MOCK_VEHICLES.map((v) => v.make))].map((m) => (
              <option key={m}>{m}</option>
            ))}
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

                {/* ── Image area ── */}
                <div className="card-image">
                  {/*
                    Replace "/cars/placeholder.png" with the actual PNG path per vehicle.
                    The onError fallback renders the placeholder box if the file is missing.
                  */}
                  <img
                    className="card-img"
                    src={v.image}
                    alt={`${v.year} ${v.make} ${v.model}`}
                    onError={(e) => {
                      // Hide broken img and show placeholder div
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      const placeholder = e.currentTarget.nextSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = "flex";
                    }}
                  />
                  {/* Shown when PNG is missing */}
                  <div className="card-img-placeholder" style={{ display: "none" }}>
                    <div className="placeholder-icon">🚗</div>
                    <div className="placeholder-label">Image coming soon</div>
                  </div>

                  <div className={`card-badge ${BADGE_CLASS[v.status]}`}>
                    {STATUS_LABELS[v.status]}
                  </div>
                  <div className="lot-tag">{v.lot}</div>
                </div>

                {/* Card body */}
                <div className="card-body">
                  <div className="card-year">{v.year}</div>
                  <div className="card-name">{v.make} {v.model}</div>
                  <div className="card-specs">
                    <span className="card-spec">Color: {v.color}</span>
                    <span className="card-spec">{v.mileage} mi</span>
                  </div>
                  <div className="card-footer">
                    <div className="card-price">{v.price}</div>
                    <div className="card-days">{v.days}d on lot</div>
                  </div>
                </div>

                {/* Hover actions */}
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