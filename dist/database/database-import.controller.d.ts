import { DatabaseImportService } from './database-import.service';
export declare class DatabaseImportController {
    private readonly databaseImportService;
    constructor(databaseImportService: DatabaseImportService);
    importJson(body: unknown, importSecret?: string): Promise<{
        exportedAt: string;
        tables: {
            name: string;
            rows: number;
        }[];
        totalRows: number;
        sequences: number;
    }>;
}
