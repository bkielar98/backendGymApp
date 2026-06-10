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

  const inputArg = process.argv[2];
  if (!inputArg) {
    throw new Error('Usage: node scripts/import-db.js <export-file.json>');
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const exportDoc = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('begin');

    const orderedTables = await getForeignKeyOrder(client, exportDoc.tables);
    const reverseTables = [...orderedTables].reverse();

    for (const table of reverseTables) {
      await client.query(
        `truncate table ${quoteIdent(table.schema)}.${quoteIdent(table.name)} cascade`,
      );
    }

    for (const table of orderedTables) {
      if (!table.rows.length) {
        console.log(`${table.name}: skipped empty table`);
        continue;
      }

      const columnSql = table.columns.map(quoteIdent).join(', ');
      const valueSql = table.columns.map((_, index) => `$${index + 1}`).join(', ');
      const sql = `insert into ${quoteIdent(table.schema)}.${quoteIdent(
        table.name,
      )} (${columnSql}) values (${valueSql})`;

      for (const row of table.rows) {
        await client.query(
          sql,
          table.columns.map((column) => row[column]),
        );
      }

      console.log(`${table.name}: imported ${table.rows.length} rows`);
    }

    for (const sequence of exportDoc.sequences || []) {
      await client.query('select setval($1::regclass, $2, $3)', [
        `${sequence.schema}.${sequence.name}`,
        sequence.lastValue,
        sequence.isCalled,
      ]);
    }

    await client.query('commit');
    console.log(`\nImport completed from ${inputPath}`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
