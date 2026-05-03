"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Customer } from "../app/types";
import api from "../api/axiosinstance";

interface CustomersProps {
  userRole: string;
}

const BLANK = { name: "", phone: "", email: "" };

export default function Customers({ userRole }: CustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]         = useState<string>("");
  const [search, setSearch]       = useState<string>("");
  const [modal, setModal]         = useState<Customer | "add" | null>(null);
  const [form, setForm]           = useState(BLANK);

  const canEdit = ["General Manager", "Finance Manager", "Sales Associate"].includes(userRole);

  useEffect(() => {
    api.get<Customer[]>("/api/customers")
      .then((res) => setCustomers(res.data))
      .catch(() => setError("Failed to load customers."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q);
  });

  const openAdd  = () => { setForm(BLANK); setModal("add"); };
  const openEdit = (c: Customer) => { setForm({ name: c.name, phone: c.phone, email: c.email }); setModal(c); };
  const close    = () => setModal(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setError("");
    try {
      if (modal === "add") {
        const res = await api.post<Customer>("/api/customers", form);
        setCustomers([...customers, res.data]);
      } else if (modal && typeof modal === "object") {
        const res = await api.put<Customer>(`/api/customers/${modal.customerId}`, {
          ...form,
          customerId: modal.customerId,
        });
        setCustomers(customers.map((c) => c.customerId === modal.customerId ? res.data : c));
      }
      close();
    } catch {
      setError("Failed to save customer.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await api.delete(`/api/customers/${id}`);
      setCustomers(customers.filter((c) => c.customerId !== id));
    } catch {
      setError("Failed to delete customer.");
    }
  };

  if (loading) return <div className="inv-root" style={{ padding: "40px" }}>Loading customers…</div>;

  return (
    <>
      <div className="inv-root">
        <div className="inv-topbar">
          <div className="page-title">Customers</div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {error && <span style={{ color: "#e74c3c", fontSize: "13px" }}>{error}</span>}
            {canEdit && <button className="btn-primary" onClick={openAdd}>+ Add Customer</button>}
          </div>
        </div>

        <div style={{ padding: "0 0 16px" }}>
          <div className="table-toolbar">
            <div className="search-box">
              <input
                className="search-input"
                placeholder="Search name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="results-count">{filtered.length} customers</div>
          </div>

          <table className="inv-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.customerId}>
                  <td>{c.customerId}</td>
                  <td className="td-main">{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td>
                    <div className="row-actions" style={{ opacity: 1 }}>
                      {canEdit && (
                        <>
                          <button className="icon-btn" onClick={() => openEdit(c)} title="Edit">E</button>
                          <button className="icon-btn danger" onClick={() => handleDelete(c.customerId)} title="Delete">D</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === "add" ? "Add Customer" : "Edit Customer"}</div>
              <button className="modal-close" onClick={close}>×</button>
            </div>
            <div className="modal-body">
              {error && <div style={{ color: "#e74c3c", marginBottom: "12px", fontSize: "13px" }}>{error}</div>}
              <div className="modal-grid" style={{ gridTemplateColumns: "1fr" }}>
                {([
                  ["name",  "Name",         "text" ],
                  ["phone", "Phone",        "text" ],
                  ["email", "Email",        "email"],
                ] as [string, string, string][]).map(([name, label, type]) => (
                  <div key={name} className="m-field">
                    <label className="m-label">{label}</label>
                    <input
                      className="m-input"
                      name={name}
                      type={type}
                      value={(form as Record<string, string>)[name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={close}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>
                {modal === "add" ? "Add Customer" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
