import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

type BackupTable = {
  schema: string;
  name: string;
  columns: string[];
  rowCount: number;
  rows: Record<string, unknown>[];
};

type BackupSequence = {
  schema: string;
  name: string;
  lastValue: string | number;
  isCalled: boolean;
};

type DatabaseBackup = {
  exportedAt?: string;
  tables?: BackupTable[];
  sequences?: BackupSequence[];
};

@Injectable()
export class DatabaseImportService {
  constructor(private readonly dataSource: DataSource) {}

  async importFromJson(backup: DatabaseBackup, importSecret?: string) {
    this.assertAuthorized(importSecret);
    this.assertValidBackup(backup);

    return this.dataSource.transaction(async (manager) => {
      const orderedTables = await this.getForeignKeyOrder(manager, backup.tables);
      const reverseTables = [...orderedTables].reverse();
      const result = {
        exportedAt: backup.exportedAt ?? null,
        tables: [] as { name: string; rows: number }[],
        totalRows: 0,
        sequences: 0,
      };

      for (const table of reverseTables) {
        await manager.query(
          `truncate table ${this.qualifiedName(table.schema, table.name)} cascade`,
        );
      }

      for (const table of orderedTables) {
        const importedRows = await this.insertTableRows(manager, table);
        result.tables.push({ name: table.name, rows: importedRows });
        result.totalRows += importedRows;
      }

      for (const sequence of backup.sequences ?? []) {
        await manager.query('select setval($1::regclass, $2, $3)', [
          `${sequence.schema}.${sequence.name}`,
          sequence.lastValue,
          sequence.isCalled,
        ]);
        result.sequences += 1;
      }

      return result;
    });
  }

  private assertAuthorized(importSecret?: string) {
    const expectedSecret = process.env.IMPORT_SECRET || process.env.JWT_SECRET;

    if (!expectedSecret || importSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid import secret');
    }
  }

  private assertValidBackup(backup: DatabaseBackup) {
    if (!backup || !Array.isArray(backup.tables)) {
      throw new BadRequestException('Invalid backup JSON: missing tables array');
    }

    for (const table of backup.tables) {
      if (
        !table.schema ||
        !table.name ||
        !Array.isArray(table.columns) ||
        !Array.isArray(table.rows)
      ) {
        throw new BadRequestException(`Invalid table backup: ${table?.name ?? 'unknown'}`);
      }
    }
  }

  private async insertTableRows(manager: EntityManager, table: BackupTable) {
    if (table.rows.length === 0) {
      return 0;
    }

    const batchSize = 250;
    const columnSql = table.columns.map((column) => this.quoteIdent(column)).join(', ');
    let importedRows = 0;

    for (let offset = 0; offset < table.rows.length; offset += batchSize) {
      const batch = table.rows.slice(offset, offset + batchSize);
      const values: unknown[] = [];
      const valueGroups = batch.map((row) => {
        const placeholders = table.columns.map((column) => {
          values.push(row[column]);
          return `$${values.length}`;
        });

        return `(${placeholders.join(', ')})`;
      });

      await manager.query(
        `insert into ${this.qualifiedName(table.schema, table.name)} (${columnSql}) values ${valueGroups.join(', ')}`,
        values,
      );
      importedRows += batch.length;
    }

    return importedRows;
  }

  private async getForeignKeyOrder(manager: EntityManager, tables: BackupTable[]) {
    const tableKeys = new Set(tables.map((table) => `${table.schema}.${table.name}`));
    const result = await manager.query(`
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

    const graph = new Map<string, Set<string>>();
    const indegree = new Map<string, number>();

    for (const table of tables) {
      const key = `${table.schema}.${table.name}`;
      graph.set(key, new Set());
      indegree.set(key, 0);
    }

    for (const row of result) {
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
    const ordered: BackupTable[] = [];

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
      const orderedKeys = new Set(
        ordered.map((table) => `${table.schema}.${table.name}`),
      );
      return ordered.concat(
        tables.filter((table) => !orderedKeys.has(`${table.schema}.${table.name}`)),
      );
    }

    return ordered;
  }

  private qualifiedName(schema: string, name: string) {
    return `${this.quoteIdent(schema)}.${this.quoteIdent(name)}`;
  }

  private quoteIdent(name: string) {
    return `"${String(name).replace(/"/g, '""')}"`;
  }
}
