import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { FriendsService } from './friends.service';

@ApiTags('friends')
@ApiBearerAuth()
@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Friends retrieved' })
  async findAll(@Request() req) {
    return this.friendsService.listFriends(req.user.id);
  }

  @Get('requests/incoming')
  @ApiResponse({ status: 200, description: 'Incoming friend requests retrieved' })
  async findIncoming(@Request() req) {
    return this.friendsService.listIncomingRequests(req.user.id);
  }

  @Get('requests/outgoing')
  @ApiResponse({ status: 200, description: 'Outgoing friend requests retrieved' })
  async findOutgoing(@Request() req) {
    return this.friendsService.listOutgoingRequests(req.user.id);
  }

  @Post('requests')
  @ApiResponse({ status: 201, description: 'Friend request created' })
  async createRequest(@Request() req, @Body() dto: CreateFriendRequestDto) {
    return this.friendsService.createRequest(req.user.id, dto);
  }

  @Patch('requests/:id/accept')
  @ApiResponse({ status: 200, description: 'Friend request accepted' })
  async acceptRequest(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.friendsService.acceptRequest(req.user.id, id);
  }

  @Patch('requests/:id/reject')
  @ApiResponse({ status: 200, description: 'Friend request rejected' })
  async rejectRequest(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.friendsService.rejectRequest(req.user.id, id);
  }

  @Patch('requests/:id/cancel')
  @ApiResponse({ status: 200, description: 'Friend request canceled' })
  async cancelRequest(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.friendsService.cancelRequest(req.user.id, id);
  }

  @Delete(':friendUserId')
  @ApiResponse({ status: 200, description: 'Friend removed' })
  async removeFriend(
    @Request() req,
    @Param('friendUserId', ParseIntPipe) friendUserId: number,
  ) {
    return this.friendsService.removeFriend(req.user.id, friendUserId);
  }
}
