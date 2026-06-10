const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getPool() {
  return new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
}

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function qualifiedName(schema, name) {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

function quoteLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  if (Buffer.isBuffer(value)) return `E'\\\\x${value.toString('hex')}'`;
  if (value instanceof Date) return `'${value.toISOString().replace(/'/g, "''")}'`;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'bigint') return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function getForeignKeyOrder(client, tables) {
  const tableKeys = new Set(tables.map((table) => `${table.schema}.${table.name}`));
  const result = await client.query(`
    select
      ns.nspname as child_schema,
      child.relname as child_table,
      parent_ns.nspname as parent_schema,
      parent.relname as parent_table
    from pg_constraint c
    join pg_class child on child.oid = c.conrelid
    join pg_namespace ns on ns.oid = child.relnamespace
    join pg_class parent on parent.oid = c.confrelid
    join pg_namespace parent_ns on parent_ns.oid = parent.relnamespace
    where c.contype = 'f'
      and ns.nspname = 'public'
      and parent_ns.nspname = 'public'
  `);

  const graph = new Map();
  const indegree = new Map();

  for (const table of tables) {
    const key = `${table.schema}.${table.name}`;
    graph.set(key, new Set());
    indegree.set(key, 0);
  }

  for (const row of result.rows) {
    const childKey = `${row.child_schema}.${row.child_table}`;
    const parentKey = `${row.parent_schema}.${row.parent_table}`;
    if (!tableKeys.has(childKey) || !tableKeys.has(parentKey) || childKey === parentKey) {
      continue;
    }

    if (!graph.get(parentKey).has(childKey)) {
      graph.get(parentKey).add(childKey);
      indegree.set(childKey, indegree.get(childKey) + 1);
    }
  }

  const byKey = new Map(tables.map((table) => [`${table.schema}.${table.name}`, table]));
  const queue = [...indegree.entries()]
    .filter(([, degree]) => degree === 0)
    .map(([key]) => key)
    .sort();
  const ordered = [];

  while (queue.length > 0) {
    const key = queue.shift();
    ordered.push(byKey.get(key));

    for (const child of graph.get(key)) {
      indegree.set(child, indegree.get(child) - 1);
      if (indegree.get(child) === 0) {
        queue.push(child);
        queue.sort();
      }
    }
  }

  if (ordered.length !== tables.length) {
    const orderedKeys = new Set(ordered.map((table) => `${table.schema}.${table.name}`));
    return ordered.concat(tables.filter((table) => !orderedKeys.has(`${table.schema}.${table.name}`)));
  }

  return ordered;
}

