'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, FileText, UploadCloud, CheckCircle2, Eye, AlertCircle, Loader2, Maximize } from 'lucide-react';
import { StudentQuizItemDTO } from '@/lib/types/dashboard';
import { LessonPdfViewer } from '@/components/lessons/LessonPdfViewer';

interface ExamViewerModalProps {
  quiz: StudentQuizItemDTO | null;
  onClose: () => void;
  onSubmitPaper?: (file: File) => Promise<void>;
}

export function ExamViewerModal({ quiz, onClose, onSubmitPaper }: ExamViewerModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'paper' | 'submit'>('paper');

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-chalk">
                {quiz.title}
              </h3>
              <p className="text-[11px] text-chalk-muted font-bold">
                {quiz.branchName} • ورقة امتحان وشيت تدريبي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('paper')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'paper'
                    ? 'bg-cyan-electric text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>ورقة الامتحان</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'submit'
                    ? 'bg-cyan-electric text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>تسليم الحل</span>
              </button>
            </div>

            <Link
              href={`/exams/${quiz.id}`}
              className="p-2 rounded-xl text-cyan-electric hover:bg-cyan-electric/10 text-xs font-bold transition-colors hidden sm:flex items-center gap-1"
              title="فتح في شاشة مستقلة"
            >
              <Maximize className="w-4 h-4" />
              <span>شاشة مستقلة</span>
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-chalk hover:bg-slate-800 transition-colors"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col p-2 sm:p-4">
          {activeTab === 'paper' ? (
            <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800">
              {quiz.pdfPath ? (
                <LessonPdfViewer
                  pdfUrl={quiz.pdfPath}
                  title={quiz.title}
                  allowDownload={false}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8 text-slate-400">
                  <p>لا يتوفر ملف PDF لهذا الامتحان حالياً.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-xl mx-auto w-full my-auto p-6 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-5">
              <div className="space-y-1 text-center">
                <h4 className="text-base font-black text-chalk flex items-center justify-center gap-2">
                  <UploadCloud className="w-5 h-5 text-cyan-electric" />
                  <span>تسليم إجابتك أو صورة الحل للمراجعة</span>
                </h4>
                <p className="text-xs text-chalk-muted">
                  ارفع صورة ورقة الحل أو ملف PDF وسيتم تصحيحها وإرسال النتيجة لولي الأمر
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-base font-black text-chalk">
                    تم تسليم ورقة الإجابة بنجاح!
                  </h4>
                  <p className="text-xs text-chalk-muted max-w-md mx-auto">
                    سيتم مراجعة إجابتك وتصحيحها بواسطة م/ رضا خيرت وإرسال التقرير لولي الأمر.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <label className="block p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-electric bg-slate-950 text-center cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <UploadCloud className="w-10 h-10 text-cyan-electric mx-auto mb-2" />
                    <span className="text-xs font-bold text-chalk block">
                      {selectedFile ? selectedFile.name : 'اضغط لاختيار صورة الحل أو ملف PDF من جهازك'}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      صيغ مدعومة: JPG, PNG, PDF (بحد أقصى 15 ميجابايت)
                    </span>
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('paper')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-chalk-muted hover:bg-slate-800 transition-colors"
                    >
                      العودة للورقة
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
          )}
        </div>
      </div>
    </div>
  );
}
