/* eslint-disable prettier/prettier */
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from 'src/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create the user document with hashed password
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

      // Save the user document
      return await createdUser.save();
    } catch (error) {
      // Check for duplicate key error
      if (error.code === 11000) {
        // Duplicate email address found
        throw new ConflictException('Duplicate email address found.');
      }
      // Rethrow any other errors
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async findUserById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async incrementLoginAttempts(email: string): Promise<void> {
    await this.userModel
      .updateOne({ email }, { $inc: { loginAttempts: 1 } })
      .exec();
  }

  async resetLoginAttempts(email: string): Promise<void> {
    await this.userModel
      .updateOne({ email }, { $set: { loginAttempts: 0 } })
      .exec();
  }
}
