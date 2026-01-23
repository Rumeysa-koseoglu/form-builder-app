import "./App.css";
import AuthForm from "./components/AuthForm";
import { Routes, Route, Navigate } from "react-router-dom";
import FormDashboard from "./components/FormDashboard";
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
      <Route
        path="/"
        element={
          <PrivateRoute>
            <FormDashboard />
          </PrivateRoute>
        }
      />
      <Route path="/auth" element={<AuthForm />} />
      <Route path="/create-form" element={<CreateForm />} />
      <Route path="/view-form/:formId" element={<PublicFormView />} />
      <Route path="/edit-form/:formId" element={<CreateForm />} />
    </Routes>
  );
}

export default App;
