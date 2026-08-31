'use client';

import React, { useState } from 'react';
import { AdminStudentDTO } from '@/lib/types/dashboard';
import { toggleStudentActiveStatusAction } from '@/lib/actions/admin';
import { StudentDetailModal } from './StudentDetailModal';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Filter,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';

interface StudentsManagementTabProps {
  initialStudents: AdminStudentDTO[];
}

export function StudentsManagementTab({ initialStudents }: StudentsManagementTabProps) {
  const [students, setStudents] = useState<AdminStudentDTO[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentDTO | null>(null);

  const handleToggleStatus = async (studentId: string, newActiveState: boolean) => {
    // Optimistic update
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isActive: newActiveState } : s))
    );
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, isActive: newActiveState });
    }

    try {
      await toggleStudentActiveStatusAction(studentId, newActiveState);
    } catch {
      // Revert on error
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, isActive: !newActiveState } : s))
      );
    }
  };

  const filteredStudents = students.filter((std) => {
    const matchesSearch =
      !search.trim() ||
      std.fullName.toLowerCase().includes(search.toLowerCase()) ||
      std.phone.includes(search) ||
      (std.parentPhone && std.parentPhone.includes(search)) ||
      (std.email && std.email.toLowerCase().includes(search.toLowerCase()));

    const matchesGrade = gradeFilter === 'all' || (std.gradeName && std.gradeName.includes(gradeFilter));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && std.isActive) ||
      (statusFilter === 'inactive' && !std.isActive);

    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            إدارة حسابات الطلاب
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
            البحث في قاعدة بيانات الطلاب، تتبع الاشتراكات، وتفعيل أو تعطيل الحسابات
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {students.filter((s) => !s.isActive).length > 0 && (
            <button
              onClick={() => setStatusFilter('inactive')}
              className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse hover:bg-amber-500/25 transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>بانتظار موافقتك: {students.filter((s) => !s.isActive).length}</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-cyan-electric/10 text-cyan-electric border border-cyan-electric/30">
            <Users className="w-4 h-4" />
            <span>إجمالي الطلاب: {students.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم، هاتف الطالب، أو هاتف ولي الأمر..."
            className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk placeholder:text-slate-400 focus:outline-none focus:border-cyan-electric"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="sm:col-span-3">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
          >
            <option value="all">جميع الصفوف الدراسية</option>
            <option value="الأول الإعدادي">الصف الأول الإعدادي</option>
            <option value="الثاني الإعدادي">الصف الثاني الإعدادي</option>
            <option value="الثالث الإعدادي">الصف الثالث الإعدادي</option>
            <option value="الأول الثانوي">الصف الأول الثانوي</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">الحسابات المفعلة فقط</option>
            <option value="inactive">بانتظار موافقة الأدمن ({students.filter((s) => !s.isActive).length})</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 overflow-x-auto">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-chalk">
              لم يتم العثور على طلاب يطابقون شروط البحث
            </h3>
            <p className="text-xs text-slate-500 dark:text-chalk-muted">
              جرّب تغيير كلمات البحث أو إعادة ضبط فلاتر التصفية.
            </p>
          </div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-500 dark:text-chalk-muted">
                <th className="pb-3 px-3">الطالب</th>
                <th className="pb-3 px-3">الصف الدراسي</th>
                <th className="pb-3 px-3">حالة الاشتراك</th>
                <th className="pb-3 px-3 text-center">حالة الحساب</th>
                <th className="pb-3 px-3 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
                >
                  {/* Name and Phone */}
                  <td className="py-4 px-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-chalk block">
                        {student.fullName}
                      </span>
                      <span className="font-mono text-xs text-slate-500 dark:text-chalk-muted">
                        {student.phone}
                      </span>
                    </div>
                  </td>

                  {/* Grade */}
                  <td className="py-4 px-3 text-xs font-semibold text-slate-700 dark:text-chalk/90">
                    {student.gradeName || 'غير محدد'}
                  </td>

                  {/* Subscription Badge */}
                  <td className="py-4 px-3">
                    {student.hasActiveSubscription ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>نشط ({student.subscriptionPlanName || 'اشتراك'})</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        غير مشترك
                      </span>
                    )}
                  </td>

                  {/* Active Toggle Switch */}
                  <td className="py-4 px-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(student.id, !student.isActive)}
                      className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full transition-all border ${
                        student.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/20'
                      }`}
                    >
                      {student.isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>مفعل</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>موافقة وتفعيل</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-3 text-left">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-chalk bg-slate-100 dark:bg-slate-800 hover:bg-cyan-electric hover:text-black transition-all inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض وتعديل</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
