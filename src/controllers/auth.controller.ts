import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SignupSchema, LoginSchema } from '../validators/auth.validator';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = SignupSchema.parse(req.body);
      const result = await authService.signup(data);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        res.status(400).json({ errors: (error as any).errors });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = LoginSchema.parse(req.body);
      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        res.status(400).json({ errors: (error as any).errors });
        return;
      }
      next(error);
    }
  }
}
