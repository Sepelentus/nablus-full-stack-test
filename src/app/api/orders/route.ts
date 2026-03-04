import { CORS_HEADERS } from "@/lib/cors";
import { listOrders, OrdersQuery } from "@/repositories/ordersRepo";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Parse básico (intencionalmente sin validación estricta para que el candidato pueda mejorar si quiere)
  const q = url.searchParams.get("q") ?? undefined;
  const status = (url.searchParams.get("status") as OrdersQuery["status"]) ?? "all";
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const sort = (url.searchParams.get("sort") as OrdersQuery["sort"]) ?? "issuedAt";
  const dir = (url.searchParams.get("dir") as OrdersQuery["dir"]) ?? "desc";

  const payload = await listOrders({ q, status, from, to, sort, dir });

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}