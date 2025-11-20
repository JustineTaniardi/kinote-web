/**
 * Token utilities for email verification
 */

import { randomBytes } from 'crypto';

/**
 * Generate a random verification token
 */
export const generateVerificationToken = (): string => {
  return randomBytes(32).toString('hex');
};

/**
 * Generate a verification link
 */
export const generateVerificationLink = (token: string): string => {
  const baseUrl = process.env.APP_URL || 'http://localhost:3001';
  return `${baseUrl}/api/auth/verify?token=${token}`;
};

/**
 * Get token expiration time (24 hours from now)
 */
export const getTokenExpirationTime = (): Date => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  return expiresAt;
};
