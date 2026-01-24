import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Form, Question, Answer } from "../types";
import { Send, ArrowLeft, CheckCircle2, Check } from "lucide-react";

const PublicFormView: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchPublicForm = async () => {
      try {
        const response = await fetch(`/api/forms/public/${formId}`);
        const data = await response.json();

        if (data.form) setForm(data.form);

        if (data.questions) {
          const formattedQuestions = data.questions.map((q: any) => ({
            ...q,
            questionText: q.text,
          }));
          setQuestions(formattedQuestions);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicForm();
  }, [formId]);

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, value } : a
        );
      }
      return [...prev, { questionId, value }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      questions.some(
        (q) =>
          q.isRequired && !answers.find((a) => a.questionId === q.id.toString())
      )
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const endpoint = `http://localhost:3000/api/forms/${formId}/submit`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (response.ok) {
        setFinalScore(data.score);
        setIsSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        alert(data.error || "Submission failed!");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed!");
    }
  };

  // --- LOADING and NOT FOUND ---
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">
        Loading form...
      </div>
    );
  if (!form)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">
        Form not found.
      </div>
    );

  // --- SUCCESS SCREEN ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-ubuntu">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md w-full border-t-8 border-indigo-600">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">
            Well Done!
          </h2>

          {finalScore !== null && (
            <div className="my-6 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
              <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest mb-1">
                Your Score
              </p>
              <p className="text-5xl font-black text-indigo-700">
                {finalScore}
              </p>
            </div>
          )}

          <p className="text-slate-500 mb-8 leading-relaxed">
            Your response has been successfully recorded. You can now close this
            tab or go back.
          </p>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 w-full text-indigo-600 font-bold hover:underline py-2"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-12 px-4 font-ubuntu selection:bg-indigo-100">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="bg-white rounded-4xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="h-2.5 bg-indigo-600 w-full" />
          <div className="p-8">
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              {form.title}
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              {form.description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((q) => {
            const questionType = q.type?.toUpperCase();
            const optionsArray = Array.isArray(q.options)
              ? q.options
              : JSON.parse(q.options || "[]");

            return (
              <div
                key={q.id}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors duration-300"
              >
                <label className="block text-[1.1rem] font-bold text-slate-800 mb-6 italic">
                  {q.questionText}
                  {q.isRequired && (
                    <span className="text-rose-500 ml-1">*</span>
                  )}
                </label>

                {/* --- MULTIPLE CHOICE (RADIO) --- */}
                {questionType === "CHECKBOX" && (
                  <div className="space-y-3">
                    {optionsArray.map((opt: string, idx: number) => (
                      <label
                        key={idx}
                        className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-indigo-50/50 hover:border-indigo-100 cursor-pointer transition-all group"
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-indigo-600 transition-all"
                            onChange={() =>
                              handleInputChange(q.id.toString(), opt)
                            }
                          />
                          <div className="absolute w-2.5 h-2.5 bg-indigo-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className="text-slate-700 font-medium group-hover:text-indigo-900">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* --- CHECKBOX --- */}
                {questionType === "MULTIPLE_CHOICE" && (
                  <div className="space-y-3">
                    {optionsArray.map((opt: string, idx: number) => (
                      <label
                        key={idx}
                        className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-emerald-50/50 hover:border-emerald-100 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-lg border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          onChange={(e) => {
                            const currentAnswers =
                              (answers.find(
                                (a) => a.questionId === q.id.toString()
                              )?.value as string[]) || [];
                            const newValue = e.target.checked
                              ? [...currentAnswers, opt]
                              : currentAnswers.filter((val) => val !== opt);
                            handleInputChange(q.id.toString(), newValue);
                          }}
                        />
                        <span className="text-slate-700 font-medium group-hover:text-emerald-900">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* --- DROPDOWN --- */}
                {questionType === "DROPDOWN" && (
                  <div className="relative">
                    <select
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none text-slate-700"
                      onChange={(e) =>
                        handleInputChange(q.id.toString(), e.target.value)
                      }
                    >
                      <option value="">Choose an option...</option>
                      {optionsArray.map((opt: string, idx: number) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      ▼
                    </div>
                  </div>
                )}

                {/* --- SHORT TEXT --- */}
                {questionType === "SHORT_TEXT" && (
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Your answer"
                      className="w-full bg-transparent border-b-2 border-slate-100 py-3 outline-none focus:border-indigo-600 transition-colors duration-300 text-slate-800 placeholder:text-slate-300"
                      onChange={(e) =>
                        handleInputChange(q.id.toString(), e.target.value)
                      }
                    />
                  </div>
                )}

                {/* --- LONG TEXT --- */}
                {questionType === "LONG_TEXT" && (
                  <div className="relative">
                    <textarea
                      placeholder="Type your long answer here..."
                      className="w-full bg-slate-50/50 p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none text-slate-800"
                      rows={4}
                      onChange={(e) =>
                        handleInputChange(q.id.toString(), e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-3xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            onClick={handleSubmit}
          >
            <Send
              size={22}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
            Submit Form
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicFormView;
