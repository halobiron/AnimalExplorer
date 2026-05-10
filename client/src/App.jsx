import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useApp } from "./context/AppContext";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Dictionary from "./pages/Dictionary";
import Identify from "./pages/Identify";
import Login from "./pages/Login";
import Collection from "./pages/Collection";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useApp();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
};

const WithNav = ({ children }) => (
  <>
    <NavBar />
    {children}
  </>
);

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<WithNav><Home /></WithNav>} />
        <Route path="/dictionary" element={<WithNav><Dictionary /></WithNav>} />
        <Route
          path="/identify"
          element={
            <WithNav>
              <ProtectedRoute><Identify /></ProtectedRoute>
            </WithNav>
          }
        />
        <Route
          path="/collection"
          element={
            <WithNav>
              <ProtectedRoute><Collection /></ProtectedRoute>
            </WithNav>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;