async function main() {
  loadEnv(path.resolve(process.cwd(), '.env'));

  const outputArg = process.argv[2];
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.resolve(
    process.cwd(),
    outputArg || `db-backup-${stamp}.sql`,
  );

  const pool = getPool();
  const client = await pool.connect();

  try {
    const tableResult = await client.query(`
      select n.nspname as schema, c.relname as name
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'r'
        and n.nspname = 'public'
      order by c.relname
    `);
    const tables = tableResult.rows;
    const orderedTables = await getForeignKeyOrder(client, tables);

    const lines = [
      '-- PostgreSQL database backup',
      `-- Exported at: ${new Date().toISOString()}`,
      `-- Source: ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE}`,
      '',
      'BEGIN;',
      '',
      'CREATE SCHEMA IF NOT EXISTS "public";',
      '',
    ];

    const sequenceListResult = await client.query(`
      select
        sequence_schema as schema,
        sequence_name as name,
        data_type,
        start_value,
        minimum_value as min_value,
        maximum_value as max_value,
        increment as increment_by,
        cycle_option = 'YES' as cycle
      from information_schema.sequences
      where sequence_schema = 'public'
      order by sequence_name
    `);

    const sequenceRows = [];
    for (const sequence of sequenceListResult.rows) {
      const value = await client.query(
        `select last_value, is_called from ${qualifiedName(sequence.schema, sequence.name)}`,
      );
      sequenceRows.push({
        ...sequence,
        cache_size: '1',
        last_value: value.rows[0].last_value,
        is_called: value.rows[0].is_called,
      });
    }
    const sequenceResult = { rows: sequenceRows };

    for (const sequence of sequenceResult.rows) {
      const sequenceName = qualifiedName(sequence.schema, sequence.name);
      lines.push(
        `DROP SEQUENCE IF EXISTS ${sequenceName} CASCADE;`,
        `CREATE SEQUENCE ${sequenceName}`,
        `    AS ${sequence.data_type || 'bigint'}`,
        `    START WITH ${sequence.start_value || 1}`,
        `    INCREMENT BY ${sequence.increment_by || 1}`,
        `    MINVALUE ${sequence.min_value || 1}`,
        `    MAXVALUE ${sequence.max_value || 9223372036854775807}`,
        `    CACHE ${sequence.cache_size || 1}${sequence.cycle ? '\n    CYCLE' : ''};`,
        '',
      );
    }

    for (const table of tables) {
      const columnsResult = await client.query(
        `
          select
            a.attname as name,
            pg_catalog.format_type(a.atttypid, a.atttypmod) as type,
            a.attnotnull as not_null,
            pg_catalog.pg_get_expr(ad.adbin, ad.adrelid) as default_value
          from pg_attribute a
          join pg_class c on c.oid = a.attrelid
          join pg_namespace n on n.oid = c.relnamespace
          left join pg_attrdef ad on ad.adrelid = a.attrelid and ad.adnum = a.attnum
          where n.nspname = $1
            and c.relname = $2
            and a.attnum > 0
            and not a.attisdropped
          order by a.attnum
        `,
        [table.schema, table.name],
      );

      lines.push(`DROP TABLE IF EXISTS ${qualifiedName(table.schema, table.name)} CASCADE;`);
      lines.push(`CREATE TABLE ${qualifiedName(table.schema, table.name)} (`);
      lines.push(
        columnsResult.rows.map((column) => {
          const parts = [
            `    ${quoteIdent(column.name)}`,
            column.type,
            column.default_value ? `DEFAULT ${column.default_value}` : '',
            column.not_null ? 'NOT NULL' : '',
          ].filter(Boolean);
          return parts.join(' ');
        }).join(',\n'),
      );
      lines.push(');', '');
    }

    const ownedSequenceResult = await client.query(`
      select
        seq_ns.nspname as sequence_schema,
        seq.relname as sequence_name,
        tbl_ns.nspname as table_schema,
        tbl.relname as table_name,
        col.attname as column_name
      from pg_class seq
      join pg_namespace seq_ns on seq_ns.oid = seq.relnamespace
      join pg_depend dep on dep.objid = seq.oid and dep.deptype = 'a'
      join pg_class tbl on tbl.oid = dep.refobjid
      join pg_namespace tbl_ns on tbl_ns.oid = tbl.relnamespace
      join pg_attribute col on col.attrelid = tbl.oid and col.attnum = dep.refobjsubid
      where seq.relkind = 'S'
        and seq_ns.nspname = 'public'
      order by seq.relname
    `);

    for (const sequence of ownedSequenceResult.rows) {
      lines.push(
        `ALTER SEQUENCE ${qualifiedName(sequence.sequence_schema, sequence.sequence_name)} OWNED BY ${qualifiedName(sequence.table_schema, sequence.table_name)}.${quoteIdent(sequence.column_name)};`,
      );
    }
    if (ownedSequenceResult.rows.length) lines.push('');

    for (const table of orderedTables) {
      const columnsResult = await client.query(
        `
          select column_name
          from information_schema.columns
          where table_schema = $1 and table_name = $2
          order by ordinal_position
        `,
        [table.schema, table.name],
      );
      const columns = columnsResult.rows.map((row) => row.column_name);
      const rowsResult = await client.query(
        `select ${columns.map(quoteIdent).join(', ')}
         from ${qualifiedName(table.schema, table.name)}`,
      );

      if (!rowsResult.rows.length) {
        console.log(`${table.name}: 0 rows`);
        continue;
      }

      const columnSql = columns.map(quoteIdent).join(', ');
      for (const row of rowsResult.rows) {
        const values = columns.map((column) => quoteLiteral(row[column])).join(', ');
        lines.push(`INSERT INTO ${qualifiedName(table.schema, table.name)} (${columnSql}) VALUES (${values});`);
      }
      lines.push('');
      console.log(`${table.name}: ${rowsResult.rowCount} rows`);
    }

    const constraintResult = await client.query(`
      select
        n.nspname as schema,
        c.relname as table_name,
        con.conname as name,
        pg_catalog.pg_get_constraintdef(con.oid, true) as definition
      from pg_constraint con
      join pg_class c on c.oid = con.conrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and con.contype in ('p', 'u', 'f', 'c')
      order by case con.contype when 'p' then 1 when 'u' then 2 when 'c' then 3 else 4 end, c.relname, con.conname
    `);

    for (const constraint of constraintResult.rows) {
      lines.push(
        `ALTER TABLE ONLY ${qualifiedName(constraint.schema, constraint.table_name)} ADD CONSTRAINT ${quoteIdent(constraint.name)} ${constraint.definition};`,
      );
    }
    if (constraintResult.rows.length) lines.push('');

    const indexResult = await client.query(`
      select i.schemaname as schema, i.indexname as name, i.indexdef as definition
      from pg_indexes i
      join pg_class idx on idx.relname = i.indexname
      join pg_namespace n on n.oid = idx.relnamespace and n.nspname = i.schemaname
      left join pg_constraint con on con.conindid = idx.oid
      where i.schemaname = 'public'
        and con.oid is null
      order by i.indexname
    `);

    for (const index of indexResult.rows) {
      lines.push(`${index.definition};`);
    }
    if (indexResult.rows.length) lines.push('');

    for (const sequence of sequenceResult.rows) {
      lines.push(
        `SELECT pg_catalog.setval(${quoteLiteral(`${sequence.schema}.${sequence.name}`)}, ${quoteLiteral(sequence.last_value)}, ${quoteLiteral(sequence.is_called)});`,
      );
    }

    lines.push('', 'COMMIT;', '');
    fs.writeFileSync(outputPath, lines.join('\n'));
    console.log(`\nSQL export saved to ${outputPath}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
