import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { useAuth } from "./auth";
import { Layout } from "./layout";
import { LoginPage } from "./pages/LoginPage";
import { ProductFormPage } from "./pages/ProductFormPage";
import { ProductsListPage } from "./pages/ProductsListPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products" element={<ProductsListPage />} />
        <Route
          path="/products/new"
          element={
            <RequireAuth>
              <ProductFormPage />
            </RequireAuth>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <RequireAuth>
              <ProductFormPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </Layout>
  );
}

