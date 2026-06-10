import { DataSource } from 'typeorm';
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
export declare class DatabaseImportService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    importFromJson(backup: DatabaseBackup, importSecret?: string): Promise<{
        exportedAt: string;
        tables: {
            name: string;
            rows: number;
        }[];
        totalRows: number;
        sequences: number;
    }>;
    private assertAuthorized;
    private assertValidBackup;
    private insertTableRows;
    private getForeignKeyOrder;
    private qualifiedName;
    private quoteIdent;
}
export {};
