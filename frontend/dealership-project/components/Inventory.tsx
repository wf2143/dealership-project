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
const STATUS_CLASS: Record<VehicleStatus, string> = {
  available: "st-available",
  hold:      "st-hold",
  sold:      "st-sold",
  incoming:  "st-incoming",
};

const fmt = (n: number): string => `$${n.toLocaleString()}`;

const BLANK: Omit<Vehicle, "id" | "addDate"> = {
  vin: "", year: new Date().getFullYear(), make: "", model: "", trim: "",
  color: "", mileage: 0, price: 0, bodyType: "", fuelType: "", status: "available", lot: "",
};

type SortKey = keyof Pick<
  Vehicle,
  "year" | "make" | "model" | "mileage" | "price" | "addDate" | "status"
>;

interface ThProps {
  col: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: 1 | -1;
  onSort: (key: SortKey) => void;
}

const Th = ({ col, label, sortKey, sortDir, onSort }: ThProps) => (
  <th
    onClick={() => onSort(col)}
    style={{ color: sortKey === col ? "#222" : undefined, fontWeight: sortKey === col ? 800 : undefined }}
  >
    {label}{sortKey === col ? (sortDir === 1 ? " ↑" : " ↓") : ""}
  </th>
);

interface InventoryProps {
  userRole: string;
}

