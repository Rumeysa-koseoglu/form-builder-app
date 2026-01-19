import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Type,
  AlignLeft,
  CheckSquare,
  CircleDot,
  List,
  Settings,
  Eye,
  Save,
} from "lucide-react";
import type { Form, Question, QuestionType } from "../types";
import PreviewModal from "./PreviewModal";
import PublishModal from "./PublishModal";

const FormBuilder: React.FC = () => {
  // 1. Initial State following your Form Interface
  const [formConfig, setFormConfig] = useState<Partial<Form>>({
    title: "",
    description: "",
    isQuiz: false,
    isActive: true,
  });

  const [questions, setQuestions] = useState<Question[]>([]);

  const [activeModal, setActiveModal] = useState<
    "none" | "preview" | "publish"
  >("none");

  {
    activeModal === "preview" && (
      <PreviewModal
        form={formConfig}
        questions={questions}
        onClose={() => setActiveModal("none")}
      />
    );
  }

  {
    activeModal === "publish" && (
      <PublishModal
        form={formConfig}
        questions={questions}
        onClose={() => setActiveModal("none")}
      />
    );
  }

  // 2. Add New Question Logic
  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      formId: formConfig.id || "temp-id",
      type,
      questionText: "",
      isRequired: false,
      order: questions.length,
      options: ["Option 1"], // Default option for choice types
      points: formConfig.isQuiz ? 10 : 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  // 3. Update Question Content
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  // 4. Delete Question
  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* BUILDER HEADER */}
      <header className=" bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Settings size={20} />
            </div>
            <h1 className="font-bold text-lg hidden sm:block">Form Builder</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-all active:scale-95 cursor-pointer"
              onClick={() => setActiveModal("preview")}
            >
              <Eye size={18} />
              Preview
            </button>
            <button
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
              onClick={() => setActiveModal("publish")}
            >
              <Save size={18} />
              Publish Form
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        {/* FORM INITIAL SETTINGS CARD */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm border-t-8 border-t-indigo-600">
          <input
            type="text"
            placeholder="Form Title"
            className="w-full text-3xl font-black placeholder:text-slate-300 outline-none mb-3"
            value={formConfig.title}
            onChange={(e) =>
              setFormConfig({ ...formConfig, title: e.target.value })
            }
          />
          <textarea
            placeholder="Form description..."
            className="w-full text-slate-500 placeholder:text-slate-300 outline-none resize-none"
            rows={2}
            value={formConfig.description}
            onChange={(e) =>
              setFormConfig({ ...formConfig, description: e.target.value })
            }
          />

          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() =>
                  setFormConfig({ ...formConfig, isQuiz: !formConfig.isQuiz })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  formConfig.isQuiz ? "bg-amber-500" : "bg-slate-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    formConfig.isQuiz ? "left-7" : "left-1"
                  }`}
                />
              </div>
              <span className="font-bold text-sm text-slate-700">
                Quiz Mode
              </span>
            </label>
          </div>
        </div>
        {/* QUESTIONS LIST */}
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Question {index + 1}
                </span>
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                <div className="md:col-span-8">
                  <input
                    type="text"
                    placeholder="Enter your question here..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    value={q.questionText}
                    onChange={(e) =>
                      updateQuestion(q.id, { questionText: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between text-slate-600">
                  <span className="text-xs font-bold uppercase">
                    {q.type.replace("_", " ")}
                  </span>
                  <Settings size={14} />
                </div>
              </div>

              {/* OPTIONS EDITOR (For Multiple Choice, Checkbox, Dropdown) */}
              {["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(q.type) && (
                <div className="space-y-2 mb-6 ml-4">
                  {q.options?.map((opt: any, optIdx: any) => (
                    <div key={optIdx} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <input
                        type="text"
                        className="text-sm text-slate-600 outline-none border-b border-transparent focus:border-slate-200 py-1"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(q.options || [])];
                          newOpts[optIdx] = e.target.value;
                          updateQuestion(q.id, { options: newOpts });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      updateQuestion(q.id, {
                        options: [
                          ...(q.options || []),
                          `Option ${(q.options?.length || 0) + 1}`,
                        ],
                      })
                    }
                    className="text-indigo-600 text-xs font-bold flex items-center gap-1 mt-2 hover:underline"
                  >
                    <Plus size={14} /> Add Option
                  </button>
                </div>
              )}

              {/* QUIZ SETTINGS SECTION */}
              {formConfig.isQuiz && (
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800 uppercase">
                      Correct Answer:
                    </span>
                    <input
                      type="text"
                      placeholder="Type correct answer..."
                      className="bg-white border border-amber-200 rounded-lg px-3 py-1 text-sm outline-none"
                      value={
                        typeof q.correctAnswer === "string"
                          ? q.correctAnswer
                          : ""
                      }
                      onChange={(e) =>
                        updateQuestion(q.id, { correctAnswer: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800 uppercase">
                      Points:
                    </span>
                    <input
                      type="number"
                      className="w-16 bg-white border border-amber-200 rounded-lg px-3 py-1 text-sm outline-none"
                      value={q.points}
                      onChange={(e) =>
                        updateQuestion(q.id, { points: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-indigo-600"
                    checked={q.isRequired}
                    onChange={(e) =>
                      updateQuestion(q.id, { isRequired: e.target.checked })
                    }
                  />
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Required
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
        {/* ADD QUESTION BUTTONS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-10">
          <TypeButton
            icon={<Type size={18} />}
            label="Short Text"
            onClick={() => addQuestion("SHORT_TEXT")}
          />
          <TypeButton
            icon={<AlignLeft size={18} />}
            label="Long Text"
            onClick={() => addQuestion("LONG_TEXT")}
          />
          <TypeButton
            icon={<CircleDot size={18} />}
            label="Choice"
            onClick={() => addQuestion("MULTIPLE_CHOICE")}
          />
          <TypeButton
            icon={<CheckSquare size={18} />}
            label="Checkbox"
            onClick={() => addQuestion("CHECKBOX")}
          />
          <TypeButton
            icon={<List size={18} />}
            label="Dropdown"
            onClick={() => addQuestion("DROPDOWN")}
          />
        </div>{" "}
        {activeModal === "preview" && (
          <PreviewModal
            form={formConfig}
            questions={questions}
            onClose={() => setActiveModal("none")}
          />
        )}
        {activeModal === "publish" && (
          <PublishModal
            form={formConfig}
            questions={questions}
            onClose={() => setActiveModal("none")}
          />
        )}
      </main>
    </div>
  );
};

const TypeButton = ({
  icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
  >
    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter">
      {label}
    </span>
  </button>
);

export default FormBuilder;
