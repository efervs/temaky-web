-- schema.sql — Bitácora de ventas para Cloudflare D1 (reemplaza la hoja de Google).
--
-- Crear la base y aplicar:
--   npx wrangler d1 create temaky-ventas
--   npx wrangler d1 execute temaky-ventas --remote --file=./schema.sql
-- Luego bindear en Cloudflare Pages → Settings → Functions → D1 bindings → variable "DB".

CREATE TABLE IF NOT EXISTS ventas (
  event_id      TEXT PRIMARY KEY,                 -- idempotencia + dedup en Meta
  created_at    TEXT NOT NULL,                    -- ISO timestamp del registro
  event_time    INTEGER NOT NULL,                 -- unix enviado a Meta (hora del 1er msg del cliente)
  nombre        TEXT,                             -- PII en claro: bitácora privada (binding, no expuesta)
  telefono      TEXT,                             -- E.164: 528127474440
  colonia       TEXT,
  calle         TEXT,
  ciudad        TEXT,
  estado        TEXT,
  cp            TEXT,
  canal         TEXT,                             -- domicilio | recoge | comedor
  como_llego    TEXT,                             -- sanity check; NO se envía a Meta
  correo        TEXT,
  value         REAL NOT NULL,
  order_id      TEXT,
  notas         TEXT,
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | sent | error | duplicate
  meta_response TEXT,                             -- fbtrace_id / events_received / motivo de error
  enviado_por   TEXT,                             -- IP de quien registró (auditoría)
  gclid         TEXT                              -- click id de Google: "gclid:Cj0K…" | "gbraid:…" | "wbraid:…"
);

-- Migración aplicada el 2026-08-12 sobre la base viva (temaky-ventas,
-- ae0524f2-5c2d-454c-8b34-6caa202ccf34). En SQLite ADD COLUMN es metadatos: no reescribe filas.
--   npx wrangler d1 execute <uuid> --remote --command "ALTER TABLE ventas ADD COLUMN gclid TEXT;"
--
-- Para qué: la importación offline de Google Ads admite 90 días de ventana, contra los 7 de la
-- CAPI de Meta (src/lib/capi.ts:107-113). Una venta registrada tarde no llega a Meta pero sí a
-- Google, y esta columna es lo que la hace atribuible.
CREATE INDEX IF NOT EXISTS idx_ventas_gclid ON ventas(gclid) WHERE gclid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ventas_created ON ventas(created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_status  ON ventas(status);
