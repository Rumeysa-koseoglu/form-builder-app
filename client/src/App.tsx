import "./App.css";
import AuthForm from "./components/AuthForm";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import CreateForm from "./components/CreateForm";
import type { ReactNode } from "react";
import PublicFormView from "./components/PublicFormView";

function App() {
  const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const token = localStorage.getItem("token");
    return token ? <>{children}</> : <Navigate to="/auth" />;
  };
  return (
    <Routes>
      <Route path="/auth" element={<AuthForm />} />
      <Route path="/create-form" element={<CreateForm />} />
      <Route path="/view/:formId" element={<PublicFormView />} />
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
