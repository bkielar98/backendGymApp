import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpdateUserProfileDto {
  @ApiProperty({ example: "Updated Name", required: false })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: "male", required: false })
  @IsOptional()
  @IsString()
  @IsIn(["male", "female"])
  gender?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  hideActiveWorkout?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  hideWorkoutHistory?: boolean;
}
