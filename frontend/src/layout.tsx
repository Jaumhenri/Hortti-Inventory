import { Link, NavLink } from "react-router-dom";

import { useAuth } from "./auth";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded px-3 py-2 text-sm font-medium",
    isActive ? "bg-emerald-100 text-emerald-900" : "text-slate-700",
  ].join(" ");
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth();

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/products" className="text-lg font-semibold">
            Hortti Inventory
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink to="/products" className={navClass}>
              Produtos
            </NavLink>
            <NavLink to="/products/new" className={navClass}>
              Novo
            </NavLink>
            {token ? (
              <button
                type="button"
                onClick={logout}
                className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              >
                Sair
              </button>
            ) : (
              <NavLink to="/login" className={navClass}>
                Entrar
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

