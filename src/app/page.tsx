"use client";

import React, { useEffect, useMemo, useState } from "react";

type OrderRow = {
  id: string;
  customerName: string;
  customerRut: string;
  issuedAt: string;
  net: number;
  vat: number;
  total: number;
  status: "pending" | "paid" | "canceled";
};

type OrdersResponse = {
  data: OrderRow[];
  summary: {
    count: number;
    totalNet: number;
    totalVat: number;
    totalGross: number;
    byStatus: Record<"pending" | "paid" | "canceled", number>;
  };
};

export default function Page() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "paid" | "canceled">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resp, setResp] = useState<OrdersResponse | null>(null);

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    p.set("status", status);
    p.set("sort", "issuedAt");
    p.set("dir", "desc");
    return `/api/orders?${p.toString()}`;
  }, [q, status]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j: OrdersResponse = await r.json();
      setResp(j);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  async function pay(id: string) {
    // TODO (candidato):
    // - POST /api/orders/:id/pay
    // - manejar error (mostrarlo arriba)
    // - refrescar (load) si ok
    setError(null);
    try {
      const r = await fetch(`/api/orders/${encodeURIComponent(id)}/pay`, {
        method: "POST",
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${r.status}`);
      }
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Error al pagar");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Órdenes</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por ID / Cliente / RUT"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="paid">Pagadas</option>
          <option value="canceled">Anuladas</option>
        </select>
        <button onClick={load} disabled={loading}>
          Refrescar
        </button>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
      {loading && <div>Cargando...</div>}

      {resp && (
        <>
          <div style={{ marginBottom: 12 }}>
            <strong>{resp.summary.count}</strong> órdenes — Total:{" "}
            <strong>{resp.summary.totalGross}</strong>
          </div>

          <table cellPadding={8} border={1} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>RUT</th>
                <th>Fecha</th>
                <th>Neto</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {resp.data.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{o.customerRut}</td>
                  <td>{o.issuedAt}</td>
                  <td>{o.net}</td>
                  <td>{o.vat}</td>
                  <td>{o.total}</td>
                  <td>{o.status}</td>
                  <td>
                    {o.status === "pending" ? (
                      <button onClick={() => pay(o.id)}>Marcar como pagada</button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {resp.data.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center" }}>
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}