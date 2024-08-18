/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User &
  Document & {
    _id: Types.ObjectId;
    verifyPassword(password: string): Promise<boolean>;
  };

@Schema()
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 0 })
  loginAttempts: number;
}

// Create the schema for the User model
export const UserSchema = SchemaFactory.createForClass(User);

// Add the verifyPassword method to the UserSchema
UserSchema.methods.verifyPassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};
