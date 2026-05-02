"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Vehicle, VehicleStatus } from "../app/types";
import api from "../api/axiosinstance";

const styles = `
/* Add your CSS styles here */
.inv-root { /* example */ }
`;

interface TableVehicle extends Vehicle {
  image: string;
}

const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Available", hold: "On Hold", sold: "Sold", incoming: "Incoming",
};
const STATUS_CLASS: Record<VehicleStatus, string> = {
  available: "st-available", hold: "st-hold", sold: "st-sold", incoming: "st-incoming",
};

const fmt = (n: number): string => `$${n.toLocaleString()}`;

const BLANK: Omit<TableVehicle, "id" | "daysOnLot"> = {
  vin:"", year: new Date().getFullYear(), make:"", model:"", trim:"", color:"",
  mileage:0, price:0, status:"available", lot:"", image:"/cars/placeholder.png",
};

type SortKey = keyof Pick<TableVehicle, "year" | "make" | "model" | "mileage" | "price" | "daysOnLot" | "status">;

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
    style={{ color: sortKey === col ? "var(--gold)" : undefined, opacity: sortKey === col ? 1 : undefined }}
  >
    {label}{sortKey === col ? (sortDir === 1 ? " ↑" : " ↓") : ""}
  </th>
);

interface InventoryProps {
  userRole: string;
}

