"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseImportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DatabaseImportService = class DatabaseImportService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async importFromJson(backup, importSecret) {
        this.assertAuthorized(importSecret);
        this.assertValidBackup(backup);
        return this.dataSource.transaction(async (manager) => {
            const orderedTables = await this.getForeignKeyOrder(manager, backup.tables);
            const reverseTables = [...orderedTables].reverse();
            const result = {
                exportedAt: backup.exportedAt ?? null,
                tables: [],
                totalRows: 0,
                sequences: 0,
            };
            for (const table of reverseTables) {
                await manager.query(`truncate table ${this.qualifiedName(table.schema, table.name)} cascade`);
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
    assertAuthorized(importSecret) {
        const expectedSecret = process.env.IMPORT_SECRET || process.env.JWT_SECRET;
        if (!expectedSecret || importSecret !== expectedSecret) {
            throw new common_1.UnauthorizedException('Invalid import secret');
        }
    }
    assertValidBackup(backup) {
        if (!backup || !Array.isArray(backup.tables)) {
            throw new common_1.BadRequestException('Invalid backup JSON: missing tables array');
        }
        for (const table of backup.tables) {
            if (!table.schema ||
                !table.name ||
                !Array.isArray(table.columns) ||
                !Array.isArray(table.rows)) {
                throw new common_1.BadRequestException(`Invalid table backup: ${table?.name ?? 'unknown'}`);
            }
        }
    }
    async insertTableRows(manager, table) {
        if (table.rows.length === 0) {
            return 0;
        }
        const batchSize = 250;
        const columnSql = table.columns.map((column) => this.quoteIdent(column)).join(', ');
        let importedRows = 0;
        for (let offset = 0; offset < table.rows.length; offset += batchSize) {
            const batch = table.rows.slice(offset, offset + batchSize);
            const values = [];
            const valueGroups = batch.map((row) => {
                const placeholders = table.columns.map((column) => {
                    values.push(row[column]);
                    return `$${values.length}`;
                });
                return `(${placeholders.join(', ')})`;
            });
            await manager.query(`insert into ${this.qualifiedName(table.schema, table.name)} (${columnSql}) values ${valueGroups.join(', ')}`, values);
            importedRows += batch.length;
        }
        return importedRows;
    }
    async getForeignKeyOrder(manager, tables) {
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
        const graph = new Map();
        const indegree = new Map();
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
    qualifiedName(schema, name) {
        return `${this.quoteIdent(schema)}.${this.quoteIdent(name)}`;
    }
    quoteIdent(name) {
        return `"${String(name).replace(/"/g, '""')}"`;
    }
};
exports.DatabaseImportService = DatabaseImportService;
exports.DatabaseImportService = DatabaseImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatabaseImportService);
//# sourceMappingURL=database-import.service.js.map