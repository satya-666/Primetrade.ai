import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/authenticate';

const BCRYPT_ROUNDS = 10;

export async function register(req: AuthRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, message: 'Email already registered', errors: [{ field: 'email', message: 'Email already in use' }] });
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: 'user' },
  });

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } },
  });
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials', errors: [{ message: 'Invalid email or password' }] });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ success: false, message: 'Invalid credentials', errors: [{ message: 'Invalid email or password' }] });
    return;
  }

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.json({
    success: true,
    message: 'Login successful',
    data: { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } },
  });
}

export async function refresh(req: AuthRequest, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  try {
    const payload = verifyToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found', errors: [] });
      return;
    }

    const newPayload = { userId: user.id, role: user.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    res.json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token', errors: [] });
  }
}

export async function logout(_req: AuthRequest, res: Response): Promise<void> {
  res.json({ success: true, message: 'Logged out successfully', data: null });
}
