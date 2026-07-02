WITH cols AS (
  SELECT c.oid,
    string_agg(
      '  ' || a.attname || ' ' || pg_catalog.format_type(a.atttypid, a.atttypmod)
      || CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END
      || COALESCE(' DEFAULT ' || pg_catalog.pg_get_expr(ad.adbin, ad.adrelid), ''),
      E',\n' ORDER BY a.attnum
    ) AS body
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
  LEFT JOIN pg_catalog.pg_attrdef ad ON ad.adrelid = c.oid AND ad.adnum = a.attnum
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  GROUP BY c.oid
),
cons AS (
  SELECT c.conrelid AS oid,
    string_agg(
      '  CONSTRAINT ' || c.conname || ' ' || pg_catalog.pg_get_constraintdef(c.oid),
      E',\n' ORDER BY CASE c.contype WHEN 'p' THEN 0 WHEN 'u' THEN 1 WHEN 'f' THEN 2 WHEN 'c' THEN 3 ELSE 4 END, c.conname
    ) AS body
  FROM pg_catalog.pg_constraint c
  JOIN pg_catalog.pg_class t ON t.oid = c.conrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public' AND t.relkind = 'r'
  GROUP BY c.conrelid
)
SELECT string_agg(
  'CREATE TABLE public.' || cl.relname || E' (\n'
  || cols.body
  || COALESCE(E',\n' || cons.body, '')
  || E'\n);',
  E'\n\n' ORDER BY cl.relname
) AS schema_completo
FROM pg_catalog.pg_class cl
JOIN pg_catalog.pg_namespace n ON n.oid = cl.relnamespace
JOIN cols ON cols.oid = cl.oid
LEFT JOIN cons ON cons.oid = cl.oid
WHERE n.nspname = 'public' AND cl.relkind = 'r';
