"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Vehicle, VehicleStatus } from "../app/types";
import api from "../api/axiosinstance";

const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Available",
  hold: "On Hold",
  sold: "Sold",
  incoming: "Incoming",
};
const STATUS_CLASS: Record<VehicleStatus, string> = {
  available: "st-available",
  hold: "st-hold",
  sold: "st-sold",
  incoming: "st-incoming",
};

const fmt = (n: number): string => `$${n.toLocaleString()}`;

// No longer needs to extend Vehicle manually if Vehicle already has image
interface TableVehicle extends Vehicle {}

const BLANK: Omit<TableVehicle, "id" | "daysOnLot"> = {
  vin: "", year: new Date().getFullYear(), make: "", model: "", trim: "",
  color: "", mileage: 0, price: 0, status: "available", location: "",
  image: "", // Initialize empty
};

type SortKey = keyof Pick<
  TableVehicle,
  "year" | "make" | "model" | "mileage" | "price" | "daysOnLot" | "status"
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
    style={{
      color: sortKey === col ? "var(--gold)" : undefined,
      opacity: sortKey === col ? 1 : undefined,
    }}
  >
    {label}
    {sortKey === col ? (sortDir === 1 ? " ↑" : " ↓") : ""}
  </th>
);

interface InventoryProps {
  userRole: string;
}

