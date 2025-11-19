import prisma from '../../core/prisma';
import bcrypt from 'bcrypt';

export class AuthService {
  async register(email: string, password: string, firstName: string, lastName: string) {
    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Bu email zaten kayıtlı');
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return user;
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