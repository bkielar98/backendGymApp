const fs = require('fs');
const path = require('path');

function csvValue(value) {
  if (value === null || value === undefined) return '';

  let text;
  if (typeof value === 'object') {
    text = JSON.stringify(value);
  } else {
    text = String(value);
  }

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function safeFileName(name) {
  return String(name).replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function writeCsv(filePath, columns, rows) {
  const lines = [
    columns.map(csvValue).join(','),
    ...rows.map((row) => columns.map((column) => csvValue(row[column])).join(',')),
  ];

  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function main() {
  const inputArg = process.argv[2];
  const outputArg = process.argv[3] || 'supabase-csv-import';

  if (!inputArg) {
    throw new Error('Usage: node scripts/json-backup-to-csv.js <backup.json> [output-dir]');
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const outputDir = path.resolve(process.cwd(), outputArg);
  const backup = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const preferredOrder = [
    'gym',
    'user',
    'exercise',
    'friendship',
    'muscle_status',
    'user_body_measurement_entry',
    'user_weight_entry',
    'workout_template',
    'common_workout',
    'common_workout_block',
    'common_workout_participant',
    'common_workout_exercise',
    'common_workout_participant_set',
    'workout',
    'user_exercise_personal_best',
    'workout_exercise',
    'workout_set',
    'workout_template_exercise',
    'workout_template_member',
  ];
  const orderIndex = new Map(preferredOrder.map((name, index) => [name, index]));
  const tables = [...backup.tables].sort((a, b) => {
    const left = orderIndex.has(a.name) ? orderIndex.get(a.name) : Number.MAX_SAFE_INTEGER;
    const right = orderIndex.has(b.name) ? orderIndex.get(b.name) : Number.MAX_SAFE_INTEGER;
    return left - right || a.name.localeCompare(b.name);
  });

  fs.mkdirSync(outputDir, { recursive: true });

  const manifest = {
    source: inputPath,
    exportedAt: backup.exportedAt,
    createdAt: new Date().toISOString(),
    note: 'Import CSV files into Supabase table by table. Use importOrder for fewer foreign-key issues.',
    importOrder: tables.map((table) => table.name),
    tables: [],
    sequences: backup.sequences || [],
  };

  for (const table of tables) {
    const fileName = `${String(manifest.tables.length + 1).padStart(2, '0')}_${safeFileName(table.name)}.csv`;
    const filePath = path.join(outputDir, fileName);

    writeCsv(filePath, table.columns, table.rows);
    manifest.tables.push({
      schema: table.schema,
      name: table.name,
      file: fileName,
      columns: table.columns,
      rowCount: table.rowCount,
    });

    console.log(`${table.name}: ${table.rowCount} rows -> ${fileName}`);
  }

  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );

  fs.writeFileSync(
    path.join(outputDir, 'README.txt'),
    [
      'Supabase CSV import',
      '',
      `Backup exported at: ${backup.exportedAt}`,
      '',
      'Import files in this order:',
      ...manifest.tables.map((table) => `- ${table.file} -> public.${table.name} (${table.rowCount} rows)`),
      '',
      'After CSV import, update sequences if needed using values from manifest.json -> sequences.',
      '',
    ].join('\n'),
    'utf8',
  );

  console.log(`\nCSV files saved to ${outputDir}`);
}

main();