export default function Inventory({ userRole }: InventoryProps) {
  const [inventory, setInventory] = useState<TableVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [makeFilter, setMakeFilter] = useState<string>("all");
  const [modal, setModal] = useState<TableVehicle | "add" | null>(null);
  const [form, setForm] = useState<Omit<TableVehicle, "id" | "daysOnLot">>(BLANK);
  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const [preview, setPreview] = useState<string | null>(null);

  const isManager = ["General Manager", "Lot Manager", "Finance Manager"].includes(userRole);

  useEffect(() => {
    api.get<Vehicle[]>("/api/vehicles")
      .then((res) => {
        setInventory(res.data); // Use the data exactly as it comes from DB
      })
      .catch(() => setError("Failed to load inventory."))
      .finally(() => setLoading(false));
  }, []);

  const MAKES = [...new Set(inventory.map((v) => v.make))].sort();

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        setForm({ ...form, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = inventory
    .filter((v) => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${v.year} ${v.make} ${v.model} ${v.color} ${v.vin} ${v.location}`.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || v.status === statusFilter;
      const matchMake = makeFilter === "all" || v.make === makeFilter;
      return matchSearch && matchStatus && matchMake;
    })
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });

  const openAdd = (): void => { setForm(BLANK); setPreview(null); setModal("add"); };
  const openEdit = (v: TableVehicle): void => { setForm({ ...v }); setPreview(null); setModal(v); };
  const closeModal = (): void => { setModal(null); setPreview(null); };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (): Promise<void> => {
    const payload = {
      ...form,
      year: Number(form.year),
      mileage: Number(form.mileage),
      price: Number(form.price),
    };

    try {
      if (modal === "add") {
        const res = await api.post<Vehicle>("/api/vehicles", { ...payload, daysOnLot: 0 });
        setInventory([res.data, ...inventory]);
      } else if (modal && typeof modal === "object") {
        const res = await api.put<Vehicle>(`/api/vehicles/${modal.id}`, { ...payload, daysOnLot: modal.daysOnLot });
        setInventory(inventory.map((v) => v.id === modal.id ? res.data : v));
      }
      closeModal();
    } catch {
      setError("Failed to save vehicle.");
    }
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

  if (loading) return <div className="inv-root" style={{ padding: "60px", textAlign: "center" }}>Loading inventory…</div>;

  return (
    <>
      <div className="inv-root">
        <div className="inv-topbar">
          <div>
            <div className="page-eyebrow">Mario&apos;s Auto Sales</div>
            <div className="page-title">Full Inventory</div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {error && <span style={{ color: "#e74c3c", fontSize: "13px" }}>{error}</span>}
            {isManager && <button className="btn-primary" onClick={openAdd}>+ Add Vehicle</button>}
          </div>
        </div>

        <div className="inv-content">
          <div className="filter-sidebar">
            <div className="filter-heading">Status</div>
            {(
              [["all", "All", inventory.length],
              ["available", "Available", inventory.filter((v) => v.status === "available").length],
              ["hold", "On Hold", inventory.filter((v) => v.status === "hold").length],
              ["sold", "Sold", inventory.filter((v) => v.status === "sold").length],
              ["incoming", "Incoming", inventory.filter((v) => v.status === "incoming").length]] as [string, string, number][]
            ).map(([val, lbl, cnt]) => (
              <div key={val} className={`filter-chip${statusFilter === val ? " active" : ""}`} onClick={() => setStatusFilter(val)}>
                {lbl} <span className="chip-count">{cnt}</span>
              </div>
            ))}
            {/* Make Filter logic remains same... */}
          </div>

          <div className="table-area">
            <div className="table-toolbar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input className="search-input" placeholder="Search VIN..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="results-count">{filtered.length} results</div>
            </div>

            <table className="inv-table">
              <thead>
                <tr>
                  <th style={{ width: 68 }}>Photo</th>
                  <Th col="year" label="Year" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <Th col="make" label="Make / Model" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th>VIN</th>
                  <Th col="mileage" label="Mileage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <Th col="price" label="Price" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <Th col="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th>Location</th>
                  <Th col="daysOnLot" label="Days" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} onClick={() => openEdit(v)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      {v.image ? (
                        <img className="td-thumb" src={v.image} alt="vehicle" />
                      ) : (
                        <div className="td-thumb-placeholder">🚗</div>
                      )}
                    </td>
                    <td className="td-main">{v.year}</td>
                    <td>{v.make} {v.model}</td>
                    <td className="td-vin">{v.vin}</td>
                    <td>{v.mileage.toLocaleString()} mi</td>
                    <td className="td-price">{fmt(v.price)}</td>
                    <td><span className={`status-tag ${STATUS_CLASS[v.status]}`}>{STATUS_LABELS[v.status]}</span></td>
                    <td>{v.location}</td>
                    <td>{v.daysOnLot}d</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openEdit(v)}>✏️</button>
                        {isManager && <button className="icon-btn danger" onClick={() => handleDelete(v.id)}>🗑️</button>}
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
            
            <div className="modal-image-container" style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#f5f5f5' }}>
               {(preview || form.image) ? (
                 <img 
                   src={preview || form.image} 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   alt="Preview" 
                 />
               ) : (
                 <div className="modal-image-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                   <div className="modal-ph-icon" style={{ fontSize: '40px' }}>🚗</div>
                   <div className="modal-ph-label">No Image Uploaded</div>
                 </div>
               )}
            </div>

            <div className="modal-header">
              <div className="modal-title">{modal === "add" ? "Add Vehicle" : "Edit Vehicle"}</div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                {/* NEW: File Input Field */}
                <div className="m-field full">
                  <label className="m-label">Upload Photo</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="m-input" />
                </div>
                
                <div className="m-field full">
                  <label className="m-label">VIN</label>
                  <input className="m-input" name="vin" value={form.vin} onChange={handleFormChange} />
                </div>
                
                {/* Map through other fields (year, make, model, etc) exactly as you had them */}
                {[
                    ["year", "Year", "number"],
                    ["make", "Make", "text"],
                    ["model", "Model", "text"],
                    ["trim", "Trim", "text"],
                    ["color", "Color", "text"],
                    ["mileage", "Mileage", "number"],
                    ["price", "Price (USD)", "number"],
                    ["location", "Lot Location", "text"],
                  ].map(([name, label, type]) => (
                  <div key={name} className="m-field">
                    <label className="m-label">{label}</label>
                    <input className="m-input" name={name} type={type} value={(form as any)[name] ?? ""} onChange={handleFormChange} />
                  </div>
                ))}

                <div className="m-field">
                  <label className="m-label">Status</label>
                  <select className="m-select" name="status" value={form.status} onChange={handleFormChange}>
                    {["available", "hold", "sold", "incoming"].map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s as VehicleStatus]}</option>
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