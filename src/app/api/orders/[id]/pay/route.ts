import { CORS_HEADERS } from "@/lib/cors";
import { payOrder } from "@/repositories/ordersRepo";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {

  // TODO (candidato):
  // 1) await ctx.params para obtener { id }
  // 2) limpiar/sanitizar el id (decodeURIComponent + trim)
  // 3) llamar payOrder(id)
  // 4) si payOrder falla: responder con status res.code y body { error: res.error }
  // 5) si ok: responder 200 con { ok: true, order: res.order }
  // 6) incluir headers Content-Type + CORS_HEADERS

  // 1) Obtener { id } desde ctx.params
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