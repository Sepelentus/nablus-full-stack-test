import { Order } from "./data";

// BUG intencional: el IVA está mal calculado a propósito (el candidato debe corregirlo)
export function calcTotals(o: Order) {
  const total = o.net * (1 + o.vatRate);
  const vat = total * o.vatRate; // <-- BUG (debería depender del net, no del total)
  return { vat, total };
}