import { PartialType } from '@nestjs/swagger';
import { CreateBodyMeasurementEntryDto } from './create-body-measurement-entry.dto';

export class UpdateBodyMeasurementEntryDto extends PartialType(
  CreateBodyMeasurementEntryDto,
) {}
