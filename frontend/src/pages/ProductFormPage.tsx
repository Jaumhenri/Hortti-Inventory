import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  createProduct,
  getProduct,
  updateProduct,
  updateProductImage,
  type ProductCategory,
} from "../api";
import { useAuth } from "../auth";
import { formatBRLFromCents } from "../format";

const categories: { value: ProductCategory; label: string }[] = [
  { value: "fruta", label: "Fruta" },
  { value: "verdura", label: "Verdura" },
  { value: "legume", label: "Legume" },
];

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { token } = useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("fruta");
  const [price, setPrice] = useState("0.00");
  const [currentPriceCents, setCurrentPriceCents] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = isEdit ? "Editar produto" : "Novo produto";

  const previewPrice = useMemo(() => {
    const normalized = price.replace(",", ".").trim();
    const ok = /^\d+(\.\d{1,2})?$/.test(normalized);
    if (!ok) return null;
    const [i, d = ""] = normalized.split(".");
    const cents = Number(i) * 100 + Number(d.padEnd(2, "0"));
    return Number.isFinite(cents) ? cents : null;
  }, [price]);

  useEffect(() => {
    if (!isEdit || !id) return;

    setLoading(true);
    setError(null);
    getProduct(id)
      .then((p) => {
        setName(p.name);
        setCategory(p.category);
        setPrice((p.priceCents / 100).toFixed(2));
        setCurrentPriceCents(p.priceCents);
        setImageUrl(p.imageUrl);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Faça login para salvar.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        await updateProduct({ id, name, category, price, token });
        if (image) await updateProductImage({ id, image, token });
      } else {
        await createProduct({ name, category, price, image, token });
      }

      navigate("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Link to="/products" className="text-sm font-medium text-emerald-700">
          Voltar
        </Link>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded bg-white p-6 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Ex: Banana Prata"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Categoria</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Preço (R$)</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              inputMode="decimal"
              placeholder="9.99"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              {isEdit ? "Substituir imagem (opcional)" : "Imagem (opcional)"}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded border bg-white px-3 py-2 text-sm"
            />
          </label>

          {error ? (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>

          {previewPrice !== null ? (
            <p className="text-xs text-slate-600">
              Prévia: <span className="font-medium">{formatBRLFromCents(previewPrice)}</span>
            </p>
          ) : null}
        </div>

        <div className="space-y-4 rounded bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Imagem atual</h2>

          {isEdit ? (
            imageUrl ? (
              <img
                src={imageUrl}
                alt={name || "Produto"}
                className="h-56 w-full rounded object-cover"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center rounded border border-dashed text-sm text-slate-500">
                Sem imagem
              </div>
            )
          ) : (
            <div className="flex h-56 w-full items-center justify-center rounded border border-dashed text-sm text-slate-500">
              A imagem será exibida após criar
            </div>
          )}

          {isEdit && currentPriceCents !== null ? (
            <p className="text-sm text-slate-700">
              Preço atual:{" "}
              <span className="font-medium">{formatBRLFromCents(currentPriceCents)}</span>
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

