import "./App.css";
import AuthForm from "./components/AuthForm";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import type { ReactNode } from "react";

function App() {
  const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const token = localStorage.getItem("token");
    return token ? <>{children}</> : <Navigate to="/auth" />;
  };
  return (
    <Routes>
      <Route path="/auth" element={<AuthForm />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
