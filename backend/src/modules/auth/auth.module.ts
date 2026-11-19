import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DirectorGuard } from './guards/director.guard';
import { FinanceGuard } from './guards/finance.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PresidenciaGuard } from './guards/presidencia.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return {
          secret,
          signOptions: { expiresIn: '8h' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    PresidenciaGuard,
    DirectorGuard,
    FinanceGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    PresidenciaGuard,
    DirectorGuard,
    FinanceGuard,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
