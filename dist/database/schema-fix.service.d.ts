import { OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class SchemaFixService implements OnApplicationBootstrap {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onApplicationBootstrap(): Promise<void>;
    private ensureUserCardSchema;
}
