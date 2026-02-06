import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import type { Express } from "express";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { getPublicBaseUrl } from "../http/public-url";
import { productImageMulterOptions } from "./multer";
import { ProductsService, type ProductCategory } from "./products.service";

type CreateBody = {
  name?: string;
  category?: ProductCategory;
  price?: string;
};

type UpdateBody = Partial<CreateBody>;

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(
    @Req() req: Request,
    @Query("q") q?: string,
    @Query("sort") sort?: "name" | "price",
    @Query("order") order?: "asc" | "desc",
  ) {
    const baseUrl = getPublicBaseUrl(req);
    return this.productsService.list({ q, sort, order, baseUrl });
  }

  @Get(":id")
  async getOne(@Req() req: Request, @Param("id") id: string) {
    const baseUrl = getPublicBaseUrl(req);
    const product = await this.productsService.getOne(id, baseUrl);
    if (!product) throw new NotFoundException("produto não encontrado");
    return product;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("image", productImageMulterOptions))
  async create(
    @Req() req: Request,
    @Body() body: CreateBody,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((req as any).fileValidationError === "INVALID_FILE_TYPE") {
      throw new BadRequestException("tipo de arquivo inválido");
    }
    const baseUrl = getPublicBaseUrl(req);
    return this.productsService.create(body, file, baseUrl);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: UpdateBody,
  ) {
    const baseUrl = getPublicBaseUrl(req);
    const product = await this.productsService.update(id, body, baseUrl);
    if (!product) throw new NotFoundException("produto não encontrado");
    return product;
  }

  @Put(":id/image")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("image", productImageMulterOptions))
  async updateImage(
    @Req() req: Request,
    @Param("id") id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((req as any).fileValidationError === "INVALID_FILE_TYPE") {
      throw new BadRequestException("tipo de arquivo inválido");
    }
    if (!file) throw new BadRequestException("imagem é obrigatória");
    const baseUrl = getPublicBaseUrl(req);
    const product = await this.productsService.updateImage(id, file, baseUrl);
    if (!product) throw new NotFoundException("produto não encontrado");
    return product;
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async remove(@Param("id") id: string): Promise<{ ok: true }> {
    const ok = await this.productsService.remove(id);
    if (!ok) throw new NotFoundException("produto não encontrado");
    return { ok: true };
  }
}
