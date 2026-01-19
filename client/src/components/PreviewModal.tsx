import React from "react";
import { X, Eye } from "lucide-react";
import type { Form, Question } from "../types";

interface PreviewModalProps {
  form: Partial<Form>;
  questions: Question[];
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  form,
  questions,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-slate-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
          <h2 className="font-bold flex items-center gap-2 text-slate-700">
            <Eye size={18} className="text-indigo-600" /> Respondent Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {form.title || "Untitled Form"}
            </h1>
            <p className="text-slate-500">
              {form.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-8">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="flex justify-between mb-4">
                  <p className="font-bold text-slate-800">
                    {i + 1}. {q.questionText || "New Question"}
                    {q.isRequired && (
                      <span className="text-rose-500 ml-1">*</span>
                    )}
                  </p>
                  {form.isQuiz && q.points && (
                    <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded">
                      {q.points} PTS
                    </span>
                  )}
                </div>

                {/* Input Simulation based on type */}
                {renderPreviewInput(q)}
              </div>
            ))}
          </div>

          <button className="w-full mt-10 bg-indigo-600 text-white py-4 rounded-2xl font-bold opacity-50 cursor-not-allowed">
            Submit (Disabled in Preview)
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper to render inputs
const renderPreviewInput = (q: Question) => {
  switch (q.type) {
    case "SHORT_TEXT":
    case "LONG_TEXT":
      return (
        <div className="w-full h-12 border-b-2 border-slate-100 text-slate-400 flex items-center">
          Type answer here...
        </div>
      );
    case "MULTIPLE_CHOICE":
    case "CHECKBOX":
    case "DROPDOWN":
      return (
        <div className="space-y-3">
          {q.options?.map((opt: any, idx: any) => (
            <div key={idx} className="flex items-center gap-3 text-slate-600">
              <div
                className={`w-5 h-5 border-2 border-slate-200 ${
                  q.type === "CHECKBOX" ? "rounded-md" : "rounded-full"
                }`}
              />
              <span className="text-sm">{opt}</span>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

export default PreviewModal;
