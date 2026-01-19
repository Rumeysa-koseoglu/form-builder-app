import React, { useState } from "react";
import { CheckCircle2, Copy, Loader2, Globe, ArrowRight } from "lucide-react";
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
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [publishedUrl, setPublishedUrl] = useState("");

  const handlePublish = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, questions }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setPublishedUrl(`${window.location.origin}/view/${data.id}`);
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-indigo-950/30 backdrop-blur-md p-4">
      <div className="bg-white p-8 rounded-4xl shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
        {status === "idle" || status === "loading" ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
              <Globe size={40} />
            </div>
            <h2 className="text-2xl font-black mb-2">Ready to go live?</h2>
            <p className="text-slate-500 mb-8 px-4">
              This will make your form public and you can start collecting
              responses.
            </p>

            <button
              onClick={handlePublish}
              disabled={status === "loading"}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Confirm & Publish"
              )}
            </button>
            <button
              onClick={onClose}
              className="mt-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
            >
              Maybe later
            </button>
          </div>
        ) : status === "success" ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-900">
              It's Live!
            </h2>
            <p className="text-slate-500 mb-6 px-4">
              Your form is published and waiting for participants.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between mb-8">
              <span className="text-xs font-mono text-slate-500 truncate mr-3">
                {publishedUrl}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publishedUrl);
                  alert("Copied!");
                }}
                className="p-2 bg-white text-indigo-600 rounded-lg border border-slate-200 shadow-sm hover:scale-110 transition-transform"
              >
                <Copy size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-rose-600 font-bold">
            An error occurred. Please try again.
            <button
              onClick={() => setStatus("idle")}
              className="block mx-auto mt-4 text-slate-600"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishModal;
