import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { deleteProduct, listProducts, type Product } from "../api";
import { useAuth } from "../auth";
import { formatBRLFromCents } from "../format";

type SortKey = "name_asc" | "name_desc" | "price_asc" | "price_desc";

function sortParams(key: SortKey): { sort: "name" | "price"; order: "asc" | "desc" } {
  switch (key) {
    case "price_asc":
      return { sort: "price", order: "asc" };
    case "price_desc":
      return { sort: "price", order: "desc" };
    case "name_desc":
      return { sort: "name", order: "desc" };
    case "name_asc":
    default:
      return { sort: "name", order: "asc" };
  }
}

export function ProductsListPage() {
  const { token } = useAuth();

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name_asc");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => ({ q, ...sortParams(sortKey) }), [q, sortKey]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listProducts(params);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, params.sort, params.order]);

  async function onDelete(id: string) {
    if (!token) {
      setError("Faça login para remover produtos.");
      return;
    }
    const ok = window.confirm("Remover este produto?");
    if (!ok) return;

    setLoading(true);
    setError(null);
    try {
      await deleteProduct({ id, token });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao remover");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pesquise por nome e ordene por preço ou nome.
          </p>
        </div>

        <Link
          to="/products/new"
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Novo produto
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Pesquisa</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Ex: banana"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Ordenação</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="name_asc">Nome (A-Z)</option>
            <option value="name_desc">Nome (Z-A)</option>
            <option value="price_asc">Preço (menor)</option>
            <option value="price_desc">Preço (maior)</option>
          </select>
        </label>
      </div>

      {error ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="w-20 px-4 py-3">Imagem</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-slate-100" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3">{formatBRLFromCents(p.priceCents)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/products/${p.id}/edit`}
                      className="rounded border px-3 py-1.5 text-xs font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                      disabled={loading}
                    >
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!items.length && !loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-600">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {loading ? <p className="mt-3 text-xs text-slate-500">Carregando...</p> : null}
    </div>
  );
}

