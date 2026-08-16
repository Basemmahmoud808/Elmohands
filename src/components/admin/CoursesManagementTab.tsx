'use client';

import React, { useState } from 'react';
import { CurriculumGradeDTO } from '@/lib/types/dashboard';
import { createUnitAction } from '@/lib/actions/courses';
import {
  BookOpen,
  Layers,
  Plus,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Video,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface CoursesManagementTabProps {
  initialCurriculum: CurriculumGradeDTO[];
  onRefresh?: () => void;
}

export function CoursesManagementTab({ initialCurriculum, onRefresh }: CoursesManagementTabProps) {
  const [curriculum, setCurriculum] = useState<CurriculumGradeDTO[]>(initialCurriculum);
  const [selectedGradeId, setSelectedGradeId] = useState<string>(initialCurriculum[0]?.id || '');
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  // Unit creation modal state
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedGrade = curriculum.find((g) => g.id === selectedGradeId) || curriculum[0];
  const terms = selectedGrade?.terms || [];
  const currentTerm = terms.find((t) => t.id === selectedTermId) || terms[0];

  const handleOpenAddUnit = (branchId: string) => {
    setSelectedBranchId(branchId);
    setNewUnitTitle('');
    setNewUnitDesc('');
    setIsAddUnitOpen(true);
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim() || !selectedBranchId) return;

    setLoading(true);
    try {
      const res = await createUnitAction({
        branchId: selectedBranchId,
        title: newUnitTitle.trim(),
        description: newUnitDesc.trim() || undefined,
      });

      if (res.success) {
        setIsAddUnitOpen(false);
        // Refresh local tree
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            هيكل المناهج والصفوف الدراسية
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
            إدارة الشجرة التعليمية المصرية (الصفوف ➔ الترم ➔ الفروع ➔ الوحدات ➔ الدروس)
          </p>
        </div>
      </div>

      {/* Grade Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {curriculum.map((grade) => (
          <button
            key={grade.id}
            onClick={() => {
              setSelectedGradeId(grade.id);
              setSelectedTermId(grade.terms[0]?.id || '');
            }}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              selectedGrade?.id === grade.id
                ? 'bg-cyan-electric text-black shadow-cyan-glow'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-chalk/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-electric/50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{grade.name}</span>
          </button>
        ))}
      </div>

      {/* Terms Sub-tabs */}
      {terms.length > 0 && (
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          {terms.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTermId(t.id)}
              className={`pb-2 px-4 text-xs sm:text-sm font-extrabold transition-all relative ${
                currentTerm?.id === t.id
                  ? 'text-cyan-electric border-b-2 border-cyan-electric'
                  : 'text-slate-500 dark:text-chalk-muted hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Branches and Units */}
      <div className="space-y-6">
        {(currentTerm?.branches || []).map((branch) => (
          <div
            key={branch.id}
            className="chalk-card rounded-3xl p-6 sm:p-7 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
                    {branch.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-chalk-muted">
                    {branch.units.length} وحدات دراسية مسجلة
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenAddUnit(branch.id)}
                className="px-4 py-2 rounded-xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة وحدة جديدة</span>
              </button>
            </div>

            {/* Units Grid */}
            {branch.units.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-slate-500 dark:text-chalk-muted">
                لا توجد وحدات في هذا الفرع بعد. اضغط على زر &quot;إضافة وحدة جديدة&quot; للبدء.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branch.units.map((unit, uIdx) => (
                  <div
                    key={unit.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-cyan-electric block">
                          الوحدة #{uIdx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-chalk">
                          {unit.title}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-electric/10 text-cyan-electric border border-cyan-electric/30">
                        {unit.lessons.length} دروس
                      </span>
                    </div>

                    {unit.description && (
                      <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed line-clamp-2">
                        {unit.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-amber-500" />
                        <span>{unit.lessons.length} فيديو متاح</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Unit Modal */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-electric/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-chalk">
                إضافة وحدة دراسية جديدة
              </h3>
              <button
                onClick={() => setIsAddUnitOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-chalk"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-4 text-xs font-bold">
              <div className="space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">عنوان الوحدة:</label>
                <input
                  type="text"
                  required
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  placeholder="مثال: الوحدة الثالثة: الإحصاء والاحتمال"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">وصف المحتوى (اختياري):</label>
                <textarea
                  value={newUnitDesc}
                  onChange={(e) => setNewUnitDesc(e.target.value)}
                  placeholder="أدخل ملخصاً أو أهداف الوحدة التعليمية..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading || !newUnitTitle.trim()}
                  className="px-6 py-2.5 rounded-xl font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover disabled:opacity-50 shadow-cyan-glow flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حفظ الوحدة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
