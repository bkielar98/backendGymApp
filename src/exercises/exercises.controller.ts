import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('exercises')
@ApiBearerAuth()
@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Post()
  @ApiOperation({ summary: 'Create exercise' })
  @ApiResponse({ status: 201, description: 'Exercise created' })
  create(@Request() req, @Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(req.user, createExerciseDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all exercises' })
  @ApiResponse({ status: 200, description: 'Exercises retrieved' })
  findAll(@Request() req) {
    return this.exercisesService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Exercise retrieved' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.exercisesService.findOne(req.user, +id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exercise' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Exercise updated' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(req.user, +id, updateExerciseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exercise' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Exercise deleted' })
  remove(@Request() req, @Param('id') id: string) {
    return this.exercisesService.remove(req.user, +id);
  }
}
