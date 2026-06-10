import { Module } from '@nestjs/common';
import { DatabaseImportController } from './database-import.controller';
import { DatabaseImportService } from './database-import.service';

@Module({
  controllers: [DatabaseImportController],
  providers: [DatabaseImportService],
})
export class DatabaseImportModule {}
