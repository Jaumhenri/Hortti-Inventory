import { Injectable, UnauthorizedException } from "@nestjs/common";

import { DbService } from "../db/db.service";
import { signAccessToken } from "./jwt";
import { verifyPassword } from "./password";

type DbUser = {
  id: string;
  username: string;
  password_hash: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly db: DbService) {}

  private async findUserByUsername(username: string): Promise<DbUser | null> {
    const { rows } = await this.db.query<DbUser>(
      "SELECT id, username, password_hash FROM users WHERE username = $1",
      [username],
    );
    return rows[0] ?? null;
  }

  async login(username: string, password: string): Promise<string> {
    const user = await this.findUserByUsername(username);
    if (!user) throw new UnauthorizedException("credenciais inválidas");

    const ok = verifyPassword(password, user.password_hash);
    if (!ok) throw new UnauthorizedException("credenciais inválidas");

    return signAccessToken({ sub: user.id, username: user.username });
  }
}

