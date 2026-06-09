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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateFriendRequestDto } from "./dto/create-friend-request.dto";
import { FriendsService } from "./friends.service";

@ApiTags("friends")
@ApiBearerAuth()
@Controller("friends")
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiResponse({ status: 200, description: "Friends retrieved" })
  async findAll(@Request() req) {
    return this.friendsService.listFriends(req.user.id);
  }

  @Get("requests/incoming")
  @ApiResponse({
    status: 200,
    description: "Incoming friend requests retrieved",
  })
  async findIncoming(@Request() req) {
    return this.friendsService.listIncomingRequests(req.user.id);
  }

  @Get("requests/outgoing")
  @ApiResponse({
    status: 200,
    description: "Outgoing friend requests retrieved",
  })
  async findOutgoing(@Request() req) {
    return this.friendsService.listOutgoingRequests(req.user.id);
  }

  @Get(":friendUserId/profile")
  @ApiOperation({ summary: "Get friend profile preview" })
  @ApiParam({ name: "friendUserId", type: Number })
  @ApiResponse({ status: 200, description: "Friend profile preview retrieved" })
  async getFriendProfile(
    @Request() req,
    @Param("friendUserId", ParseIntPipe) friendUserId: number,
  ) {
    return this.friendsService.getFriendProfile(req.user.id, friendUserId);
  }

  @Get(":friendUserId/workouts")
  @ApiOperation({ summary: "Get friend workout history" })
  @ApiParam({ name: "friendUserId", type: Number })
  @ApiQuery({ name: "page", type: Number, required: false })
  @ApiQuery({ name: "limit", type: Number, required: false })
  @ApiResponse({ status: 200, description: "Friend workout history retrieved" })
  async getFriendWorkoutHistory(
    @Request() req,
    @Param("friendUserId", ParseIntPipe) friendUserId: number,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.friendsService.getFriendWorkoutHistory(
      req.user.id,
      friendUserId,
      Number(page),
      Number(limit),
    );
  }

  @Get(":friendUserId/workouts/:workoutId")
  @ApiOperation({ summary: "Get friend historical workout details" })
  @ApiParam({ name: "friendUserId", type: Number })
  @ApiParam({ name: "workoutId", type: Number })
  @ApiResponse({
    status: 200,
    description: "Friend historical workout retrieved",
  })
  async getFriendWorkout(
    @Request() req,
    @Param("friendUserId", ParseIntPipe) friendUserId: number,
    @Param("workoutId", ParseIntPipe) workoutId: number,
  ) {
    return this.friendsService.getFriendWorkout(
      req.user.id,
      friendUserId,
      workoutId,
    );
  }

  @Get(":friendUserId/workouts/:workoutId/blocks/:blockId")
  @ApiOperation({ summary: "Get friend active workout block details" })
  @ApiParam({ name: "friendUserId", type: Number })
  @ApiParam({ name: "workoutId", type: Number })
  @ApiParam({ name: "blockId", type: Number })
  @ApiResponse({
    status: 200,
    description: "Friend active workout block retrieved",
  })
  async getFriendWorkoutBlock(
    @Request() req,
    @Param("friendUserId", ParseIntPipe) friendUserId: number,
    @Param("workoutId", ParseIntPipe) workoutId: number,
    @Param("blockId", ParseIntPipe) blockId: number,
  ) {
    return this.friendsService.getFriendWorkoutBlock(
      req.user.id,
      friendUserId,
      workoutId,
      blockId,
    );
  }

  @Post("requests")
  @ApiResponse({ status: 201, description: "Friend request created" })
  async createRequest(@Request() req, @Body() dto: CreateFriendRequestDto) {
    return this.friendsService.createRequest(req.user.id, dto);
  }

  @Patch("requests/:id/accept")
  @ApiResponse({ status: 200, description: "Friend request accepted" })
  async acceptRequest(@Request() req, @Param("id", ParseIntPipe) id: number) {
    return this.friendsService.acceptRequest(req.user.id, id);
  }

  @Patch("requests/:id/reject")
  @ApiResponse({ status: 200, description: "Friend request rejected" })
  async rejectRequest(@Request() req, @Param("id", ParseIntPipe) id: number) {
    return this.friendsService.rejectRequest(req.user.id, id);
  }

  @Patch("requests/:id/cancel")
  @ApiResponse({ status: 200, description: "Friend request canceled" })
  async cancelRequest(@Request() req, @Param("id", ParseIntPipe) id: number) {
    return this.friendsService.cancelRequest(req.user.id, id);
  }

  @Delete(":friendUserId")
  @ApiResponse({ status: 200, description: "Friend removed" })
  async removeFriend(
    @Request() req,
    @Param("friendUserId", ParseIntPipe) friendUserId: number,
  ) {
    return this.friendsService.removeFriend(req.user.id, friendUserId);
  }
}
