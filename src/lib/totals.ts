import { Order } from "./data";

export function calcTotals(o: Order) {
  const vat = o.net * o.vatRate;
  const total = o.net + vat;
  return { vat, total };
}