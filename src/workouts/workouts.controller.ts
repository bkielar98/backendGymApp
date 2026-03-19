import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { LogSetDto } from './dto/log-set.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Post('log-set')
  logSet(@Request() req, @Body() logSetDto: LogSetDto) {
    return this.workoutsService.logSet(req.user.id, logSetDto);
  }
}