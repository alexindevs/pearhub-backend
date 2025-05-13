// src/repositories/auth.repository.ts
import { Role, User } from '../../generated/prisma';
import prisma from '../prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: Role;
    avatarUrl?: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async userExists(email: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    return !!user;
  }
}
