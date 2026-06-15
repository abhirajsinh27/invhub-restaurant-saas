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

function App() {
  const [products, setProducts] = useState([]);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    fetch("http://localhost:3000/products", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, [isAuthenticated, loading]);

  const [activityLogs, setActivityLogs] = useState([]);

  const fetchActivities = () => {
    fetch("http://localhost:3000/activities", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setActivityLogs(data);
      })
      .catch((err) => {
        console.error("Error fetching activities:", err);
      });
  };

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    fetchActivities();
  }, [isAuthenticated, loading]);

  return (
    <ThemeProvider>
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
                <Dashboard products={products} activityLogs={activityLogs} />
              }
            />
            <Route
              path="/products"
              element={
                <Products
                  products={products}
                  setProducts={setProducts}
                  fetchActivities={fetchActivities}
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
