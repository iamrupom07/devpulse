import bcrypt from 'bcryptjs';
import { queryOne } from '../../utils/db.helpers';
import { signToken } from '../../utils/jwt';
import { User, PublicUser, SignupBody, LoginBody, LoginResult } from './auth.interface';

const SALT_ROUNDS = 10;

// ── Signup ────────────────────────────────────────────────────────────────────

export const signupUser = async (body: SignupBody): Promise<PublicUser> => {
  const { name, email, password, role = 'contributor' } = body;

  const existing = await queryOne<User>(
    'SELECT id FROM users WHERE email = $1',
    [email],
  );

  if (existing) {
    throw new Error('EMAIL_TAKEN');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await queryOne<PublicUser>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role],
  );

  return newUser!;
};

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginUser = async (body: LoginBody): Promise<LoginResult> => {
  const { email, password } = body;

  const user = await queryOne<User>(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = signToken({ id: user.id, name: user.name, role: user.role });

  const publicUser: PublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return { token, user: publicUser };
};
