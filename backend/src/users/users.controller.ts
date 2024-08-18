/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  HttpException,
  Req,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { AuthService } from '../auth/auth.service';

@Controller('api')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.createUser(createUserDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        // Handle other errors
        throw new HttpException(
          'Error registering user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const user = await this.authService.validateUser(
        loginUserDto.email,
        loginUserDto.password,
      );

      // Generate token using AuthService
      const token = this.authService.generateJwt(user);

      return { statusCode: HttpStatus.OK, message: 'Login successful', token };
    } catch (error) {
      // Pass the error message from AuthService if any
      throw new HttpException(
        error.message || 'Error logging in',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('userProfile')
  async getUserProfile(@Req() req: Request) {
    try {
      const user = await this.usersService.findUserById(req.userId);
      if (!user) {
        throw new HttpException('User record not found.', HttpStatus.NOT_FOUND);
      }
      return {
        status: true,
        user: {
          fullName: user.fullName,
          email: user.email,
        },
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
