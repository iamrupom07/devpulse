// ── User ─────────────────────────────────────────────────────────────────────

export type UserRole = 'contributor' | 'maintainer';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<User, 'password'>;

// ── JWT Payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: number;
  name: string;
  role: UserRole;
}

// ── Request Bodies ───────────────────────────────────────────────────────────

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginBody {
  email: string;
  password: string;
}

// ── Auth Service Return Types ────────────────────────────────────────────────

export interface LoginResult {
  token: string;
  user: PublicUser;
}

// ── Express augmentation ─────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
