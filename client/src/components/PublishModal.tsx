import React, { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Globe,
  ArrowRight,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import type { Form, Question } from "../types";

interface PublishModalProps {
  form: Partial<Form>;
  questions: Question[];
  onClose: () => void;
}

const PublishModal: React.FC<PublishModalProps> = ({
  form,
  questions,
  onClose,
}) => {
  // --- STATE ---
  const [status, setStatus] = useState<
    "idle" | "validating" | "loading" | "success" | "error"
  >("idle");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --- 1. VALIDATION LOGIC ---
  const runPrePublishChecks = (): boolean => {
    setStatus("validating");

    if (!form.title?.trim()) {
      setErrorMessage("Your form needs a title before it can be published.");
      setStatus("error");
      return false;
    }

    if (questions.length === 0) {
      setErrorMessage("You must add at least one question to your form.");
      setStatus("error");
      return false;
    }

    const emptyQuestions = questions.some((q) => !q.questionText.trim());
    if (emptyQuestions) {
      setErrorMessage("Please ensure all questions have text content.");
      setStatus("error");
      return false;
    }

    // Quiz Mode validation
    if (form.isQuiz) {
      const missingAnswers = questions.some(
        (q) =>
          !q.correctAnswer ||
          (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)
      );
      if (missingAnswers) {
        setErrorMessage(
          "Quiz mode is ON. Please provide correct answers for all questions."
        );
        setStatus("error");
        return false;
      }
    }

    return true;
  };

  // --- 2. BACKEND INTEGRATION (PUBLISH) ---
  const handleFinalPublish = async () => {
    if (!runPrePublishChecks()) return;

    setStatus("loading");
    try {
      const endpoint = "/api/forms/publish";
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          questions: questions.map((q, idx) => ({ ...q, order: idx })),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(
          "Server failed to save the form. Please try again later."
        );
      }

      const data = await response.json();

      // 3. GENERATE PUBLIC LINK
      const shareUrl = `${window.location.origin}/view-form/${data.id}`;
      setPublishedUrl(shareUrl);
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(
        err.message || "An unexpected error occurred during publishing."
      );
      setStatus("error");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedUrl);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 font-ubuntu">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
        {/* --- IDLE / LOADING STATE --- */}
        {(status === "idle" ||
          status === "loading" ||
          status === "validating") && (
          <div className="text-center">
            <div
              className={`w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform ${
                status === "loading" ? "animate-pulse" : "rotate-12"
              }`}
            >
              <Globe size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Publish Your Form
            </h2>
            <p className="text-slate-500 mb-8 px-4 text-sm leading-relaxed">
              Once published, anyone with the link will be able to submit
              responses.
            </p>

            <button
              onClick={handleFinalPublish}
              disabled={status === "loading"}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 cursor-pointer"
            >
              {status === "loading" ? (
                <>
                  {" "}
                  <Loader2
                    className="animate-spin"
                    size={20}
                  /> Publishing...{" "}
                </>
              ) : (
                "Confirm & Go Live"
              )}
            </button>
            <button
              onClick={onClose}
              disabled={status === "loading"}
              className="mt-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors disabled:invisible cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* --- SUCCESS STATE (Confirmation Message & Public Link) --- */}
        {status === "success" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-900">
              Form is Live!
            </h2>
            <p className="text-slate-500 mb-8 text-sm">
              Successfully generated your public link.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between mb-8 group">
              <span className="text-xs font-mono text-slate-500 truncate mr-3">
                {publishedUrl}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-2.5 bg-white text-indigo-600 rounded-xl border border-slate-200 shadow-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                title="Copy Link"
              >
                <Copy size={18} />
              </button>
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => window.open(publishedUrl, "_blank")}
                className="w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
              >
                View Public Form <ExternalLink size={18} />
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
              >
                Back to Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* --- ERROR STATE --- */}
        {status === "error" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="mb-1" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-900">
              Wait a moment
            </h2>
            <p className="text-slate-500 mb-8 text-sm px-2 leading-relaxed">
              {errorMessage}
            </p>

            <button
              onClick={() => setStatus("idle")}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold transition-all hover:bg-slate-800 cursor-pointer"
            >
              Fix Issues
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishModal;
