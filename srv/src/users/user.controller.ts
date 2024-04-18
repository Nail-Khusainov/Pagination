import { UserService } from './users.service';
import { Controller, Get, Logger, Query, ParseIntPipe } from '@nestjs/common';
import {UsersResponseDto} from "./users.response.dto";

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers() {
    this.logger.log('Get all users');
    const users = await this.userService.findAll();
    return users.map((user) => UsersResponseDto.fromUsersEntity(user));
  }

  @Get('page')
  async getUsersByPage(
    @Query('skip', ParseIntPipe) skip: number, // беру параметр skip из запроса и в число
    @Query('take', ParseIntPipe) take: number,
  ) {
    this.logger.log(`Get users by page: skip=${skip}, take=${take}`);
    const users = await this.userService.findRange(skip, take); 
    return users.map((user) => UsersResponseDto.fromUsersEntity(user));
  }
}


