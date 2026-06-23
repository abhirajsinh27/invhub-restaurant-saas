import { useEffect, useState } from "react";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import Products from "./pages/Products";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import StaffManagement from "./pages/StaffManagement";
import NotificationsPage from "./pages/NotificationsPage";
import { ThemeProvider } from "./context/ThemeContext";
import { API_URL } from "./config";
import { Toaster } from "react-hot-toast";

function App() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    setLoadingProducts(true);
    setError(null);

    fetch(`${API_URL}/products`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to connect to the backend server. Please verify your connection.");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoadingProducts(false);
      });
  }, [isAuthenticated, loading]);

  const fetchActivities = () => {
    setLoadingActivities(true);
    fetch(`${API_URL}/activities`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load activity logs.");
        return res.json();
      })
      .then((data) => {
        setActivityLogs(data);
        setLoadingActivities(false);
      })
      .catch((err) => {
        console.error("Error fetching activities:", err);
        setLoadingActivities(false);
      });
  };

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    fetchActivities();
  }, [isAuthenticated, loading]);

  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl font-medium text-sm p-4",
          duration: 3500,
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Dashboard
                  products={products}
                  activityLogs={activityLogs}
                  loadingProducts={loadingProducts}
                  loadingActivities={loadingActivities}
                  error={error}
                />
              }
            />
            <Route
              path="/products"
              element={
                <Products
                  products={products}
                  setProducts={setProducts}
                  fetchActivities={fetchActivities}
                  loadingProducts={loadingProducts}
                  error={error}
                />
              }
            />
            <Route
              path="/products/add"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AddProduct
                    products={products}
                    setProducts={setProducts}
                    fetchActivities={fetchActivities}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <Inventory
                  products={products}
                  setProducts={setProducts}
                  fetchActivities={fetchActivities}
                  loadingProducts={loadingProducts}
                  error={error}
                />
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Analytics products={products} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <Requests products={products} setProducts={setProducts} />
              }
            />
            <Route
              path="/profile"
              element={
                <Profile products={products} setProducts={setProducts} />
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
