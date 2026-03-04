# Prueba técnica Fullstack (25 minutos)

## Objetivo
Completar una mini funcionalidad fullstack (API + UI) estilo "Edge/serverless" con React + TypeScript.

## Qué debe implementar
1) Corregir el bug del IVA en `src/lib/totals.ts`.
2) Implementar `listOrders()` en `src/repositories/ordersRepo.ts`:
   - filtros: q, status, from/to
   - sorting: issuedAt o total, dir asc/desc
   - mapping: calcular vat/total
   - summary: count, sum net/vat/total, conteo por status
3) Implementar `POST /api/orders/:id/pay` en `src/app/api/orders/[id]/pay/route.ts`.
4) Implementar `pay(id)` en el front (`src/app/page.tsx`) para marcar como pagada y refrescar.

## Cómo ejecutar
```bash
npm ci
npm run dev
