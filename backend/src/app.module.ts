import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { DbModule } from "./db/db.module";
import { ProductsModule } from "./products/products.module";

@Module({
  imports: [DbModule, AuthModule, ProductsModule],
})
export class AppModule {}

