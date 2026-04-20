import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommonWorkoutsService } from './common-workouts.service';
import { StartCommonWorkoutDto } from './dto/start-common-workout.dto';
import { UpdateCommonWorkoutDto } from './dto/update-common-workout.dto';
import { AddCommonWorkoutExerciseDto } from './dto/add-common-workout-exercise.dto';
import { ChangeCommonWorkoutExercisePositionDto } from './dto/change-common-workout-exercise-position.dto';
import { ChangeCommonWorkoutExerciseDto } from './dto/change-common-workout-exercise.dto';
import { UpdateCommonWorkoutSetDto } from './dto/update-common-workout-set.dto';
import { ConfirmCommonWorkoutSetDto } from './dto/confirm-common-workout-set.dto';
import { GetWorkoutDashboardStatsDto } from './dto/get-workout-dashboard-stats.dto';

@ApiTags('workouts')
@ApiBearerAuth()
@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class CommonWorkoutsController {
  constructor(private readonly commonWorkoutsService: CommonWorkoutsService) {}

  @Post('start')
  @ApiOperation({
    summary: 'Start workout',
    description:
      'Uruchamia workout w trybie solo albo grupowym. Gdy `participantUserIds` jest puste, powstaje workout solo.',
  })
  @ApiBody({ type: StartCommonWorkoutDto })
  async start(@Request() req, @Body() dto: StartCommonWorkoutDto) {
    return this.commonWorkoutsService.start(req.user.id, dto);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active workout',
    description: 'Zwraca aktualnie aktywny workout usera albo `null`.',
  })
  async getActive(@Request() req) {
    return this.commonWorkoutsService.getActive(req.user.id);
  }

  @Get('dashboard/stats')
  @ApiOperation({
    summary: 'Get workout dashboard stats',
    description:
      'Zwraca statystyki dashboardu dla wskazanego zakresu dat: ulubione cwiczenie, rekord, ulubiony dzien, liczbe treningow i ulubionego partnera.',
  })
  @ApiQuery({ name: 'dateFrom', type: String, required: true, example: '2026-04-01' })
  @ApiQuery({ name: 'dateTo', type: String, required: true, example: '2026-04-30' })
  async getDashboardStats(@Request() req, @Query() dto: GetWorkoutDashboardStatsDto) {
    return this.commonWorkoutsService.getDashboardStatsForUser(req.user.id, dto);
  }

  @Get('exercises/:exerciseId/history')
  @ApiOperation({
    summary: 'Get exercise history',
    description:
      'Zwraca historie serii usera dla konkretnego cwiczenia wraz z data i nazwa workoutu.',
  })
  @ApiParam({
    name: 'exerciseId',
    type: Number,
    description: 'ID cwiczenia, dla ktorego ma zostac zwrocona historia.',
  })
  async getExerciseHistory(
    @Request() req,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.commonWorkoutsService.getExerciseHistoryForUser(req.user.id, exerciseId);
  }

  @Get(':id/summary')
  @ApiOperation({
    summary: 'Get workout summary',
    description:
      'Zwraca lekki summary workoutu. Dziala dla aktywnego workoutu i dla historycznego wpisu.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID workoutu albo wpisu historycznego.' })
  async findSummary(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.commonWorkoutsService.getSummaryForUser(req.user.id, id);
  }

  @Get(':id/exercises/:exerciseId')
  @ApiOperation({
    summary: 'Get workout exercise details',
    description:
      'Zwraca szczegoly pojedynczego cwiczenia wraz z seriami wszystkich uczestnikow w danym workout.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' })
  @ApiParam({
    name: 'exerciseId',
    type: Number,
    description: 'ID cwiczenia wewnatrz workoutu.',
  })
  async findExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.commonWorkoutsService.getExerciseByIdForUser(req.user.id, id, exerciseId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get workout',
    description:
      'Zwraca aktywny workout z uczestnikami, cwiczeniami i seriami. Payload dziala dla solo i grupy.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.commonWorkoutsService.getByIdForUser(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update workout',
    description: 'Aktualizuje metadane workoutu, np. nazwe.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' })
  @ApiBody({ type: UpdateCommonWorkoutDto })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommonWorkoutDto,
  ) {
    return this.commonWorkoutsService.updateCommonWorkout(req.user.id, id, dto);
  }

  @Post(':id/exercises')
  @ApiOperation({
    summary: 'Add exercise to workout',
    description: 'Dodaje nowe cwiczenie do aktywnego workoutu.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' })
  @ApiBody({ type: AddCommonWorkoutExerciseDto })
  async addExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddCommonWorkoutExerciseDto,
  ) {
    return this.commonWorkoutsService.addExercise(req.user.id, id, dto);
  }

  @Patch(':id/exercises/:exerciseId/position')
  @ApiOperation({
    summary: 'Change workout exercise position',
    description: 'Zmienia kolejnosc cwiczenia w aktywnym workoucie.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' })
  @ApiParam({
    name: 'exerciseId',
    type: Number,
    description: 'ID cwiczenia wewnatrz workoutu.',
  })
  @ApiBody({ type: ChangeCommonWorkoutExercisePositionDto })
  async changeExercisePosition(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() dto: ChangeCommonWorkoutExercisePositionDto,
  ) {
    return this.commonWorkoutsService.changeExercisePosition(
      req.user.id,
      id,
      exerciseId,
      dto,
    );
  }

  @Patch(':id/exercises/:exerciseId/exercise')
  @ApiOperation({
    summary: 'Replace workout exercise',
    description: 'Podmienia cwiczenie na inne, zachowujac miejsce w workoucie.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' })
  @ApiParam({
    name: 'exerciseId',
    type: Number,
    description: 'ID cwiczenia wewnatrz workoutu.',
  })
  @ApiBody({ type: ChangeCommonWorkoutExerciseDto })
  async changeExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() dto: ChangeCommonWorkoutExerciseDto,
  ) {
    return this.commonWorkoutsService.changeExercise(req.user.id, id, exerciseId, dto);
  }

  @Delete(':id/exercises/:exerciseId')
  @ApiOperation({
    summary: 'Remove workout exercise',
    description: 'Usuwa cwiczenie z aktywnego workoutu.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' })
  @ApiParam({
    name: 'exerciseId',
    type: Number,
    description: 'ID cwiczenia wewnatrz workoutu.',
  })
  async removeExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.commonWorkoutsService.removeExercise(req.user.id, id, exerciseId);
  }

  @Post('exercises/:exerciseId/add-set')
  @ApiOperation({
    summary: 'Add set to workout exercise',
    description: 'Dodaje kolejna serie do cwiczenia w aktywnym workoucie.',
  })
  @ApiParam({
    name: 'exerciseId',
    type: Number,
    description: 'ID cwiczenia wewnatrz workoutu.',
  })
  async addSet(
    @Request() req,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.commonWorkoutsService.addSet(req.user.id, exerciseId);
  }

  @Delete('sets/:setId')
  @ApiOperation({
    summary: 'Remove workout set',
    description: 'Usuwa serie z workoutu i przelicza numeracje pozostalych serii.',
  })
  @ApiParam({ name: 'setId', type: Number, description: 'ID serii w workoucie.' })
  async removeSet(@Request() req, @Param('setId', ParseIntPipe) setId: number) {
    return this.commonWorkoutsService.removeSet(req.user.id, setId);
  }

  @Patch('sets/:setId')
  @ApiOperation({
    summary: 'Update workout set draft',
    description: 'Aktualizuje robocze dane serii, np. wage lub liczbe powtorzen.',
  })
  @ApiParam({ name: 'setId', type: Number, description: 'ID serii w workoucie.' })
  @ApiBody({ type: UpdateCommonWorkoutSetDto })
  async updateSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: UpdateCommonWorkoutSetDto,
  ) {
    return this.commonWorkoutsService.updateSet(req.user.id, setId, dto);
  }

  @Patch('sets/:setId/confirm')
  @ApiOperation({
    summary: 'Confirm workout set',
    description: 'Potwierdza wykonanie serii i zapisuje finalne dane serii.',
  })
  @ApiParam({ name: 'setId', type: Number, description: 'ID serii w workoucie.' })
  @ApiBody({ type: ConfirmCommonWorkoutSetDto })
  async confirmSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: ConfirmCommonWorkoutSetDto,
  ) {
    return this.commonWorkoutsService.confirmSet(req.user.id, setId, dto);
  }

  @Post(':id/finish')
  @ApiOperation({
    summary: 'Finish workout',
    description:
      'Konczy workout i zapisuje wynik do historii indywidualnych treningow wszystkich uczestnikow.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' })
  async finish(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.commonWorkoutsService.finish(req.user.id, id);
  }
}
