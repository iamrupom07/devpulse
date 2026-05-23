import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendSuccess, sendError } from '../../utils/response';
import { signupUser, loginUser } from './auth.service';
import { SignupBody, LoginBody } from './auth.interface';

// ── POST /api/auth/signup ─────────────────────────────────────────────────────

export const signup = async (
  req: Request<object, object, SignupBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      sendError(res, StatusCodes.BAD_REQUEST, 'name, email, and password are required.');
      return;
    }

    if (role && !['contributor', 'maintainer'].includes(role)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'role must be contributor or maintainer.');
      return;
    }

    const newUser = await signupUser({ name, email, password, role });
    sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', newUser);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
      sendError(res, StatusCodes.BAD_REQUEST, 'An account with this email already exists.');
      return;
    }
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export const login = async (
  req: Request<object, object, LoginBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, StatusCodes.BAD_REQUEST, 'email and password are required.');
      return;
    }

    const result = await loginUser({ email, password });
    sendSuccess(res, StatusCodes.OK, 'Login successful', result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid email or password.');
      return;
    }
    next(err);
  }
};
