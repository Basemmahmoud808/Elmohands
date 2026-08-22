'use client';

import React, { useState } from 'react';
import { CurriculumGradeDTO, CurriculumLessonDTO } from '@/lib/types/dashboard';
import { createLessonAction, createUnitAction, deleteLessonAction, toggleLessonPublishAction } from '@/lib/actions/courses';
import { updateLessonAction, LessonItem } from '@/lib/actions/lessons';
import { uploadRealFileWithProgress } from '@/lib/supabase/storage';
import { UploadProgressBar } from './UploadProgressBar';
import {
  Video,
  Plus,
  UploadCloud,
  Link2,
  FileText,
  Image as ImageIcon,
  Clock,
  Play,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  Edit,
  X,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

interface LessonsManagementTabProps {
  curriculum: CurriculumGradeDTO[];
  onRefresh?: () => void;
  onPreviewMedia: (media: { type: 'video' | 'pdf' | 'exam'; title: string; url: string }) => void;
}

export function LessonsManagementTab({
  curriculum,
  onRefresh,
  onPreviewMedia,
}: LessonsManagementTabProps) {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState(curriculum[0]?.id || '');
  const [selectedTermId, setSelectedTermId] = useState(curriculum[0]?.terms[0]?.id || '');
  const [selectedBranchId, setSelectedBranchId] = useState(curriculum[0]?.terms[0]?.branches[0]?.id || '');
  const [selectedUnitId, setSelectedUnitId] = useState(curriculum[0]?.terms[0]?.branches[0]?.units[0]?.id || '');
  const [quickUnitTitle, setQuickUnitTitle] = useState('');
  const [quickUnitLoading, setQuickUnitLoading] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [sortOrder, setSortOrder] = useState(1);
  const [isLocked, setIsLocked] = useState(false);

  // Media Source Mode: 'file' | 'url'
  const [videoMode, setVideoMode] = useState<'file' | 'url'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  const [pdfMode, setPdfMode] = useState<'file' | 'url'>('url');
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);

  const [thumbMode, setThumbMode] = useState<'file' | 'url'>('file');
  const [thumbnailUrl, setThumbnailUrl] = useState('/teacher_reda_kheyrat.jpg');
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);

  // Edit Lesson Modal State
  const [editingLesson, setEditingLesson] = useState<{
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    videoPath: string;
    pdfPath: string;
    thumbnailPath: string;
    sortOrder: number;
    isLocked: boolean;
    isPublished: boolean;
  } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Upload Progress
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Cascade selections
  const currentGrade = curriculum.find((g) => g.id === selectedGradeId) || curriculum[0];
  const terms = currentGrade?.terms || [];
  const currentTerm = terms.find((t) => t.id === selectedTermId) || terms[0];
  const branches = currentTerm?.branches || [];
  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const units = currentBranch?.units || [];

  // Extract all lessons
  const allLessons: Array<CurriculumLessonDTO & { gradeName: string; branchName: string; unitTitle: string }> = [];
  curriculum.forEach((g) => {
    g.terms.forEach((t) => {
      t.branches.forEach((b) => {
        b.units.forEach((u) => {
          u.lessons.forEach((l) => {
            allLessons.push({
              ...l,
              gradeName: g.name,
              branchName: b.name,
              unitTitle: u.title,
            });
          });
        });
      });
    });
  });

  const handleQuickCreateUnit = async () => {
    if (!quickUnitTitle.trim()) {
      setFeedbackMsg({ success: false, text: 'يرجى كتابة عنوان للوحدة أولاً' });
      return;
    }
    setQuickUnitLoading(true);
    try {
      const res = await createUnitAction({
        branchId: selectedBranchId || currentBranch?.id || '',
        title: quickUnitTitle.trim(),
      });
      if (res.success && res.data) {
        setSelectedUnitId(res.data);
        setQuickUnitTitle('');
        setFeedbackMsg({ success: true, text: 'تم إنشاء الوحدة بنجاح! يمكنك الآن نشر الدرس.' });
        if (onRefresh) onRefresh();
      } else {
        const errText = !res.success ? res.error : 'فشل إنشاء الوحدة';
        setFeedbackMsg({ success: false, text: errText || 'فشل إنشاء الوحدة' });
      }
    } catch {
      setFeedbackMsg({ success: false, text: 'حدث خطأ أثناء إنشاء الوحدة' });
    } finally {
      setQuickUnitLoading(false);
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedbackMsg({ success: false, text: 'يرجى كتابة عنوان الدرس أولاً' });
      return;
    }

    let targetUnitId = selectedUnitId;
    if (!targetUnitId && units.length > 0) {
      targetUnitId = units[0].id;
    }

    if (!targetUnitId) {
      if (quickUnitTitle.trim()) {
        const uRes = await createUnitAction({
          branchId: selectedBranchId || currentBranch?.id || '',
          title: quickUnitTitle.trim(),
        });
        if (uRes.success && uRes.data) {
          targetUnitId = uRes.data;
        } else {
          const uErr = !uRes.success ? uRes.error : 'يرجى إنشاء وحدة دراسية أولاً للدرس';
          setFeedbackMsg({ success: false, text: uErr || 'يرجى إنشاء وحدة دراسية أولاً للدرس' });
          return;
        }
      } else {
        setFeedbackMsg({
          success: false,
          text: 'لا توجد وحدات دراسية مسجلة في هذا الفرع. يرجى كتابة اسم وحدة جديدة لإنشائها أولاً.',
        });
        return;
      }
    }

    setFeedbackMsg(null);
    setUploadProgress(10);
    setUploadLabel('جاري تجهيز ملفات الدرس...');

    try {
      let finalVideoUrl = videoUrl;
      let finalPdfUrl = pdfUrl;
      let finalThumbUrl = thumbnailUrl;

      if (videoMode === 'file' && selectedVideoFile) {
        setUploadLabel('جاري رفع ملف الفيديو إلى سحابة التخزين...');
        finalVideoUrl = await uploadRealFileWithProgress(
          selectedVideoFile,
          'course-materials',
          'videos',
          (pct) => setUploadProgress(Math.round(10 + pct * 0.4))
        );
      }

      if (pdfMode === 'file' && selectedPdfFile) {
        setUploadLabel('جاري رفع ملف مذكرة PDF...');
        finalPdfUrl = await uploadRealFileWithProgress(
          selectedPdfFile,
          'course-materials',
          'worksheets',
          (pct) => setUploadProgress(Math.round(50 + pct * 0.3))
        );
      }

      if (selectedThumbnailFile) {
        setUploadLabel('جاري رفع الصورة المصغرة...');
        finalThumbUrl = await uploadRealFileWithProgress(
          selectedThumbnailFile,
          'course-materials',
          'thumbnails',
          (pct) => setUploadProgress(Math.round(80 + pct * 0.15))
        );
      }

      setUploadProgress(95);
      setUploadLabel('جاري حفظ الدرس ونشره للطلاب في قاعدة البيانات...');

      const actionRes = await createLessonAction({
        unitId: selectedUnitId,
        title: title.trim(),
        description: description.trim(),
        videoPath: finalVideoUrl,
        pdfPath: finalPdfUrl,
        thumbnailPath: finalThumbUrl,
        durationMinutes,
        sortOrder,
        isPublished: true,
        isLocked,
        minPassScore: 50,
      });

      setUploadProgress(100);

      if (actionRes.success) {
        setFeedbackMsg({
          success: true,
          text: 'تم رفع ونشر الدرس بنجاح للطلاب! ',
        });
        setTitle('');
        setDescription('');
        setSelectedVideoFile(null);
        setSelectedPdfFile(null);
        setSelectedThumbnailFile(null);

        if (onRefresh) onRefresh();
      } else {
        setFeedbackMsg({
          success: false,
          text: actionRes.error || 'حدث خطأ أثناء حفظ الدرس',
        });
      }
    } catch {
      setFeedbackMsg({
        success: false,
        text: 'فشلت عملية الرفع. يرجى المحاولة مجدداً.',
      });
    } finally {
      setTimeout(() => {
        setUploadProgress(null);
        setUploadLabel('');
      }, 1000);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    setEditLoading(true);
    try {
      const res = await updateLessonAction(editingLesson.id, {
        title: editingLesson.title.trim(),
        description: editingLesson.description.trim(),
        durationMinutes: editingLesson.durationMinutes,
        videoPath: editingLesson.videoPath,
        pdfPath: editingLesson.pdfPath,
        thumbnailPath: editingLesson.thumbnailPath,
        sequenceOrder: editingLesson.sortOrder,
        isLocked: editingLesson.isLocked,
        isPublished: editingLesson.isPublished,
      });

      if (res.success) {
        setEditingLesson(null);
        if (onRefresh) onRefresh();
      } else {
        alert(res.error || 'فشل تحديث الدرس');
      }
    } catch {
      alert('حدث خطأ أثناء تحديث الدرس');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الدرس نهائياً؟')) return;

    try {
      await deleteLessonAction(lessonId);
      if (onRefresh) onRefresh();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
          إدارة الدروس ورفع الفيديوهات والمذكرات
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
          رفع محاضرات الفيديو، إرفاق مذكرات PDF، ضبط الأقفال، وربطها بالهيكل التعليمي
        </p>
      </div>

      {/* Upload Progress Bar if active */}
      {uploadProgress !== null && (
        <UploadProgressBar progress={uploadProgress} label={uploadLabel} />
      )}

      {/* Lesson Creator Form */}
      <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
              نموذج إضافة ونشر درس جديد
            </h3>
            <span className="text-xs text-slate-500 dark:text-chalk-muted">
              يدعم رفع ملفات MP4 وسحابة Supabase Storage أو روابط Embed (YouTube, BunnyCDN, Vimeo, Drive)
            </span>
          </div>
        </div>

        <form onSubmit={handleLessonSubmit} className="space-y-5 text-xs font-bold">
          {/* Cascade Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">الصف الدراسي:</label>
              <select
                value={selectedGradeId}
                onChange={(e) => {
                  setSelectedGradeId(e.target.value);
                  const g = curriculum.find((x) => x.id === e.target.value);
                  const t = g?.terms[0];
                  setSelectedTermId(t?.id || '');
                  const b = t?.branches[0];
                  setSelectedBranchId(b?.id || '');
                  setSelectedUnitId(b?.units[0]?.id || '');
                }}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              >
                {curriculum.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">الترم الدراسي:</label>
              <select
                value={selectedTermId}
                onChange={(e) => {
                  setSelectedTermId(e.target.value);
                  const t = terms.find((x) => x.id === e.target.value);
                  const b = t?.branches[0];
                  setSelectedBranchId(b?.id || '');
                  setSelectedUnitId(b?.units[0]?.id || '');
                }}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">الفرع التعليمي:</label>
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  const b = branches.find((x) => x.id === e.target.value);
                  setSelectedUnitId(b?.units[0]?.id || '');
                }}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 dark:text-chalk block">الوحدة الدراسية:</label>
                {units.length === 0 && (
                  <span className="text-[10px] text-amber-500 font-bold">
                    (لا توجد وحدات - أنشئ واحدة)
                  </span>
                )}
              </div>
              {units.length === 0 ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="اكتب اسم الوحدة الجديدة..."
                    value={quickUnitTitle}
                    onChange={(e) => setQuickUnitTitle(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-amber-500/50 text-slate-900 dark:text-chalk text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleQuickCreateUnit}
                    disabled={quickUnitLoading}
                    className="px-3 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs shrink-0 flex items-center gap-1"
                  >
                    {quickUnitLoading ? '...' : 'إنشاء'}
                  </button>
                </div>
              ) : (
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Lesson Title, Duration & Sequence */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">عنوان الدرس والموضوع:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: الدرس الثالث: العمليات على الأعداد النسبية وتطبيقاتها"
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">المدة التقديرية (دقائق):</label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 45)}
                  className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">ترتيب الدرس (#):</label>
              <input
                type="number"
                min={1}
                max={50}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-slate-800 dark:text-chalk block">وصف الدرس والتمارين المرفقة:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب شرحاً مختصراً لمحتوى المحاضرة والمسائل المحلولة..."
              rows={2}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
            />
          </div>

          {/* Video Input Mode Switch */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-800 dark:text-chalk flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-electric" />
                <span>مصدر الفيديو:</span>
              </span>

              <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVideoMode('url')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    videoMode === 'url' ? 'bg-cyan-electric text-black shadow-cyan-glow' : 'text-slate-500 dark:text-chalk-muted'
                  }`}
                >
                  رابط خارجي / Embed
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('file')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    videoMode === 'file' ? 'bg-cyan-electric text-black shadow-cyan-glow' : 'text-slate-500 dark:text-chalk-muted'
                  }`}
                >
                  رفع ملف إلى السحابة
                </button>
              </div>
            </div>

            {videoMode === 'url' ? (
              <div className="relative">
                <input
                  type="url"
                  dir="ltr"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... أو BunnyCDN/MP4 URL"
                  className="w-full h-11 px-4 pl-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-xs focus:outline-none focus:border-cyan-electric"
                />
                <Link2 className="w-4 h-4 text-cyan-electric absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <label className="block p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center cursor-pointer hover:border-cyan-electric bg-white dark:bg-slate-900 transition-all">
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => setSelectedVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <UploadCloud className="w-6 h-6 text-cyan-electric mx-auto mb-1" />
                <span className="text-xs text-slate-800 dark:text-chalk block">
                  {selectedVideoFile ? selectedVideoFile.name : 'اضغط لاختيار ملف فيديو MP4 من جهازك'}
                </span>
              </label>
            )}
          </div>

          {/* Attachments: PDF Worksheet & Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PDF Mode */}
            <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 dark:text-chalk flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>مذكرة PDF المرفقة:</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPdfMode('url')}
                    className={`px-2 py-0.5 rounded ${pdfMode === 'url' ? 'bg-cyan-electric text-black' : 'text-slate-400'}`}
                  >
                    رابط
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfMode('file')}
                    className={`px-2 py-0.5 rounded ${pdfMode === 'file' ? 'bg-cyan-electric text-black' : 'text-slate-400'}`}
                  >
                    رفع ملف
                  </button>
                </div>
              </div>

              {pdfMode === 'url' ? (
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="/sample-lesson-notes.pdf"
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-xs focus:outline-none focus:border-cyan-electric"
                />
              ) : (
                <label className="block p-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center cursor-pointer hover:border-cyan-electric bg-white dark:bg-slate-900">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setSelectedPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-chalk truncate block">
                    {selectedPdfFile ? selectedPdfFile.name : 'اختر ملف PDF من جهازك'}
                  </span>
                </label>
              )}
            </div>

            {/* Thumbnail / Cover Image */}
            <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 dark:text-chalk flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-cyan-electric" />
                  <span>صورة غلاف / واجهة الدرس:</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setThumbMode('file')}
                    className={`px-2 py-0.5 rounded ${thumbMode === 'file' ? 'bg-cyan-electric text-black font-bold' : 'text-slate-400'}`}
                  >
                    رفع صورة 
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbMode('url')}
                    className={`px-2 py-0.5 rounded ${thumbMode === 'url' ? 'bg-cyan-electric text-black font-bold' : 'text-slate-400'}`}
                  >
                    رابط 
                  </button>
                </div>
              </div>

              {thumbMode === 'file' ? (
                <label className="block p-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center cursor-pointer hover:border-cyan-electric bg-white dark:bg-slate-900 transition-colors">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => setSelectedThumbnailFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-chalk truncate block">
                    {selectedThumbnailFile ? ` ${selectedThumbnailFile.name}` : 'اضغط لاختيار صورة من جهازك (PNG, JPG)'}
                  </span>
                </label>
              ) : (
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="/teacher_reda_kheyrat.jpg أو رابط صورة خارجي"
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-xs focus:outline-none focus:border-cyan-electric"
                />
              )}
            </div>
          </div>

          {/* Locked vs Free Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-cyan-electric focus:ring-cyan-electric accent-cyan-electric"
              />
              <span className="text-slate-800 dark:text-chalk text-xs font-bold">
                قفل الدرس (يتطلب اشتراكاً نشطاً) — اتركه فارغاً لجعله عينة مجانية متاحة للجميع
              </span>
            </label>
          </div>

          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                feedbackMsg.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-red-500/10 border-red-500/30 text-red-500'
              }`}
            >
              {feedbackMsg.success ? <CheckCircle2 className="w-4 h-4" /> : null}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={uploadProgress !== null || !title.trim()}
              className="px-8 py-3.5 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover disabled:opacity-50 shadow-cyan-glow transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>نشر الدرس على المنصة الآن</span>
            </button>
          </div>
        </form>
      </div>

      {/* Published Lessons List */}
      <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
                قائمة الدروس والمحاضرات المنشورة
              </h3>
              <span className="text-xs text-slate-500 dark:text-chalk-muted">
                إجمالي الدروس: {allLessons.length} درساً
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {allLessons.map((les) => (
            <div
              key={les.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-cyan-electric/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-electric">
                    {les.gradeName} • {les.branchName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-500 dark:text-chalk-muted font-medium">
                    {les.unitTitle}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-chalk">
                  {les.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{les.durationMinutes} دقيقة</span>
                  </span>
                  <span className="text-slate-400">•</span>
                  {les.isLocked ? (
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>للمشتركين</span>
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>عينة مجانية</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {les.videoPath && (
                  <button
                    type="button"
                    onClick={() =>
                      onPreviewMedia({
                        type: 'video',
                        title: les.title,
                        url: les.videoPath || '',
                      })
                    }
                    className="p-2.5 rounded-xl text-xs font-bold text-cyan-electric bg-cyan-electric/10 hover:bg-cyan-electric/20 border border-cyan-electric/30 transition-all flex items-center gap-1.5"
                    title="معاينة الفيديو"
                  >
                    <Play className="w-4 h-4" />
                    <span>تشغيل</span>
                  </button>
                )}

                {les.pdfPath && (
                  <button
                    type="button"
                    onClick={() =>
                      onPreviewMedia({
                        type: 'pdf',
                        title: les.title,
                        url: les.pdfPath || '',
                      })
                    }
                    className="p-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-chalk bg-slate-200 dark:bg-slate-800 hover:border-cyan-electric border border-transparent transition-all flex items-center gap-1.5"
                    title="معاينة المذكرة"
                  >
                    <FileText className="w-4 h-4" />
                    <span>مذكرة</span>
                  </button>
                )}

                {/* Edit Lesson Button */}
                <button
                  type="button"
                  onClick={() =>
                    setEditingLesson({
                      id: les.id,
                      title: les.title,
                      description: les.description || '',
                      durationMinutes: les.durationMinutes,
                      videoPath: les.videoPath || '',
                      pdfPath: les.pdfPath || '',
                      thumbnailPath: les.thumbnailPath || '/teacher_reda_kheyrat.jpg',
                      sortOrder: les.sortOrder || 1,
                      isLocked: Boolean(les.isLocked),
                      isPublished: les.isPublished !== false,
                    })
                  }
                  className="p-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                  title="تعديل بيانات الدرس"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteLesson(les.id)}
                  className="p-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all"
                  title="حذف الدرس"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-black text-chalk">تعديل بيانات وميديا الدرس</h3>
              <button
                onClick={() => setEditingLesson(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-bold">
              <div className="space-y-1.5">
                <label className="text-chalk block">عنوان الدرس:</label>
                <input
                  type="text"
                  required
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-700 text-chalk"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-chalk block">المدة (دقائق):</label>
                  <input
                    type="number"
                    value={editingLesson.durationMinutes}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, durationMinutes: Number(e.target.value) || 45 })
                    }
                    className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-700 text-chalk"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-chalk block">ترتيب الدرس:</label>
                  <input
                    type="number"
                    value={editingLesson.sortOrder}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, sortOrder: Number(e.target.value) || 1 })
                    }
                    className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-700 text-chalk"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-chalk block">رابط الفيديو (Embed / MP4):</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingLesson.videoPath}
                  onChange={(e) => setEditingLesson({ ...editingLesson, videoPath: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-700 text-chalk font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-chalk block">رابط مذكرة PDF:</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingLesson.pdfPath}
                  onChange={(e) => setEditingLesson({ ...editingLesson, pdfPath: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-700 text-chalk font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-chalk text-xs">
                  <input
                    type="checkbox"
                    checked={editingLesson.isLocked}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, isLocked: e.target.checked })
                    }
                    className="w-4 h-4 accent-cyan-electric"
                  />
                  <span>قفل الدرس للمشتركين فقط</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-chalk text-xs">
                  <input
                    type="checkbox"
                    checked={editingLesson.isPublished}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, isPublished: e.target.checked })
                    }
                    className="w-4 h-4 accent-cyan-electric"
                  />
                  <span>منشور ومرئي للطلاب</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-cyan-electric text-slate-950 font-black shadow-cyan-glow"
                >
                  {editLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
