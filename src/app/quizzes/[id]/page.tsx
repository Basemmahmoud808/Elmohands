'use client';

import React from 'react';
import DedicatedExamPage from '@/app/exams/[id]/page';

export default function QuizPageWrapper({ params }: { params: { id: string } }) {
  return <DedicatedExamPage params={params} />;
}