export default function Inventory({ userRole }: InventoryProps) {
  const [inventory, setInventory] = useState<TableVehicle[]>([]);
  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]         = useState<string>("");
  const [search, setSearch]       = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [makeFilter, setMakeFilter]     = useState<string>("all");
  const [modal, setModal]         = useState<TableVehicle | "add" | null>(null);
  const [form, setForm]           = useState<Omit<TableVehicle, "id" | "daysOnLot">>(BLANK);
  const [sortKey, setSortKey]     = useState<SortKey>("year");
  const [sortDir, setSortDir]     = useState<1 | -1>(1);

  const isManager = ["General Manager", "Lot Manager", "Finance Manager"].includes(userRole);

  useEffect(() => {
    api.get<Vehicle[]>("/api/vehicles")
      .then((res) => {
        const withImage: TableVehicle[] = res.data.map((v) => ({
          ...v,
          image: "/cars/placeholder.png",
        }));
        setInventory(withImage);
      })
      .catch(() => setError("Failed to load inventory."))
      .finally(() => setLoading(false));
  }, []);

  const MAKES = [...new Set(inventory.map((v) => v.make))];

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  };

  const filtered = inventory
    .filter((v) => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${v.year} ${v.make} ${v.model} ${v.color} ${v.vin} ${v.lot}`.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || v.status === statusFilter;
      const matchMake   = makeFilter   === "all" || v.make === makeFilter;
      return matchSearch && matchStatus && matchMake;
    })
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });

  const openAdd  = (): void => { setForm(BLANK); setModal("add"); };
  const openEdit = (v: TableVehicle): void => { setForm({ ...v }); setModal(v); };
  const closeModal = (): void => setModal(null);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (): Promise<void> => {
    if (modal === "add") {
      const payload = {
        ...form,
        year: Number(form.year),
        mileage: Number(form.mileage),
        price: Number(form.price),
        daysOnLot: 0,
      };
      try {
        const res = await api.post<Vehicle>("/api/vehicles", payload);
        setInventory([{ ...res.data, image: "/cars/placeholder.png" }, ...inventory]);
      } catch {
        setError("Failed to add vehicle.");
      }
    } else if (modal && typeof modal === "object") {
      const payload = {
        ...form,
        year: Number(form.year),
        mileage: Number(form.mileage),
        price: Number(form.price),
        daysOnLot: modal.daysOnLot,
      };
      try {
        const res = await api.put<Vehicle>(`/api/vehicles/${modal.id}`, payload);
        setInventory(inventory.map((v) =>
          v.id === modal.id ? { ...res.data, image: v.image } : v
        ));
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

  const total      = inventory.length;
  const available  = inventory.filter((v) => v.status === "available").length;
  const sold       = inventory.filter((v) => v.status === "sold").length;
  const avgDays    = total > 0 ? Math.round(inventory.reduce((a, v) => a + v.daysOnLot, 0) / total) : 0;
  const totalValue = inventory.filter((v) => v.status !== "sold").reduce((a, v) => a + v.price, 0);

  const currentVehicle = modal && typeof modal === "object" ? modal : null;

  if (loading) return <div className="inv-root" style={{padding:"40px",textAlign:"center"}}>Loading inventory…</div>;

  return (
    <>
      <style>{styles}</style>
      <div className="inv-root">

        {/* Top bar */}
        <div className="inv-topbar">
          <div>
            <div className="page-eyebrow">Apex Motors</div>
            <div className="page-title">Full Inventory</div>
          </div>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
            {error && <span style={{color:"#e74c3c",fontSize:"13px",alignSelf:"center"}}>{error}</span>}
            <button className="btn-outline">Export CSV</button>
            <button className="btn-outline">Print Report</button>
            {isManager && <button className="btn-primary" onClick={openAdd}>+ Add Vehicle</button>}
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-strip">
          {[
            { label:"Total Units",    value: total,                                    cls:""      },
            { label:"Available",      value: available,                                cls:"green"  },
            { label:"Sold",           value: sold,                                     cls:""      },
            { label:"Avg Days on Lot",value: avgDays,                                  cls: avgDays > 45 ? "red" : "" },
            { label:"Lot Value",      value:`$${(totalValue/1_000_000).toFixed(2)}M`,  cls:"gold"  },
          ].map((k) => (
            <div key={k.label} className="kpi-cell">
              <div className="kpi-label">{k.label}</div>
              <div className={`kpi-value ${k.cls}`}>{k.value}</div>
              <div className="kpi-sub">all locations</div>
            </div>
          ))}
        </div>

        <div className="inv-content">

          {/* Filter sidebar */}
          <div className="filter-sidebar">
            <div className="filter-heading">Status</div>
            {([["all","All",total],["available","Available",available],["hold","On Hold",inventory.filter(v=>v.status==="hold").length],["sold","Sold",sold],["incoming","Incoming",inventory.filter(v=>v.status==="incoming").length]] as [string,string,number][]).map(([val,lbl,cnt])=>(
              <div
                key={val}
                className={`filter-chip${statusFilter===val?" active":""}`}
                onClick={() => setStatusFilter(val)}
              >
                {lbl} <span className="chip-count">{cnt}</span>
              </div>
            ))}

            <div className="filter-heading">Make</div>
            {[["all","All Makes"],...MAKES.map(m=>[m,m])].map(([val,lbl])=>(
              <div
                key={val}
                className={`filter-chip${makeFilter===val?" active":""}`}
                onClick={() => setMakeFilter(val)}
              >
                {lbl}
              </div>
            ))}

            <button
              className="clear-btn"
              onClick={() => { setStatusFilter("all"); setMakeFilter("all"); setSearch(""); }}
            >
              Clear Filters
            </button>
          </div>

          {/* Table */}
          <div className="table-area">
            <div className="table-toolbar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  placeholder="Search VIN, make, model, lot…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="results-count">{filtered.length} results</div>
            </div>

            <table className="inv-table">
              <thead>
                <tr>
                  <th style={{width:68}}>Photo</th>
                  <Th col="year"      label="Year"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <Th col="make"      label="Make / Model"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th>VIN</th>
                  <Th col="mileage"   label="Mileage"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <Th col="price"     label="Price"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <Th col="status"    label="Status"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th>Location</th>
                  <Th col="daysOnLot" label="Days"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} onClick={() => openEdit(v)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <img
                        className="td-thumb"
                        src={v.image}
                        alt={`${v.year} ${v.make} ${v.model}`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          const next = e.currentTarget.nextSibling as HTMLElement;
                          if (next) next.style.display = "flex";
                        }}
                      />
                      <div className="td-thumb-placeholder" style={{ display:"none" }}>🚗</div>
                    </td>
                    <td className="td-main">{v.year}</td>
                    <td>
                      <div className="td-main">{v.make} {v.model}</div>
                      <div style={{fontSize:"11px",color:"var(--chrome)",opacity:0.38,marginTop:"2px"}}>{v.trim}</div>
                    </td>
                    <td className="td-vin">{v.vin}</td>
                    <td>{v.mileage.toLocaleString()} mi</td>
                    <td className="td-price">{fmt(v.price)}</td>
                    <td><span className={`status-tag ${STATUS_CLASS[v.status]}`}>{STATUS_LABELS[v.status]}</span></td>
                    <td>{v.lot}</td>
                    <td style={{color: v.daysOnLot>60?"#e74c3c":v.daysOnLot>30?"#e67e22":"var(--chrome)"}}>{v.daysOnLot}d</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openEdit(v)} title="Edit">✏️</button>
                        {isManager && (
                          <button className="icon-btn danger" onClick={() => handleDelete(v.id)} title="Delete">🗑️</button>
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

      {/* Add / Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            {currentVehicle ? (
              <>
                <img
                  className="modal-image"
                  src={currentVehicle.image}
                  alt={`${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const next = e.currentTarget.nextSibling as HTMLElement;
                    if (next) next.style.display = "flex";
                  }}
                />
                <div className="modal-image-placeholder" style={{ display:"none" }}>
                  <div className="modal-ph-icon">🚗</div>
                  <div className="modal-ph-label">Image coming soon</div>
                </div>
              </>
            ) : (
              <div className="modal-image-placeholder">
                <div className="modal-ph-icon">🚗</div>
                <div className="modal-ph-label">New vehicle — add PNG later</div>
              </div>
            )}

            <div className="modal-header">
              <div className="modal-title">
                {modal === "add" ? "Add Vehicle" : "Edit Vehicle"}
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                <div className="m-field full">
                  <label className="m-label">VIN</label>
                  <input className="m-input" name="vin" value={form.vin} onChange={handleFormChange} placeholder="17-character VIN" />
                </div>
                {([
                  ["year","Year","number"],["make","Make","text"],["model","Model","text"],
                  ["trim","Trim","text"],["color","Color","text"],
                  ["mileage","Mileage","number"],["price","Price (USD)","number"],["lot","Lot Location","text"],
                ] as [string,string,string][]).map(([name,label,type]) => (
                  <div key={name} className="m-field">
                    <label className="m-label">{label}</label>
                    <input className="m-input" name={name} type={type}
                      value={(form as Record<string,unknown>)[name] as string ?? ""}
                      onChange={handleFormChange} />
                  </div>
                ))}
                <div className="m-field">
                  <label className="m-label">Status</label>
                  <select className="m-select" name="status" value={form.status} onChange={handleFormChange}>
                    {(["available","hold","sold","incoming"] as VehicleStatus[]).map((s)=>(
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