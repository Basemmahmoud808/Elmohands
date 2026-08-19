'use client';

import React, { useState } from 'react';
import { X, FileText, UploadCloud, CheckCircle2, Download, AlertCircle, Loader2 } from 'lucide-react';
import { StudentQuizItemDTO } from '@/lib/types/dashboard';

interface ExamViewerModalProps {
  quiz: StudentQuizItemDTO | null;
  onClose: () => void;
  onSubmitPaper?: (file: File) => Promise<void>;
}

export function ExamViewerModal({ quiz, onClose, onSubmitPaper }: ExamViewerModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!quiz) return null;

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setSubmitting(true);
    try {
      if (onSubmitPaper) {
        await onSubmitPaper(selectedFile);
      }
      setSubmitted(true);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-electric/30 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
                {quiz.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-chalk-muted">
                {quiz.branchName} • ورقة تدريبية وامتحان منزلي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Document Preview Box */}
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-electric block">ملف ورقة الامتحان المرفقة:</span>
                <span className="text-sm font-black text-slate-900 dark:text-chalk">
                  {quiz.title}.pdf
                </span>
              </div>

              <a
                href={quiz.pdfPath || '/sample-lesson-notes.pdf'}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>تحميل / فتح ملف PDF</span>
              </a>
            </div>
          </div>

          {/* Solution Submission Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-chalk flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-electric" />
              <span>تسليم إجابتك أو صورة الحل للمراجعة:</span>
            </h4>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-base font-black text-slate-900 dark:text-chalk">
                  تم تسليم ورقة الإجابة بنجاح!
                </h4>
                <p className="text-xs text-slate-600 dark:text-chalk-muted max-w-md mx-auto">
                  سيتم مراجعة إجابتك وتصحيحها بواسطة م/ رضا خيرت وإرسال التقرير لولي الأمر 
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <label className="block p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-cyan-electric bg-slate-50 dark:bg-slate-950/40 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <UploadCloud className="w-8 h-8 text-cyan-electric mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-chalk block">
                    {selectedFile ? selectedFile.name : 'اضغط لاختيار صورة الحل أو ملف PDF من جهازك'}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-600 block mt-1">
                    صيغ مدعومة: JPG, PNG, PDF (بحد أقصى 15 ميجابايت)
                  </span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-chalk-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover disabled:opacity-50 shadow-cyan-glow transition-all flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التسليم...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد تسليم ورقة الامتحان</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
