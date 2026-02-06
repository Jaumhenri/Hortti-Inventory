export type ProductCategory = "fruta" | "verdura" | "legume";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  priceCents: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type ApiError = {
  message: string;
};

async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(opts.headers);
  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    if (contentType.includes("application/json")) {
      const json = (await res.json()) as Partial<ApiError>;
      if (json.message) message = String(json.message);
    } else {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }
    throw new Error(message);
  }

  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  // @ts-expect-error - only used for JSON endpoints
  return undefined as T;
}

export async function login(username: string, password: string) {
  return apiFetch<{ accessToken: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export async function listProducts(params: {
  q?: string;
  sort?: "name" | "price";
  order?: "asc" | "desc";
}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  const qs = query.toString();
  return apiFetch<Product[]>(`/products${qs ? `?${qs}` : ""}`);
}

export async function getProduct(id: string) {
  return apiFetch<Product>(`/products/${id}`);
}

export async function createProduct(args: {
  name: string;
  category: ProductCategory;
  price: string;
  image?: File | null;
  token: string;
}) {
  const form = new FormData();
  form.set("name", args.name);
  form.set("category", args.category);
  form.set("price", args.price);
  if (args.image) form.set("image", args.image);

  return apiFetch<Product>("/products", {
    method: "POST",
    body: form,
    token: args.token,
  });
}

export async function updateProduct(args: {
  id: string;
  name?: string;
  category?: ProductCategory;
  price?: string;
  token: string;
}) {
  return apiFetch<Product>(`/products/${args.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: args.name,
      category: args.category,
      price: args.price,
    }),
    token: args.token,
  });
}

export async function updateProductImage(args: {
  id: string;
  image: File;
  token: string;
}) {
  const form = new FormData();
  form.set("image", args.image);

  return apiFetch<Product>(`/products/${args.id}/image`, {
    method: "PUT",
    body: form,
    token: args.token,
  });
}

export async function deleteProduct(args: { id: string; token: string }) {
  return apiFetch<{ ok: true }>(`/products/${args.id}`, {
    method: "DELETE",
    token: args.token,
  });
}

