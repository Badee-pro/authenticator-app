/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly jwtSecret = process.env.JWT_SECRET || 'SECRET#123';

  use(req: any, res: any, next: () => void) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No token provided.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided.');
    }

    jwt.verify(token, this.jwtSecret, (err, decoded) => {
      if (err) {
        throw new UnauthorizedException('Token authentication failed.');
      } else {
        req.userId = decoded._id; // Use userId from the JWT payload
        next();
      }
    });
  }
}
