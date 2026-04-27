import { useState, ChangeEvent } from "react";
import { Vehicle, VehicleStatus } from "../app/types";

const styles = `
/* Add your CSS styles here */
.inv-root { /* example */ }
`;

interface TableVehicle extends Vehicle {
  image: string;
}

const INITIAL_INVENTORY: TableVehicle[] = [
  { id:1,  vin:"WBS8M9C59J5L12345", year:2024, make:"BMW",          model:"M3 Competition", trim:"Competition xDrive", color:"Brooklyn Grey",   mileage:1200,  price:82900,  status:"available", lot:"Lot A · Row 2",     daysOnLot:8,  image:"/cars/placeholder.png" },
  { id:2,  vin:"4JGDF6EE0NA123456", year:2023, make:"Mercedes-Benz",model:"GLE 53 AMG",     trim:"4MATIC+",            color:"Obsidian Black",  mileage:8450,  price:79500,  status:"hold",      lot:"Showroom",           daysOnLot:23, image:"/cars/placeholder.png" },
  { id:3,  vin:"WP1AE2A20NDA01234", year:2022, make:"Porsche",       model:"Cayenne GTS",    trim:"GTS Coupe",          color:"Carmine Red",     mileage:14200, price:91200,  status:"available", lot:"Lot B · Row 1",     daysOnLot:41, image:"/cars/placeholder.png" },
  { id:4,  vin:"WAUZZZF20RN012345", year:2024, make:"Audi",          model:"RS6 Avant",      trim:"Performance",        color:"Nardo Grey",      mileage:3100,  price:115000, status:"available", lot:"Showroom",           daysOnLot:5,  image:"/cars/placeholder.png" },
  { id:5,  vin:"1G1YB2D47N5100001", year:2023, make:"Chevrolet",     model:"Corvette Z06",   trim:"3LZ",                color:"Rapid Blue",      mileage:6700,  price:104500, status:"sold",      lot:"Lot A · Row 7",     daysOnLot:62, image:"/cars/placeholder.png" },
  { id:6,  vin:"1FTFW1RG3NFA12345", year:2021, make:"Ford",          model:"F-150 Raptor",   trim:"802A",               color:"Iconic Silver",   mileage:28900, price:58700,  status:"available", lot:"Truck Lot · Row 3", daysOnLot:17, image:"/cars/placeholder.png" },
  { id:7,  vin:"JTHH5BEL5NA001234", year:2022, make:"Lexus",         model:"LC 500h",        trim:"Inspiration",        color:"Atomic Silver",   mileage:19000, price:72000,  status:"available", lot:"Lot A · Row 4",     daysOnLot:33, image:"/cars/placeholder.png" },
  { id:8,  vin:"SALWS2RU1NA123456", year:2023, make:"Range Rover",   model:"Sport SVR",      trim:"Carbon Edition",     color:"Carpathian Grey", mileage:11300, price:138000, status:"hold",      lot:"Showroom",           daysOnLot:12, image:"/cars/placeholder.png" },
  { id:9,  vin:"2T1BURHE1NC123456", year:2024, make:"Toyota",        model:"GR Corolla",     trim:"Morizo Edition",     color:"Heavy Metal",     mileage:500,   price:62000,  status:"incoming",  lot:"In Transit",         daysOnLot:0,  image:"/cars/placeholder.png" },
  { id:10, vin:"19XFC1F3XNE123456", year:2022, make:"Honda",         model:"Civic Type R",   trim:"FL5",                color:"Rallye Red",      mileage:9800,  price:44900,  status:"available", lot:"Lot B · Row 4",     daysOnLot:27, image:"/cars/placeholder.png" },
];

const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Available", hold: "On Hold", sold: "Sold", incoming: "Incoming",
};
const STATUS_CLASS: Record<VehicleStatus, string> = {
  available: "st-available", hold: "st-hold", sold: "st-sold", incoming: "st-incoming",
};

const fmt = (n: number): string => `$${n.toLocaleString()}`;

const MAKES = [...new Set(INITIAL_INVENTORY.map((v) => v.make))];

