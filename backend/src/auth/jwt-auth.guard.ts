import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";

import { verifyAccessToken, type JwtPayload } from "./jwt";

export type RequestWithUser = Request & { user?: JwtPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = req.headers.authorization ?? "";
    const [kind, token] = authHeader.split(" ");
    if (kind !== "Bearer" || !token) {
      throw new UnauthorizedException("token ausente");
    }

    try {
      req.user = verifyAccessToken(token);
      return true;
    } catch {
      throw new UnauthorizedException("token inválido");
    }
  }
}

