import { BadRequestException, Injectable } from "@nestjs/common";
import type { Express } from "express";
import * as fs from "fs";
import * as path from "path";

import { DbService } from "../db/db.service";
import { getEnv } from "../env";
import { parsePriceToCents } from "./price";

export const PRODUCT_CATEGORIES = ["fruta", "verdura", "legume"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

type DbProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  price_cents: number;
  image_path: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductDto = {
  id: string;
  name: string;
  category: ProductCategory;
  priceCents: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListArgs = {
  q?: string;
  sort?: string;
  order?: string;
  baseUrl: string;
};

type CreateArgs = {
  name?: string;
  category?: ProductCategory;
  price?: string;
};

type UpdateArgs = Partial<CreateArgs>;

function toDto(row: DbProduct, baseUrl: string): ProductDto {
  const env = getEnv();
  const imageUrl = row.image_path
    ? `${baseUrl}/${env.uploadDir}/${row.image_path}`
    : null;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    priceCents: row.price_cents,
    imageUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assertCategory(category: unknown): asserts category is ProductCategory {
  if (!PRODUCT_CATEGORIES.includes(category as ProductCategory)) {
    throw new BadRequestException("categoria inválida");
  }
}

@Injectable()
export class ProductsService {
  constructor(private readonly db: DbService) {}

  async list(args: ListArgs): Promise<ProductDto[]> {
    const q = args.q?.trim();

    const sortCol = args.sort === "price" ? "price_cents" : "LOWER(name)";
    const orderSql = args.order === "desc" ? "DESC" : "ASC";

    const params: unknown[] = [];
    const where: string[] = [];

    if (q) {
      params.push(`%${q}%`);
      where.push(`LOWER(name) LIKE LOWER($${params.length})`);
    }

    let sql =
      "SELECT id, name, category, price_cents, image_path, created_at, updated_at FROM products";
    if (where.length) sql += ` WHERE ${where.join(" AND ")}`;

    // Stable secondary sort for deterministic results.
    sql += ` ORDER BY ${sortCol} ${orderSql}, created_at DESC`;
    sql += " LIMIT 1000";

    const { rows } = await this.db.query<DbProduct>(sql, params);
    return rows.map((row) => toDto(row, args.baseUrl));
  }

  async getOne(id: string, baseUrl: string): Promise<ProductDto | null> {
    const { rows } = await this.db.query<DbProduct>(
      "SELECT id, name, category, price_cents, image_path, created_at, updated_at FROM products WHERE id = $1",
      [id],
    );
    const row = rows[0];
    return row ? toDto(row, baseUrl) : null;
  }

  async create(
    body: CreateArgs,
    file: Express.Multer.File | undefined,
    baseUrl: string,
  ): Promise<ProductDto> {
    const name = body.name?.trim();
    if (!name) throw new BadRequestException("nome é obrigatório");

    if (!body.category) throw new BadRequestException("categoria é obrigatória");
    assertCategory(body.category);

    const cents = parsePriceToCents(body.price ?? "");
    if (cents === null) throw new BadRequestException("preço inválido");

    const imagePath = file ? `products/${file.filename}` : null;

    const { rows } = await this.db.query<DbProduct>(
      "INSERT INTO products (name, category, price_cents, image_path) VALUES ($1, $2, $3, $4) RETURNING id, name, category, price_cents, image_path, created_at, updated_at",
      [name, body.category, cents, imagePath],
    );
    return toDto(rows[0], baseUrl);
  }

  async update(
    id: string,
    body: UpdateArgs,
    baseUrl: string,
  ): Promise<ProductDto | null> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) throw new BadRequestException("nome inválido");
      params.push(name);
      fields.push(`name = $${params.length}`);
    }

    if (body.category !== undefined) {
      assertCategory(body.category);
      params.push(body.category);
      fields.push(`category = $${params.length}`);
    }

    if (body.price !== undefined) {
      const cents = parsePriceToCents(body.price);
      if (cents === null) throw new BadRequestException("preço inválido");
      params.push(cents);
      fields.push(`price_cents = $${params.length}`);
    }

    if (!fields.length) {
      throw new BadRequestException("nenhum campo para atualizar");
    }

    fields.push("updated_at = now()");
    params.push(id);

    const { rows } = await this.db.query<DbProduct>(
      `UPDATE products SET ${fields.join(
        ", ",
      )} WHERE id = $${params.length} RETURNING id, name, category, price_cents, image_path, created_at, updated_at`,
      params,
    );

    const row = rows[0];
    return row ? toDto(row, baseUrl) : null;
  }

  async updateImage(
    id: string,
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<ProductDto | null> {
    const env = getEnv();
    const newImagePath = `products/${file.filename}`;

    const result = await this.db.withClient(async (client) => {
      await client.query("BEGIN");
      const existing = await client.query<Pick<DbProduct, "image_path">>(
        "SELECT image_path FROM products WHERE id = $1 FOR UPDATE",
        [id],
      );

      const oldImagePath = existing.rows[0]?.image_path ?? null;
      if (!existing.rows[0]) {
        await client.query("ROLLBACK");
        return null;
      }

      const updated = await client.query<DbProduct>(
        "UPDATE products SET image_path = $2, updated_at = now() WHERE id = $1 RETURNING id, name, category, price_cents, image_path, created_at, updated_at",
        [id, newImagePath],
      );
      await client.query("COMMIT");
      return { row: updated.rows[0], oldImagePath };
    });

    if (!result) return null;

    if (result.oldImagePath) {
      const oldPath = path.join(process.cwd(), env.uploadDir, result.oldImagePath);
      void fs.promises.unlink(oldPath).catch(() => undefined);
    }

    return toDto(result.row, baseUrl);
  }

  async remove(id: string): Promise<boolean> {
    const env = getEnv();

    const deleted = await this.db.withClient(async (client) => {
      await client.query("BEGIN");
      const existing = await client.query<Pick<DbProduct, "image_path">>(
        "SELECT image_path FROM products WHERE id = $1 FOR UPDATE",
        [id],
      );
      const imagePath = existing.rows[0]?.image_path ?? null;
      if (!existing.rows[0]) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query("DELETE FROM products WHERE id = $1", [id]);
      await client.query("COMMIT");
      return imagePath;
    });

    if (deleted === null) return false;

    if (deleted) {
      const filePath = path.join(process.cwd(), env.uploadDir, deleted);
      void fs.promises.unlink(filePath).catch(() => undefined);
    }

    return true;
  }
}
