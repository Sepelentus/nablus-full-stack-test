/*
answers.sql — Prueba técnica

Asumir tabla Postgres:
  orders(
    id text,
    customer_name text,
    customer_rut text,
    issued_at date,
    net numeric,
    vat_rate numeric,
    status text -- 'pending' | 'paid' | 'canceled'
  )

Campos calculados:
  vat   = net * vat_rate
  total = net + (net * vat_rate)

Parámetros (pueden ser NULL):
  :q      text
  :status text  -- 'all' | 'pending' | 'paid' | 'canceled'
  :from   date
  :to     date
  :sort   text  -- 'issuedAt' | 'total'
  :dir    text  -- 'asc' | 'desc'
*/

-- ============================================================
-- 1) SQL equivalente a GET /api/orders (filtros + orden)
-- ============================================================

WITH base AS (
  SELECT
    o.id,
    o.customer_name,
    o.customer_rut,
    o.issued_at,
    o.net,
    (o.net * o.vat_rate) AS vat,
    (o.net + (o.net * o.vat_rate)) AS total,
    o.status
  FROM orders o
  WHERE
    -- status
    (:status IS NULL OR :status = 'all' OR o.status = :status)

    -- from/to inclusivo
    AND (:from IS NULL OR o.issued_at >= :from)
    AND (:to   IS NULL OR o.issued_at <= :to)

    -- búsqueda q (case-insensitive)
    AND (
      :q IS NULL OR :q = '' OR
      o.id ILIKE ('%' || :q || '%') OR
      o.customer_name ILIKE ('%' || :q || '%') OR
      o.customer_rut ILIKE ('%' || :q || '%')
    )
)
SELECT *
FROM base
ORDER BY
  -- sort + dir (sin SQL dinámico): resolver con CASE WHEN
  CASE WHEN :sort = 'issuedAt' AND :dir = 'asc'  THEN issued_at END ASC,
  CASE WHEN :sort = 'issuedAt' AND :dir = 'desc' THEN issued_at END DESC,
  CASE WHEN :sort = 'total'    AND :dir = 'asc'  THEN total END ASC,
  CASE WHEN :sort = 'total'    AND :dir = 'desc' THEN total END DESC,

  -- tie-breaker estable:
  id ASC
;

-- ============================================================
-- 2) SQL equivalente a summary (count + sum + by status)
-- ============================================================

WITH filtered AS (
  SELECT
    o.net,
    (o.net * o.vat_rate) AS vat,
    (o.net + (o.net * o.vat_rate)) AS total,
    o.status
  FROM orders o
  WHERE
    (:status IS NULL OR :status = 'all' OR o.status = :status)
    AND (:from IS NULL OR o.issued_at >= :from)
    AND (:to   IS NULL OR o.issued_at <= :to)
    AND (
      :q IS NULL OR :q = '' OR
      o.id ILIKE ('%' || :q || '%') OR
      o.customer_name ILIKE ('%' || :q || '%') OR
      o.customer_rut ILIKE ('%' || :q || '%')
    )
)
SELECT
  COUNT(*) AS count,
  COALESCE(SUM(net), 0)   AS total_net,
  COALESCE(SUM(vat), 0)   AS total_vat,
  COALESCE(SUM(total), 0) AS total_gross,

  -- conteo por status (Postgres FILTER es lo más limpio)
  COUNT(*) FILTER (WHERE status = 'pending')  AS pending_count,
  COUNT(*) FILTER (WHERE status = 'paid')     AS paid_count,
  COUNT(*) FILTER (WHERE status = 'canceled') AS canceled_count
FROM filtered;