export default function Inventory({ userRole }: InventoryProps) {
  const [inventory, setInventory] = useState<Vehicle[]>([]);
  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]         = useState<string>("");
  const [search, setSearch]       = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [makeFilter, setMakeFilter]     = useState<string>("all");
  const [modal, setModal]         = useState<Vehicle | "add" | null>(null);
  const [form, setForm]           = useState<Omit<Vehicle, "id" | "addDate">>(BLANK);
  const [sortKey, setSortKey]     = useState<SortKey>("year");
  const [sortDir, setSortDir]     = useState<1 | -1>(-1);

  const isManager = [
    "General Manager", "Lot Manager", "Finance Manager",
  ].includes(userRole);

  useEffect(() => {
    api.get<Vehicle[]>("/api/vehicles")
      .then((res) => setInventory(res.data))
      .catch(() => setError("Failed to load inventory."))
      .finally(() => setLoading(false));
  }, []);

  const MAKES = [...new Set(inventory.map((v) => v.make))].sort();

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  };

  const filtered = inventory
    .filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        `${v.year} ${v.make} ${v.model} ${v.color} ${v.vin} ${v.lot}`
          .toLowerCase()
          .includes(q);
      const matchStatus = statusFilter === "all" || v.status === statusFilter;
      const matchMake   = makeFilter   === "all" || v.make === makeFilter;
      return matchSearch && matchStatus && matchMake;
    })
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number")
        return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });

  const openAdd  = (): void => { setForm(BLANK); setModal("add"); };
  const openEdit = (v: Vehicle): void => {
    const { id: _id, addDate: _date, ...rest } = v;
    setForm(rest);
    setModal(v);
  };
  const closeModal = (): void => setModal(null);

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (): Promise<void> => {
    const payload = {
      ...form,
      year:    Number(form.year),
      mileage: Number(form.mileage),
      price:   Number(form.price),
    };

    if (modal === "add") {
      try {
        const res = await api.post<Vehicle>("/api/vehicles", payload);
        setInventory([res.data, ...inventory]);
      } catch {
        setError("Failed to add vehicle.");
      }
    } else if (modal && typeof modal === "object") {
      try {
        const res = await api.put<Vehicle>(
          `/api/vehicles/${modal.id}`,
          payload
        );
        setInventory(inventory.map((v) => v.id === modal.id ? res.data : v));
      } catch {
        setError("Failed to update vehicle.");
      }
    }
    closeModal();
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm("Remove this vehicle from inventory?")) return;
    try {
      await api.delete(`/api/vehicles/${id}`);
      setInventory(inventory.filter((v) => v.id !== id));
    } catch {
      setError("Failed to delete vehicle.");
    }
  };

  const currentVehicle = modal && typeof modal === "object" ? modal : null;

  if (loading) {
    return <div className="inv-root" style={{ padding: "40px" }}>Loading inventory…</div>;
  }

  return (
    <>
      <div className="inv-root">
        <div className="inv-topbar">
          <div className="page-title">Full Inventory</div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {error && <span style={{ color: "#e74c3c", fontSize: "13px" }}>{error}</span>}
            {isManager && (
              <button className="btn-primary" onClick={openAdd}>+ Add Vehicle</button>
            )}
          </div>
        </div>

        <div className="inv-content">
          <div className="filter-sidebar">
            <div className="filter-heading">Status</div>
            {(
              [
                ["all",       "All",       inventory.length],
                ["available", "Available", inventory.filter((v) => v.status === "available").length],
                ["hold",      "On Hold",   inventory.filter((v) => v.status === "hold").length],
                ["sold",      "Sold",      inventory.filter((v) => v.status === "sold").length],
                ["incoming",  "Incoming",  inventory.filter((v) => v.status === "incoming").length],
              ] as [string, string, number][]
            ).map(([val, lbl, cnt]) => (
              <div
                key={val}
                className={`filter-chip${statusFilter === val ? " active" : ""}`}
                onClick={() => setStatusFilter(val)}
              >
                {lbl} <span className="chip-count">{cnt}</span>
              </div>
            ))}

            <div className="filter-heading">Make</div>
            {[["all", "All Makes"], ...MAKES.map((m) => [m, m])].map(([val, lbl]) => (
              <div
                key={val}
                className={`filter-chip${makeFilter === val ? " active" : ""}`}
                onClick={() => setMakeFilter(val)}
              >
                {lbl}
              </div>
            ))}

            <button className="clear-btn" onClick={() => { setStatusFilter("all"); setMakeFilter("all"); setSearch(""); }}>
              Clear Filters
            </button>
          </div>

          <div className="table-area">
            <div className="table-toolbar">
              <div className="search-box">
                <input
                  className="search-input"
                  placeholder="Search make, model, VIN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="results-count">{filtered.length} results</div>
            </div>

            <table className="inv-table">
              <thead>
                <tr>
                  <Th col="year"      label="Year"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <Th col="make"      label="Make / Model" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th>VIN</th>
                  <Th col="mileage"   label="Mileage"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <Th col="price"     label="Price"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <Th col="status"    label="Status"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th>Lot</th>
                  <Th col="addDate"   label="Date Added"   sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} onClick={() => openEdit(v)}>
                    <td className="td-main">{v.year}</td>
                    <td>
                      <div className="td-main">{v.make} {v.model}</div>
                      <div style={{ fontSize: "11px", color: "#aaa" }}>{v.trim}</div>
                    </td>
                    <td className="td-vin">{v.vin}</td>
                    <td>{v.mileage.toLocaleString()} mi</td>
                    <td className="td-price">{fmt(v.price)}</td>
                    <td>
                      <span className={`status-tag ${STATUS_CLASS[v.status]}`}>
                        {STATUS_LABELS[v.status]}
                      </span>
                    </td>
                    <td>{v.lot}</td>
                    <td>{v.addDate ?? "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openEdit(v)} title="Edit">E</button>
                        {isManager && (
                          <button className="icon-btn danger" onClick={() => handleDelete(v.id)} title="Delete">D</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {modal === "add" ? "Add Vehicle" : `Edit — ${currentVehicle?.year} ${currentVehicle?.make} ${currentVehicle?.model}`}
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                <div className="m-field full">
                  <label className="m-label">VIN</label>
                  <input className="m-input" name="vin" value={form.vin} onChange={handleFormChange} placeholder="17-character VIN" />
                </div>
                {(
                  [
                    ["year",     "Year",         "number"],
                    ["make",     "Make",         "text"  ],
                    ["model",    "Model",        "text"  ],
                    ["trim",     "Trim",         "text"  ],
                    ["color",    "Color",        "text"  ],
                    ["mileage",  "Mileage",      "number"],
                    ["price",    "Price (USD)",  "number"],
                    ["bodyType", "Body Type",    "text"  ],
                    ["fuelType", "Fuel Type",    "text"  ],
                    ["lot",      "Lot Location", "text"  ],
                  ] as [string, string, string][]
                ).map(([name, label, type]) => (
                  <div key={name} className="m-field">
                    <label className="m-label">{label}</label>
                    <input
                      className="m-input"
                      name={name}
                      type={type}
                      value={(form as Record<string, unknown>)[name] as string ?? ""}
                      onChange={handleFormChange}
                    />
                  </div>
                ))}
                <div className="m-field">
                  <label className="m-label">Status</label>
                  <select className="m-select" name="status" value={form.status} onChange={handleFormChange}>
                    {(["available", "hold", "sold", "incoming"] as VehicleStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>
                {modal === "add" ? "Add to Inventory" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
