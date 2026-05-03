"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Customer, Vehicle, SaleTransaction } from "../app/types";
import api from "../api/axiosinstance";

interface SalesProps {
  userRole: string;
}

function formatDate(d: string | number[]): string {
  if (Array.isArray(d)) {
    const [y, m, day] = d;
    return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return String(d);
}

const BLANK_FORM = { customerId: "", vehicleId: "", amount: "", paymentType: "Cash" };

export default function Sales({ userRole }: SalesProps) {
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [customers, setCustomers]       = useState<Customer[]>([]);
  const [vehicles, setVehicles]         = useState<Vehicle[]>([]);
  const [loading, setLoading]           = useState<boolean>(true);
  const [error, setError]               = useState<string>("");
  const [showModal, setShowModal]       = useState<boolean>(false);
  const [form, setForm]                 = useState(BLANK_FORM);
  const [saving, setSaving]             = useState<boolean>(false);

  const canRecord = ["General Manager", "Finance Manager", "Sales Associate"].includes(userRole);

  useEffect(() => {
    Promise.all([
      api.get<SaleTransaction[]>("/api/transactions"),
      api.get<Customer[]>("/api/customers"),
      api.get<Vehicle[]>("/api/vehicles"),
    ])
      .then(([txRes, custRes, vehRes]) => {
        setTransactions(txRes.data);
        setCustomers(custRes.data);
        setVehicles(vehRes.data);
      })
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, []);

  const availableVehicles = vehicles.filter((v) => v.status === "available");

  const openModal  = () => { setForm(BLANK_FORM); setError(""); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRecordSale = async () => {
    if (!form.customerId || !form.vehicleId || !form.amount || !form.paymentType) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await api.post<SaleTransaction>(
        `/api/transactions/sale?customerId=${form.customerId}&vehicleId=${form.vehicleId}&amount=${form.amount}&paymentType=${encodeURIComponent(form.paymentType)}`
      );
      setTransactions([res.data, ...transactions]);
      // Mark the vehicle as sold in the local list
      setVehicles(vehicles.map((v) =>
        v.id === Number(form.vehicleId) ? { ...v, status: "sold" } : v
      ));
      closeModal();
    } catch {
      setError("Failed to record sale. The vehicle may no longer be available.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this transaction record?")) return;
    try {
      await api.delete(`/api/transactions/${id}`);
      setTransactions(transactions.filter((t) => t.transactionId !== id));
    } catch {
      setError("Failed to delete transaction.");
    }
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (loading) return <div className="inv-root" style={{ padding: "40px" }}>Loading sales…</div>;

  return (
    <>
      <div className="inv-root">
        <div className="inv-topbar">
          <div>
            <div className="page-title">Sales</div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Total Revenue: <strong>${totalRevenue.toLocaleString()}</strong>
              &nbsp;·&nbsp; {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {error && !showModal && <span style={{ color: "#e74c3c", fontSize: "13px" }}>{error}</span>}
            {canRecord && (
              <button className="btn-primary" onClick={openModal}>+ Record Sale</button>
            )}
          </div>
        </div>

        <table className="inv-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Amount</th>
              <th>Payment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.transactionId}>
                <td>{t.transactionId}</td>
                <td>{formatDate(t.date)}</td>
                <td className="td-main">{t.customer?.name ?? "—"}</td>
                <td>{t.vehicle ? `${t.vehicle.year} ${t.vehicle.make} ${t.vehicle.model}` : "—"}</td>
                <td className="td-price">${t.amount.toLocaleString()}</td>
                <td>{t.paymentType}</td>
                <td>
                  {canRecord && (
                    <div className="row-actions" style={{ opacity: 1 }}>
                      <button className="icon-btn danger" onClick={() => handleDelete(t.transactionId)} title="Delete">D</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Record Sale</div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {error && <div style={{ color: "#e74c3c", marginBottom: "12px", fontSize: "13px" }}>{error}</div>}
              <div className="modal-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div className="m-field">
                  <label className="m-label">Customer</label>
                  <select className="m-select" name="customerId" value={form.customerId} onChange={handleChange}>
                    <option value="">-- Select Customer --</option>
                    {customers.map((c) => (
                      <option key={c.customerId} value={c.customerId}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="m-field">
                  <label className="m-label">Vehicle (Available Only)</label>
                  <select className="m-select" name="vehicleId" value={form.vehicleId} onChange={handleChange}>
                    <option value="">-- Select Vehicle --</option>
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} — ${v.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="m-field">
                  <label className="m-label">Sale Amount ($)</label>
                  <input
                    className="m-input"
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="e.g. 25000"
                  />
                </div>
                <div className="m-field">
                  <label className="m-label">Payment Type</label>
                  <select className="m-select" name="paymentType" value={form.paymentType} onChange={handleChange}>
                    <option value="Cash">Cash</option>
                    <option value="Finance">Finance</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleRecordSale} disabled={saving}>
                {saving ? "Saving…" : "Record Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
