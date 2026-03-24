import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';

@ApiTags('exercises')
@ApiBearerAuth()
@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Post()
  @ApiOperation({ summary: 'Create exercise' })
  @ApiResponse({ status: 201, description: 'Exercise created' })
  async create(@Request() req, @Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(req.user, createExerciseDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all exercises' })
  @ApiResponse({ status: 200, description: 'Exercises retrieved' })
  async findAll(@Request() req) {
    return this.exercisesService.findAll(req.user);
  }

  @Get('custom')
  @ApiOperation({ summary: 'List custom exercises available for current user' })
  @ApiResponse({ status: 200, description: 'Custom exercises retrieved' })
  async findCustom(@Request() req) {
    return this.exercisesService.findCustom(req.user);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get exercise history by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Exercise history retrieved' })
  async findHistory(@Request() req, @Param('id') id: string) {
    return this.exercisesService.findHistory(req.user, +id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Exercise retrieved' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.exercisesService.findOne(req.user, +id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exercise' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Exercise updated' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(
      req.user,
      +id,
      updateExerciseDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exercise' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Exercise deleted' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.exercisesService.remove(req.user, +id);
  }
}
