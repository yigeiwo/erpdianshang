import { registerAs } from '@nestjs/config';
import { randomBytes } from 'crypto';

const generateSecureSecret = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const bytes = randomBytes(length);
  return Array.from(bytes, byte => chars[byte % chars.length]).join('');
};

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!secret || !refreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set in production');
    }
  }

  return {
    secret: secret || generateSecureSecret(32),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: refreshSecret || generateSecureSecret(32),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
});
