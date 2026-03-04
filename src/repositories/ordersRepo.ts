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
  // TODO (candidato):
  // 1) Obtener data desde getOrdersDb()
  // 2) Aplicar filtros:
  //    - status (si != 'all')
  //    - q: buscar en id/customerName/customerRut (case-insensitive)
  //    - from/to: issuedAt inclusivo (YYYY-MM-DD)
  // 3) Mapear a OrderRow calculando vat/total con calcTotals()
  // 4) Ordenar por issuedAt o total + dir asc/desc
  // 5) Armar summary:
  //    - count
  //    - totalNet, totalVat, totalGross
  //    - byStatus: conteo por cada estado

  return {
    data: [],
    summary: {
      count: 0,
      totalNet: 0,
      totalVat: 0,
      totalGross: 0,
      byStatus: { pending: 0, paid: 0, canceled: 0 },
    },
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
