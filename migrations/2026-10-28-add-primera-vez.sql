-- 2026-10-28 · D26: «¿Es la primera vez que pide el cliente?» en /registro-de-compras.
-- Valores: 'si' | 'no' | NULL (pestaña vieja o compra anterior a la pregunta).
-- En SQLite ADD COLUMN es metadatos: no reescribe filas. Correr una sola vez y ANTES de desplegar
-- el nuevo código (el INSERT nombra la columna; sin ella, D1 rechaza la venta):
--   npx wrangler d1 execute temaky-ventas --remote --file=./migrations/2026-10-28-add-primera-vez.sql
ALTER TABLE ventas ADD COLUMN primera_vez TEXT;
