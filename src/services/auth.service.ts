import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Role, User } from '../../generated/prisma';
import { AuthRepository } from '../repositories/auth.repository';
import { ApiError } from '../utils/api-error';
import { BusinessRepository } from '../repositories/business.repository';
import { LoginSchemaType, SignupSchemaType } from '../validators/auth.validator';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  throw new Error('JWT_SECRET is not defined');
})();

export class AuthService {
  private authRepo = new AuthRepository();
  private bizRepo = new BusinessRepository();

  async signup(data: SignupSchemaType): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const { email, password, name, role, businessName, avatarUrl } = data;

    const userExists = await this.authRepo.userExists(email);
    if (userExists) throw new ApiError('User already exists', 400);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.authRepo.createUser({
      email,
      password: hashedPassword,
      name: name || '',
      role,
      avatarUrl: avatarUrl || '',
    });

    let businessId: string | undefined;

    if (role === 'BUSINESS' && businessName) {
      const business = await this.bizRepo.createBusiness({
        name: businessName,
        slug: await this.slugify(businessName),
        ownerId: user.id,
        logo: avatarUrl || '',
      });

      businessId = business.id;
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId,
    });

    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
  }

  async login(data: LoginSchemaType): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const user = await this.authRepo.findUserByEmail(data.email);
    if (!user) throw new ApiError('Invalid credentials', 404);

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new ApiError('Invalid password', 401);

    let businessId: string | undefined = undefined;

    if (user.role === 'BUSINESS') {
      const business = await this.bizRepo.findBusinessByOwnerId(user.id);
      businessId = business?.id;
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId,
    });

    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
  }

  private generateToken(payload: {
    userId: string;
    email: string;
    role: Role;
    businessId?: string;
  }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  private async slugify(name: string): Promise<string> {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const exists = await this.bizRepo.slugExists(slug);
    if (exists) {
      slug += `-${Date.now().toString().slice(-6)}`;
    }

    return slug;
  }
}
