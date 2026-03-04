export type OrderStatus = "pending" | "paid" | "canceled";

export type Order = {
  id: string;
  customerName: string;
  customerRut: string;
  issuedAt: string; // YYYY-MM-DD
  net: number;
  vatRate: number;
  status: OrderStatus;
};

const SEED: Order[] = [
  { id: "1001", customerName: "JUGOS RÚSTICOS SPA", customerRut: "76467151-1", issuedAt: "2026-01-05", net: 23562, vatRate: 0.19, status: "pending" },
  { id: "1002", customerName: "SERVICIOS ALFA LTDA", customerRut: "76123456-0", issuedAt: "2026-01-12", net: 125000, vatRate: 0.19, status: "paid" },
  { id: "1003", customerName: "COMERCIAL BETA SPA", customerRut: "77555111-3", issuedAt: "2026-02-02", net: 8800, vatRate: 0.19, status: "pending" },
  { id: "1004", customerName: "TRANSPORTES GAMMA", customerRut: "76999888-1", issuedAt: "2026-02-10", net: 350000, vatRate: 0.19, status: "canceled" },
  { id: "1005", customerName: "DELTA INGENIERÍA", customerRut: "76543210-9", issuedAt: "2026-02-18", net: 49990, vatRate: 0.19, status: "pending" },
];

const KEY = "__ORDERS_DB__";

export function getOrdersDb(): Order[] {
  const g = globalThis as any;

  // Si no existe o quedó corrupta/vacía (por hot reload), re-seed.
  if (!Array.isArray(g[KEY]) || g[KEY].length === 0) {
    g[KEY] = structuredClone(SEED);
  }
  return g[KEY] as Order[];
}