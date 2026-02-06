import { BadRequestException, Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";

type LoginBody = {
  username?: string;
  password?: string;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginBody): Promise<{ accessToken: string }> {
    const username = body.username?.trim();
    const password = body.password ?? "";

    if (!username || !password) {
      throw new BadRequestException("username e password são obrigatórios");
    }

    const token = await this.authService.login(username, password);
    return { accessToken: token };
  }
}

