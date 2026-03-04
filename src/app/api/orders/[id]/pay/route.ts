import { CORS_HEADERS } from "@/lib/cors";
import { payOrder } from "@/repositories/ordersRepo";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await ctx.params;
  const id = decodeURIComponent(String(rawId)).trim();

  const res = await payOrder(id);

  if (!res.ok) {
    return new Response(JSON.stringify({ error: res.error }), {
      status: res.code,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  return new Response(JSON.stringify({ ok: true, order: res.order }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}