/* eslint-disable prettier/prettier */

declare module 'express' {
  interface Request {
    userId?: string;
  }
}
