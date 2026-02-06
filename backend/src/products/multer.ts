import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { diskStorage, type Options } from "multer";

import { getEnv } from "../env";

function ensureProductsDir(): string {
  const env = getEnv();
  const dir = path.join(process.cwd(), env.uploadDir, "products");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export const productImageMulterOptions: Options = {
  storage: diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureProductsDir()),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext || ".bin"}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    if (!ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).fileValidationError = "INVALID_FILE_TYPE";
      cb(null, false);
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
