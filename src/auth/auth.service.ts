import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await compare(pass, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role?.name };
    return Promise.resolve({
      data: {
        accessToken: this.jwtService.sign(payload),
        user,
      },
    });
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await hash(registerDto.password, 10);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userData } = registerDto;

    // Default role assignment logic should be here or in DB
    // For now assuming roleId 2 is Customer (based on seed)
    // Ideally we should fetch role by name

    // We need to fetch the customer role first.
    // Since we don't have a roles service yet, we might need to add finding role to UsersService or just hardcode for MVP if we know the ID (but we don't know UUID/ID for sure if auto-inc).
    // The seed said Role ID is Int auto-increment.
    // Let's assume Role 2 is Customer for now, or fetch it.
    // Updated UsersService to include role relation, so we can might need to add a method to find role by name in UsersService or a new RolesService.
    // For simplicity, let's just pass a hardcoded ID for now or handle it in UsersService.
    // Actually, distinct RolesService is better. But I'll put it in UsersService for now.

    // Wait, the User create input needs a roleId.
    // I'll assume standard seeding: 1=Admin, 2=Customer.

    const user = await this.usersService.create({
      ...userData,
      passwordHash: hashedPassword,
      role: { connect: { name: 'customer' } }, // Connect by unique name is safer
    });

    return this.login(user);
  }
}
