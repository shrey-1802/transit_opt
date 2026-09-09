import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prismaClient.js';
import { ENV } from '../config/env.js';

export const authService = {
  async login(email: string, password?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const err = new Error('Invalid email or password.');
      (err as any).status = 401;
      (err as any).code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (password && user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        const err = new Error('Invalid email or password.');
        (err as any).status = 401;
        (err as any).code = 'INVALID_CREDENTIALS';
        throw err;
      }
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatarUrl: user.avatarUrl,
      },
    };
  },

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      const err = new Error('User not found.');
      (err as any).status = 404;
      throw err;
    }

    return user;
  },
};
