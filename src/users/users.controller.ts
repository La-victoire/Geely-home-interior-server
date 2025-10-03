import { 
  Body,
  Controller,
  Delete,
  Get,  
  HttpException,  
  HttpStatus,  
  Inject,  
  Logger,  
  Param,  
  Patch,  
  Post, 
  Req, 
  Res, 
  UseGuards, 
  UsePipes, 
  ValidationPipe
 } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import mongoose from 'mongoose';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { AuthUserDto } from './dto/AuthUser.dto';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import type { Request } from 'express';
import { Roles } from './strategies/roles.decorator';
import { ARCJET, tokenBucket } from '@arcjet/nest';
import type { ArcjetNest} from '@arcjet/nest';
import { setRateLimitHeaders } from '@arcjet/decorate';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private usersService: UsersService, @Inject(ARCJET) private readonly arcjet: ArcjetNest,) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userData = await this.usersService.createUser(createUserDto)
    const token = await this.usersService.logIn(userData)
    return {
      userData,
      token
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() authPayload:AuthUserDto) {
    const userData = await this.usersService.validateUser(authPayload)
    if (!userData) 
      throw new HttpException('Invalid credentials', 401)
    const token = await this.usersService.logIn(userData)
    return {
     userData,
     token
    }
  }

  @Get('status')
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  status(@Req() req:Request) {
    console.log('Inside AuthController Status Method');
    return req.user;
  }

  @Get()
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsers() {
    const users = await this.usersService.getUsers();
    if (!users[0])
      throw new HttpException('No Users Available', 404)
    else {
      return users
    }
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param("id") id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid ) 
      throw new HttpException('User not found', 404);
    const findUser = await this.usersService.getUserById(id);
    if (!findUser) throw new HttpException("User not found", 404);
    return findUser;
  }

  @Patch(":id")
  @UsePipes(new ValidationPipe())
  async updateUser(@Param("id") id:string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    
    const decision = await this.arcjet
      .withRule(
        tokenBucket({
          mode: 'LIVE', // will block requests. Use "DRY_RUN" to log only
          refillRate: 3, // refill 3 tokens per interval
          interval: 60, // refill every 60 seconds
          capacity: 10, // bucket maximum capacity of 10 tokens
        }),
      )
      .protect(req, { requested: 5 }); // request 5 tokens
    
    setRateLimitHeaders(res, decision);

    this.logger.log(`Arcjet: id = ${decision.id}`);
    this.logger.log(`Arcjet: decision = ${decision.conclusion}`);
     if (decision.ip.hasCountry() && decision.ip.country === 'JP') {
      return {
        message : "Konnichiwa"
      };
    }

    // Always deny requests from VPNs
    if (decision.ip.isVpn()) {
      throw new HttpException('VPNs are forbidden', HttpStatus.FORBIDDEN);
    }

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HttpException(
          'Too many requests',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
    } else if (decision.isErrored()) {
      // Fail open to prevent an Arcjet error from blocking all requests. You
      // may want to fail closed if this controller is very sensitive
      this.logger.error(`Arcjet error: ${decision.reason.message}`);
    }
    
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid ) 
      throw new HttpException('Invalid ID', 404);
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);
    if (!updatedUser) 
      throw new HttpException('User not found', 404)
    return updatedUser
  }

  @Delete(':id')
  async deleteUser(@Param("id") id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid ) 
      throw new HttpException('Invalid ID', 404);
    const deletedUser = await this.usersService.deleteUser(id);
    if (!deletedUser) 
      throw new HttpException('User does not exist in database', 404)
    return;
  }

  @Delete()
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteAllUsers() {
    const deletedUser = await this.usersService.deleteAllUsers();
    if (!deletedUser) 
      throw new HttpException('No users available', 404)
    return;
  }
}
