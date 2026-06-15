// app/admin/orders/page.jsx
"use client";

import { useState, useMemo, useEffect } from "react";

const API_URL = "https://ex-next-server.vercel.app/users";

const STATUS_STYLES = {
  Pending:    "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Delivered:  "bg-green-100 text-green-800",
  Cancelled:  "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected]       = useState(null);

  // ✅ Database থেকে data fetch
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Status update → backend এও save হবে
  const updateStatus = async (_id, status) => {
    try {
      await fetch(`${API_URL}/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrders(prev => prev.map(o => o._id === _id ? { ...o, status } : o));
      setSelected(prev => prev?._id === _id ? { ...prev, status } : prev);
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  const filtered = useMemo(() =>
    orders.filter((o) => {
      const matchStatus = !statusFilter || o.status === statusFilter;
      const matchSearch = !search ||
        `${o.firstName} ${o.lastName} ${o.productName} ${o.city} ${o._id}`
          .toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    }), [orders, search, statusFilter]);

  const stats = useMemo(() => ({
    total:     orders.length,
    pending:   orders.filter(o => o.status === "Pending").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    revenue:   orders.reduce((s, o) => s + (o.quantity * o.price), 0).toFixed(2),
  }), [orders]);

  const exportCSV = () => {
    const headers = ["ID","Name","Email","Product","City","Qty","Price","Total","Status","Date"];
    const rows = orders.map(o => [
      o._id, `${o.firstName} ${o.lastName}`, o.email,
      o.productName, o.city, o.quantity, o.price,
      (o.quantity * o.price).toFixed(2), o.status, o.date
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "orders.csv";
    a.click();
  };

  // ── Loading state ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading orders...</p>
      </div>
    </div>
  );

  // ── Error state ──
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white border border-red-100 rounded-2xl p-8 max-w-sm w-full">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Failed to load orders</h2>
        <p className="text-sm text-red-400 mb-5">{error}</p>
        <button onClick={fetchOrders}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Showing {filtered.length} of {orders.length} orders
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchOrders}
              className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              ↻ Refresh
            </button>
            <button onClick={exportCSV}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
              ↓ Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Orders", value: stats.total,     color: "text-gray-900" },
            { label: "Pending",      value: stats.pending,   color: "text-yellow-500" },
            { label: "Delivered",    value: stats.delivered, color: "text-green-500" },
            { label: "Revenue",      value: `$${stats.revenue}`, color: "text-gray-900" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input type="text" placeholder="Search orders..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-400 bg-white w-56" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-400 text-gray-600">
            <option value="">All Status</option>
            {["Pending","Processing","Delivered","Cancelled"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Order ID","Customer","Product","City","Total","Status","Date",""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o._id} onClick={() => setSelected(o)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{o._id}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{o.firstName} {o.lastName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{o.productName}</td>
                  <td className="px-5 py-3.5 text-gray-500">{o.city}</td>
                  <td className="px-5 py-3.5 font-semibold">${(o.quantity * o.price).toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{o.date}</td>
                  <td className="px-5 py-3.5 text-gray-300">›</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl">✕</button>
            <h2 className="text-lg font-bold text-gray-900">{selected.firstName} {selected.lastName}</h2>
            <p className="text-xs text-gray-400 mb-5">{selected._id} · {selected.date}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Email",      selected.email],
                ["Phone",      selected.phone || "—"],
                ["Product",    selected.productName],
                ["Category",   selected.category],
                ["Qty × Price",`${selected.quantity} × $${selected.price} = $${(selected.quantity * selected.price).toFixed(2)}`],
                ["Payment",    selected.payment || "—"],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-800">{value}</p>
                </div>
              ))}
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Delivery Address</p>
                <p className="font-medium text-gray-800">
                  {selected.address}, {selected.city}
                  {selected.state ? `, ${selected.state}` : ""} {selected.zip}, {selected.country}
                </p>
              </div>
              {selected.notes && (
                <div className="bg-yellow-50 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-yellow-600 mb-0.5">Notes</p>
                  <p className="text-gray-700">{selected.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
              <select value={selected.status}
                onChange={(e) => updateStatus(selected._id, e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400">
                {["Pending","Processing","Delivered","Cancelled"].map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => setSelected(null)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}