import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DatabaseImportService } from './database-import.service';

@ApiTags('database')
@Controller('database')
export class DatabaseImportController {
  constructor(private readonly databaseImportService: DatabaseImportService) {}

  @Post('import-json')
  @ApiOperation({ summary: 'Import database backup JSON into the current database' })
  importJson(
    @Body() body: unknown,
    @Headers('x-import-secret') importSecret?: string,
  ) {
    return this.databaseImportService.importFromJson(body as never, importSecret);
  }
}
