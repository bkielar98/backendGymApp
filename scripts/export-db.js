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

async function main() {
  loadEnv(path.resolve(process.cwd(), '.env'));

  const outputArg = process.argv[2];
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.resolve(
    process.cwd(),
    outputArg || `db-export-${stamp}.json`,
  );

  const pool = getPool();
  const client = await pool.connect();

  try {
    const tablesResult = await client.query(`
      select table_schema, table_name
      from information_schema.tables
      where table_type = 'BASE TABLE'
        and table_schema = 'public'
      order by table_name
    `);

    const exportDoc = {
      exportedAt: new Date().toISOString(),
      source: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_DATABASE,
        schema: 'public',
      },
      tables: [],
      sequences: [],
    };

    for (const table of tablesResult.rows) {
      const columnsResult = await client.query(
        `
          select column_name
          from information_schema.columns
          where table_schema = $1 and table_name = $2
          order by ordinal_position
        `,
        [table.table_schema, table.table_name],
      );

      const columns = columnsResult.rows.map((row) => row.column_name);
      const rowsResult = await client.query(
        `select ${columns.map(quoteIdent).join(', ')}
         from ${quoteIdent(table.table_schema)}.${quoteIdent(table.table_name)}`,
      );

      exportDoc.tables.push({
        schema: table.table_schema,
        name: table.table_name,
        columns,
        rowCount: rowsResult.rowCount,
        rows: rowsResult.rows,
      });

      console.log(`${table.table_name}: ${rowsResult.rowCount} rows`);
    }

    const sequencesResult = await client.query(`
      select sequence_schema, sequence_name
      from information_schema.sequences
      where sequence_schema = 'public'
      order by sequence_name
    `);

    for (const sequence of sequencesResult.rows) {
      const qualifiedName = `${quoteIdent(sequence.sequence_schema)}.${quoteIdent(
        sequence.sequence_name,
      )}`;
      const valueResult = await client.query(
        `select last_value, is_called from ${qualifiedName}`,
      );

      exportDoc.sequences.push({
        schema: sequence.sequence_schema,
        name: sequence.sequence_name,
        lastValue: valueResult.rows[0].last_value,
        isCalled: valueResult.rows[0].is_called,
      });
    }

    fs.writeFileSync(outputPath, JSON.stringify(exportDoc, null, 2));
    console.log(`\nExport saved to ${outputPath}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
