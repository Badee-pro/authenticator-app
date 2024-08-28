/* eslint-disable prettier/prettier */
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';
import { CreateUserDto } from 'src/dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET;

  constructor(private readonly usersService: UsersService) {}

  async signup(createUserDto: CreateUserDto): Promise<{ token: string }> {
    const user = (await this.usersService.createUser(
      createUserDto,
    )) as UserDocument;
    const token = this.generateJwt(user);
    return { token };
  }

  generateJwt(user: UserDocument): string {
    const payload = { email: user.email, _id: user._id.toString() };
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = (await this.usersService.findUserByEmail(
      email.toLowerCase(),
    )) as UserDocument;
    if (!user) {
      throw new UnauthorizedException('Email is not registered');
    }

    if (user.loginAttempts >= 3) {
      throw new ForbiddenException(
        'Account locked. Please contact support at: Badeakhalboos@gmail.com.',
      );
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      await this.incrementLoginAttempts(user.email);
      const updatedUser = (await this.usersService.findUserByEmail(
        email.toLowerCase(),
      )) as UserDocument;
      if (updatedUser && updatedUser.loginAttempts > 3) {
        throw new ForbiddenException(
          'Please contact the admin at: Badeakhalboos@gmail.com.',
        );
      }
      throw new UnauthorizedException('Wrong password.');
    }

    await this.resetLoginAttempts(user.email);
    return user;
  }

  async login(user: UserDocument) {
    return {
      token: this.generateJwt(user),
    };
  }

  async incrementLoginAttempts(email: string): Promise<void> {
    await this.usersService.incrementLoginAttempts(email);
  }

  async resetLoginAttempts(email: string): Promise<void> {
    await this.usersService.resetLoginAttempts(email);
  }
}
