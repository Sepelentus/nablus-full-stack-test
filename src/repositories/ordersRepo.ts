import { Order, getOrdersDb } from "@/lib/data";
import { calcTotals } from "@/lib/totals";

export type OrdersQuery = {
  q?: string;
  status?: "pending" | "paid" | "canceled" | "all";
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  sort?: "issuedAt" | "total";
  dir?: "asc" | "desc";
};

export type OrderRow = {
  id: string;
  customerName: string;
  customerRut: string;
  issuedAt: string;
  net: number;
  vat: number;
  total: number;
  status: "pending" | "paid" | "canceled";
};

export type OrdersResponse = {
  data: OrderRow[];
  summary: {
    count: number;
    totalNet: number;
    totalVat: number;
    totalGross: number;
    byStatus: Record<"pending" | "paid" | "canceled", number>;
  };
};

export async function listOrders(_q: OrdersQuery): Promise<OrdersResponse> {
  const db = getOrdersDb();
  const q = _q || {};

  const filtered = db.filter((order) => {
    if (q.status && q.status !== "all" && order.status !== q.status) return false;

    if (q.q) {
      const term = q.q.toLowerCase();
      const match =
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerRut.toLowerCase().includes(term);
      if (!match) return false;
    }

    if (q.from && order.issuedAt < q.from) return false;
    if (q.to && order.issuedAt > q.to) return false;

    return true;
  });

  const rows: OrderRow[] = filtered.map((order) => {
    const { vat, total } = calcTotals(order);
    return {
      id: order.id,
      customerName: order.customerName,
      customerRut: order.customerRut,
      issuedAt: order.issuedAt,
      net: order.net,
      vat,
      total,
      status: order.status,
    };
  });

  const sortField = q.sort ?? "issuedAt";
  const sortDir = q.dir ?? "desc";

  rows.sort((a, b) => {
    const cmp =
      sortField === "total"
        ? a.total - b.total
        : a.issuedAt < b.issuedAt ? -1 : a.issuedAt > b.issuedAt ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const byStatus: Record<"pending" | "paid" | "canceled", number> = {
    pending: 0,
    paid: 0,
    canceled: 0,
  };
  let totalNet = 0;
  let totalVat = 0;
  let totalGross = 0;

  for (const row of rows) {
    byStatus[row.status]++;
    totalNet += row.net;
    totalVat += row.vat;
    totalGross += row.total;
  }

  return {
    data: rows,
    summary: { count: rows.length, totalNet, totalVat, totalGross, byStatus },
  };
}

export async function payOrder(
  id: string
): Promise<{ ok: true; order: Order } | { ok: false; code: number; error: string }> {
  const db = getOrdersDb();
  const cleanId = String(id).trim();

  const idx = db.findIndex((o) => String(o.id).trim() === cleanId);
  if (idx === -1) return { ok: false, code: 404, error: "Not found" };
  if (db[idx].status === "canceled") return { ok: false, code: 409, error: "Cannot pay a canceled order" };

  db[idx] = { ...db[idx], status: "paid" };
  return { ok: true, order: db[idx] };
}
