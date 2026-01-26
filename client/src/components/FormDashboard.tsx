import React, { useState, useEffect } from "react";
import {
  Plus,
  Link,
  Edit3,
  Trash2,
  Layout,
  BarChart3,
  CheckCircle,
  XCircle,
  LogOut,
} from "lucide-react";
import type { Form, FormResponse } from "../types";
import { useNavigate } from "react-router-dom";

const FormDashboard: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyForms = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL;
        console.log(API_URL);
        const response = await fetch(`${API_URL}/api/forms`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch forms");

        const data = await response.json();

        const rawForms = Array.isArray(data) ? data : data.rows || [];

        const formattedForms = rawForms.map((f: any) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          isQuiz: f.is_quiz,
          isActive: f.is_published,
          createdAt: f.created_at,
          responseCount: Number(f.response_count) || 0,
        }));

        const totalRes = formattedForms.reduce(
          (acc: any, curr: any) => acc + parseInt(curr.response_count || 0),
          0
        );
        setResponses(totalRes);
        console.log(responses);
        setForms(formattedForms);
      } catch (err) {
        console.error("An error occurred while loading the dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyForms();
  }, []);

  const totalResponsesForUser = forms.reduce((acc, form) => {
    const count = Number(form.response_count) || 0;
    return acc + count;
  }, 0);

  const copyShareLink = (formId: string) => {
    const url = `${window.location.origin}/view-form/${formId}`;
    navigator.clipboard.writeText(url);
    alert("Public link copied!");
  };

  const deleteForm = async (id: string) => {
    if (!window.confirm("Are you sure to delete this form?")) return;

    try {
      const token = localStorage.getItem("token");
      const endpiont = `http://localhost:3000/api/forms/${id}`;
      const response = await fetch(endpiont, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setForms(forms.filter((f) => f.id !== id));
      }
    } catch (err) {
      alert("Form could not be deleted.");
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        {/* loading animation */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-xl font-black text-slate-800 animate-pulse italic">
            Returning to Dashboard...
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-medium uppercase tracking-[0.2em]">
            Please wait a moment
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-ubuntu">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Layout className="text-white size-4 sm:size-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              FormBuilder
            </span>
          </div>
          <span className="flex flex-row gap-4">
            <GoBackToLoginPage />
            <button
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              onClick={() => navigate("/create-form")}
            >
              <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
              Create New Form
            </button>
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* STATS SECTION */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Forms" value={forms.length} color="indigo" />
          <StatCard
            title="Total Responses"
            value={totalResponsesForUser}
            color="emerald"
          />
          <StatCard
            title="Quiz Type"
            value={forms.filter((f) => f.isQuiz).length}
            color="amber"
          />
          <StatCard
            title="Active Now"
            value={forms.filter((f) => f.isActive).length}
            color="sky"
          />
        </section>

        {/* FORM LIST */}
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-2xl font-bold">Your Forms</h2>
          <p className="text-slate-500 text-sm">Showing {forms.length} forms</p>
        </div>

        {forms.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="grid grid-cols-1 sm:flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{form.title}</h3>
                    {form.isQuiz && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-black px-2.5 py-1 md:py-1 rounded-4xl">
                        Quiz
                      </span>
                    )}
                    <StatusBadge active={form.isActive} />
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-1 text-center md:text-start">
                    {form.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 uppercase font-semibold tracking-wider text-center md:text-start ">
                    Created: {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 md:px-8 border-l border-r border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Responses
                    </p>
                    <p className="text-xl font-black text-indigo-600">
                      {totalResponsesForUser}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-around gap-10 sm:gap-2">
                  <ActionButton
                    icon={<BarChart3 size={18} />}
                    label="Responses"
                    className="text-indigo-600 hover:bg-indigo-50"
                    onClick={() => navigate(`/responses/${form.id}`)}
                  />
                  <ActionButton
                    icon={<Link size={18} />}
                    label="Share"
                    className="text-slate-600 hover:bg-slate-100"
                    onClick={() => copyShareLink(form.id.toString())}
                  />
                  <ActionButton
                    icon={<Edit3 size={18} />}
                    label="Edit"
                    className="text-emerald-600 hover:bg-emerald-50"
                    onClick={() => navigate(`/edit-form/${form.id}`)}
                  />
                  <ActionButton
                    icon={<Trash2 size={18} />}
                    label="Delete"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() => deleteForm(form.id.toString())}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) => {
  const colors: any = {
    indigo: "border-indigo-200 text-indigo-600",
    emerald: "border-emerald-200 text-emerald-600",
    amber: "border-amber-200 text-amber-600",
    sky: "border-sky-200 text-sky-600",
  };
  return (
    <div
      className={`bg-white p-6 rounded-2xl border-b-4 shadow-sm ${colors[color]}`}
    >
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
        {title}
      </p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
};

const StatusBadge = ({ active }: { active: boolean }) => (
  <span
    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
      active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
    }`}
  >
    {active ? <CheckCircle size={12} /> : <XCircle size={12} />}
    {active ? "ACTIVE" : "CLOSED"}
  </span>
);

const ActionButton = ({
  icon,
  label,
  onClick,
  className,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  className: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-semibold text-sm ${className}`}
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
  </button>
);

const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">
      <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
        <Layout size={40} className="text-slate-300" />
      </div>
      <h3 className="text-xl font-bold mb-2">No forms found</h3>
      <p className="text-slate-500 mb-8 max-w-sm mx-auto">
        You haven't created any forms or quizzes yet. Start collecting data in
        minutes!
      </p>
      <button
        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:-translate-y-1 transition-transform cursor-pointer"
        onClick={() => navigate("/create-form")}
      >
        Create Your First Form
      </button>
    </div>
  );
};

const GoBackToLoginPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <button title="Log Out">
        <LogOut
          className=" size-5 sm:size-7 text-indigo-400 hover:text-indigo-600 transition-transform active:scale-85 cursor-pointer"
          onClick={() => navigate("/auth")}
        />
      </button>
    </>
  );
};

export default FormDashboard;
