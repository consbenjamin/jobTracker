-- En PostgreSQL, por defecto un UNIQUE permite varias filas con NULL en una columna.
-- Eso hacía que el upsert de vacantes globales (userId = null) fallara o no encontrara
-- una única fila. NULLS NOT DISTINCT hace que (source, externalId, null) sea único.

-- Eliminar duplicados (quedarse con una fila por source, externalId, userId)
DELETE FROM "JobListing"
WHERE id NOT IN (
  SELECT MIN(id) FROM "JobListing"
  GROUP BY "source", "externalId", COALESCE("userId", '')
);

DROP INDEX IF EXISTS "JobListing_source_externalId_userId_key";
CREATE UNIQUE INDEX "JobListing_source_externalId_userId_key" ON "JobListing"("source", "externalId", "userId") NULLS NOT DISTINCT;