const BLANK: Omit<TableVehicle, "id" | "daysOnLot"> = {
  vin:"", year: new Date().getFullYear(), make:"", model:"", trim:"", color:"",
  mileage:0, price:0, status:"available", lot:"", image:"/cars/placeholder.png",
};

type SortKey = keyof Pick<TableVehicle, "year" | "make" | "model" | "mileage" | "price" | "daysOnLot" | "status">;

interface InventoryProps {
  userRole: string;
}

export default function Inventory({ userRole }: InventoryProps) {
  const [inventory, setInventory] = useState<TableVehicle[]>(INITIAL_INVENTORY);
  const [search, setSearch]       = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [makeFilter, setMakeFilter]     = useState<string>("all");
  const [modal, setModal]         = useState<TableVehicle | "add" | null>(null);
  const [form, setForm]           = useState<Omit<TableVehicle, "id" | "daysOnLot">>(BLANK);
  const [sortKey, setSortKey]     = useState<SortKey>("year");
  const [sortDir, setSortDir]     = useState<1 | -1>(1);

  const isManager = ["General Manager", "Lot Manager", "Finance Manager"].includes(userRole);

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

  const openAdd  = (): void => { setForm(BLANK);               setModal("add"); };
  const openEdit = (v: TableVehicle): void => { setForm({ ...v }); setModal(v);   };
  const closeModal = (): void => setModal(null);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (): void => {
    if (modal === "add") {
      const newV: TableVehicle = {
        ...form,
        id: Date.now(),
        year: Number(form.year),
        mileage: Number(form.mileage),
        price: Number(form.price),
        daysOnLot: 0,
      };
      setInventory([newV, ...inventory]);
    } else if (modal && typeof modal === 'object') {
      setInventory(inventory.map((v) =>
        v.id === modal.id
          ? { ...v, ...form, year: Number(form.year), mileage: Number(form.mileage), price: Number(form.price) }
          : v
      ));
    }
    closeModal();
  };

  const handleDelete = (id: number): void => {
    if (window.confirm("Remove this vehicle from inventory?")) {
      setInventory(inventory.filter((v) => v.id !== id));
    }
  };

  const total      = inventory.length;
  const available  = inventory.filter((v) => v.status === "available").length;
  const sold       = inventory.filter((v) => v.status === "sold").length;
  const avgDays    = Math.round(inventory.reduce((a, v) => a + v.daysOnLot, 0) / total);
  const totalValue = inventory.filter((v) => v.status !== "sold").reduce((a, v) => a + v.price, 0);

  const Th = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      style={{ color: sortKey === col ? "var(--gold)" : undefined, opacity: sortKey === col ? 1 : undefined }}
    >
      {label}{sortKey === col ? (sortDir === 1 ? " ↑" : " ↓") : ""}
    </th>
  );

  const currentVehicle = modal && typeof modal === 'object' ? modal : null;

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
            <button className="btn-outline">Export CSV</button>
            <button className="btn-outline">Print Report</button>
            {isManager && <button className="btn-primary" onClick={openAdd}>+ Add Vehicle</button>}
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-strip">
          {[
            { label:"Total Units",    value: total,                                               cls:""      },
            { label:"Available",      value: available,                                           cls:"green"  },
            { label:"Sold",           value: sold,                                                cls:""      },
            { label:"Avg Days on Lot",value: avgDays,                                            cls: avgDays > 45 ? "red" : "" },
            { label:"Lot Value",      value:`$${(totalValue/1_000_000).toFixed(2)}M`,            cls:"gold"  },
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
                  <Th col="year"      label="Year" />
                  <Th col="make"      label="Make / Model" />
                  <th>VIN</th>
                  <Th col="mileage"   label="Mileage" />
                  <Th col="price"     label="Price" />
                  <Th col="status"    label="Status" />
                  <th>Location</th>
                  <Th col="daysOnLot" label="Days" />
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} onClick={() => openEdit(v)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      {/*
                        Replace v.image with your real PNG path.
                        Falls back to placeholder icon if file is missing.
                      */}
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

            {/*
              Modal image: shows vehicle PNG at full width.
              Replace the src with a real path when PNGs are added.
            */}
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