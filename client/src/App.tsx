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
    return token ? <>{children}</> : <Navigate to="/" />;
  };
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <FormDashboard />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<AuthForm />} />
      <Route
        path="/create-form"
        element={
          <PrivateRoute>
            <CreateForm />
          </PrivateRoute>
        }
      />
      <Route path="/view-form/:formId" element={<PublicFormView />} />
      <Route
        path="/edit-form/:formId"
        element={
          <PrivateRoute>
            <CreateForm />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
