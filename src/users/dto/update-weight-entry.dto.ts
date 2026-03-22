import { PartialType } from '@nestjs/swagger';
import { CreateWeightEntryDto } from './create-weight-entry.dto';

export class UpdateWeightEntryDto extends PartialType(CreateWeightEntryDto) {}
