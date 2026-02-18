/**
 * Authentication Middleware
 * Validates JWT tokens from Supabase Auth headers
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifySupabaseToken } from '../supabase';
import { AuthContext, ApiResponse } from '../types';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Middleware to authenticate requests
 * Must be called before protected endpoints
 */
export async function authMiddleware(req: VercelRequest): Promise<AuthContext | null> {
  const token = extractToken(req);

  if (!token) {
    return null;
  }

  try {
    const user = await verifySupabaseToken(token);
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || '',
      isValid: true,
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return null;
  }
}

/**
 * Utility to send authentication error response
 */
export function sendAuthError(res: VercelResponse, message = 'Unauthorized'): void {
  const response: ApiResponse = {
    status: 'error',
    error: {
      code: 'AUTH_FAILED',
      message,
    },
  };
  res.status(401).json(response);
}

/**
 * Utility to send permission error response
 */
export function sendPermissionError(res: VercelResponse, message = 'Permission denied'): void {
  const response: ApiResponse = {
    status: 'error',
    error: {
      code: 'PERMISSION_DENIED',
      message,
    },
  };
  res.status(403).json(response);
}

/**
 * Utility to send validation error response
 */
export function sendValidationError(res: VercelResponse, message = 'Invalid request'): void {
  const response: ApiResponse = {
    status: 'error',
    error: {
      code: 'VALIDATION_ERROR',
      message,
    },
  };
  res.status(400).json(response);
}
