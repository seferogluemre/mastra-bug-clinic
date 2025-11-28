import prisma from '../../core/prisma';
import bcrypt from 'bcrypt';
import { RegisterDto } from './types';

export class AuthService {
  async register(data: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Bu email zaten kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      createdAt: user.createdAt,
    };
  }

  async login(email: string, password: string) {
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Email veya şifre hatalı');
    }

    // Şifreyi kontrol et
    const isValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isValid) {
      throw new Error('Email veya şifre hatalı');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.firstName + ' ' + user.lastName,
    };
  }
}

export const authService = new AuthService();