/**
 * Challenger M4.1 Empirical Test Suite
 * Validates:
 * 1. Attempt bounds logic: COUNT(*) + 1 <= max_attempts
 * 2. Exam grading calculations (MCQ, True/False, partial scores, percentage, pass/fail status)
 * 3. Question sanitization (ensuring correct_answer and explanation are omitted before submission)
 * 4. Boundary and adversarial scenarios
 */

import assert from 'assert';

console.log('====================================================');
console.log('🚀 RUNNING CHALLENGER M4.1 EMPIRICAL TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err: unknown) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    failedTests++;
  }
}

// ---------------------------------------------------------
// SECTION 1: ATTEMPT BOUNDS LOGIC EMPIRICAL VERIFICATION
// ---------------------------------------------------------
console.log('--- SECTION 1: ATTEMPT BOUNDS LOGIC ---');

function computeAttemptState(priorAttemptsCount: number, maxAttempts: number) {
  const currentAttemptNumber = priorAttemptsCount + 1;
  const isAllowed = currentAttemptNumber <= maxAttempts;
  const attemptsRemaining = Math.max(0, maxAttempts - currentAttemptNumber + 1);
  return { currentAttemptNumber, isAllowed, attemptsRemaining };
}

test('Attempt Bounds: 1st attempt with maxAttempts=3 is allowed, remaining=3', () => {
  const state = computeAttemptState(0, 3);
  assert.strictEqual(state.currentAttemptNumber, 1);
  assert.strictEqual(state.isAllowed, true);
  assert.strictEqual(state.attemptsRemaining, 3);
});

test('Attempt Bounds: 2nd attempt with maxAttempts=3 is allowed, remaining=2', () => {
  const state = computeAttemptState(1, 3);
  assert.strictEqual(state.currentAttemptNumber, 2);
  assert.strictEqual(state.isAllowed, true);
  assert.strictEqual(state.attemptsRemaining, 2);
});

test('Attempt Bounds: 3rd attempt with maxAttempts=3 is allowed (last attempt), remaining=1', () => {
  const state = computeAttemptState(2, 3);
  assert.strictEqual(state.currentAttemptNumber, 3);
  assert.strictEqual(state.isAllowed, true);
  assert.strictEqual(state.attemptsRemaining, 1);
});

test('Attempt Bounds: 4th attempt with maxAttempts=3 is REJECTED, remaining=0', () => {
  const state = computeAttemptState(3, 3);
  assert.strictEqual(state.currentAttemptNumber, 4);
  assert.strictEqual(state.isAllowed, false);
  assert.strictEqual(state.attemptsRemaining, 0);
});

test('Attempt Bounds: maxAttempts=1 single-shot exam behavior', () => {
  const first = computeAttemptState(0, 1);
  assert.strictEqual(first.currentAttemptNumber, 1);
  assert.strictEqual(first.isAllowed, true);
  assert.strictEqual(first.attemptsRemaining, 1);

  const second = computeAttemptState(1, 1);
  assert.strictEqual(second.currentAttemptNumber, 2);
  assert.strictEqual(second.isAllowed, false);
  assert.strictEqual(second.attemptsRemaining, 0);
});

test('Attempt Bounds: edge case with high attempt count', () => {
  const state = computeAttemptState(10, 3);
  assert.strictEqual(state.currentAttemptNumber, 11);
  assert.strictEqual(state.isAllowed, false);
  assert.strictEqual(state.attemptsRemaining, 0);
});

// ---------------------------------------------------------
// SECTION 2: EXAM GRADING & SCORE CALCULATION
// ---------------------------------------------------------
console.log('\n--- SECTION 2: EXAM GRADING CALCULATIONS ---');

interface QuestionSpec {
  id: string;
  questionText: string;
  questionLatex?: string | null;
  imageUrl?: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionType: 'MCQ' | 'TRUE_FALSE';
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation?: string | null;
}

function gradeQuiz(
  questions: QuestionSpec[],
  studentAnswers: { questionId: string; selectedAnswer: string }[],
  passScorePercentage: number
) {
  let correctCount = 0;
  const breakdown = questions.map((q) => {
    const studentAns = studentAnswers.find((a) => a.questionId === q.id);
    const selected = studentAns?.selectedAnswer || '';
    const isCorrect = selected.trim() !== '' && selected.trim() === q.correctAnswer.trim();
    if (isCorrect) correctCount++;

    return {
      questionId: q.id,
      questionText: q.questionText,
      questionLatex: q.questionLatex,
      imageUrl: q.imageUrl,
      selectedAnswer: selected,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const totalQuestions = Math.max(1, questions.length);
  const score = correctCount * 10;
  const maxScore = totalQuestions * 10;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= passScorePercentage;

  return {
    score,
    maxScore,
    percentage,
    passed,
    breakdown,
  };
}

const SAMPLE_QUESTIONS: QuestionSpec[] = [
  {
    id: 'q1',
    questionText: 'أي من الأعداد التالية ينتمي إلى ن؟',
    questionLatex: '\\frac{3}{5} \\in \\mathbb{Q}',
    difficulty: 'EASY',
    questionType: 'MCQ',
    options: [
      { label: 'A', text: '5/0' },
      { label: 'B', text: '3/4' },
      { label: 'C', text: '√(-4)' },
      { label: 'D', text: '0/0' },
    ],
    correctAnswer: 'B',
    explanation: 'العدد 3/4 نسبي لأن مقامه لا يساوي صفراً.',
  },
  {
    id: 'q2',
    questionText: 'الزاويتان المتتامتان مجموع قياسهما 90 درجة.',
    difficulty: 'EASY',
    questionType: 'TRUE_FALSE',
    options: [
      { label: 'A', text: 'صواب' },
      { label: 'B', text: 'خطأ' },
    ],
    correctAnswer: 'A',
    explanation: 'المتتامتان 90 والمتكاملتان 180.',
  },
  {
    id: 'q3',
    questionText: 'فيثاغورس: مربع طول الوتر يساوي مجموع مربعي ضلعي القائمة.',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    options: [
      { label: 'A', text: 'مجموع المربعين' },
      { label: 'B', text: 'الفرق بين المربعين' },
    ],
    correctAnswer: 'A',
    explanation: 'نظرية فيثاغورس الأساسية.',
  },
  {
    id: 'q4',
    questionText: 'جا 30 = 0.5',
    difficulty: 'HARD',
    questionType: 'TRUE_FALSE',
    options: [
      { label: 'A', text: 'صواب' },
      { label: 'B', text: 'خطأ' },
    ],
    correctAnswer: 'A',
    explanation: 'sin(30) = 0.5',
  },
];

test('Grading: 100% perfect score (4/4 correct) -> 40/40, 100%, passed=true', () => {
  const answers = [
    { questionId: 'q1', selectedAnswer: 'B' },
    { questionId: 'q2', selectedAnswer: 'A' },
    { questionId: 'q3', selectedAnswer: 'A' },
    { questionId: 'q4', selectedAnswer: 'A' },
  ];
  const result = gradeQuiz(SAMPLE_QUESTIONS, answers, 50);
  assert.strictEqual(result.score, 40);
  assert.strictEqual(result.maxScore, 40);
  assert.strictEqual(result.percentage, 100);
  assert.strictEqual(result.passed, true);
  assert.strictEqual(result.breakdown.every((b) => b.isCorrect), true);
});

test('Grading: 50% boundary score (2/4 correct) with passScore=50 -> 20/40, 50%, passed=true', () => {
  const answers = [
    { questionId: 'q1', selectedAnswer: 'B' }, // correct
    { questionId: 'q2', selectedAnswer: 'B' }, // wrong (correct is A)
    { questionId: 'q3', selectedAnswer: 'A' }, // correct
    { questionId: 'q4', selectedAnswer: 'B' }, // wrong (correct is A)
  ];
  const result = gradeQuiz(SAMPLE_QUESTIONS, answers, 50);
  assert.strictEqual(result.score, 20);
  assert.strictEqual(result.maxScore, 40);
  assert.strictEqual(result.percentage, 50);
  assert.strictEqual(result.passed, true);
  assert.strictEqual(result.breakdown[0].isCorrect, true);
  assert.strictEqual(result.breakdown[1].isCorrect, false);
  assert.strictEqual(result.breakdown[2].isCorrect, true);
  assert.strictEqual(result.breakdown[3].isCorrect, false);
});

test('Grading: Failing score (1/4 correct) with passScore=50 -> 10/40, 25%, passed=false', () => {
  const answers = [
    { questionId: 'q1', selectedAnswer: 'B' }, // correct
    { questionId: 'q2', selectedAnswer: 'B' }, // wrong
    { questionId: 'q3', selectedAnswer: 'B' }, // wrong
    { questionId: 'q4', selectedAnswer: 'B' }, // wrong
  ];
  const result = gradeQuiz(SAMPLE_QUESTIONS, answers, 50);
  assert.strictEqual(result.score, 10);
  assert.strictEqual(result.maxScore, 40);
  assert.strictEqual(result.percentage, 25);
  assert.strictEqual(result.passed, false);
});

test('Grading: Empty / Unanswered submissions -> 0/40, 0%, passed=false', () => {
  const answers: { questionId: string; selectedAnswer: string }[] = [];
  const result = gradeQuiz(SAMPLE_QUESTIONS, answers, 50);
  assert.strictEqual(result.score, 0);
  assert.strictEqual(result.maxScore, 40);
  assert.strictEqual(result.percentage, 0);
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.breakdown.every((b) => !b.isCorrect), true);
  assert.strictEqual(result.breakdown.every((b) => b.selectedAnswer === ''), true);
});

test('Grading: Whitespace resilience in selected answers', () => {
  const answers = [
    { questionId: 'q1', selectedAnswer: '  B  ' },
    { questionId: 'q2', selectedAnswer: 'A' },
    { questionId: 'q3', selectedAnswer: ' A ' },
    { questionId: 'q4', selectedAnswer: 'A' },
  ];
  const result = gradeQuiz(SAMPLE_QUESTIONS, answers, 50);
  assert.strictEqual(result.score, 40);
  assert.strictEqual(result.percentage, 100);
});

test('Grading: Percentage rounding with 3 questions (1/3 correct -> 33%, 2/3 -> 67%)', () => {
  const threeQuestions = SAMPLE_QUESTIONS.slice(0, 3);
  const oneCorrect = gradeQuiz(threeQuestions, [{ questionId: 'q1', selectedAnswer: 'B' }], 50);
  assert.strictEqual(oneCorrect.score, 10);
  assert.strictEqual(oneCorrect.maxScore, 30);
  assert.strictEqual(oneCorrect.percentage, 33);
  assert.strictEqual(oneCorrect.passed, false);

  const twoCorrect = gradeQuiz(
    threeQuestions,
    [
      { questionId: 'q1', selectedAnswer: 'B' },
      { questionId: 'q2', selectedAnswer: 'A' },
    ],
    50
  );
  assert.strictEqual(twoCorrect.score, 20);
  assert.strictEqual(twoCorrect.maxScore, 30);
  assert.strictEqual(twoCorrect.percentage, 67);
  assert.strictEqual(twoCorrect.passed, true);
});

// ---------------------------------------------------------
// SECTION 3: QUESTION SANITIZATION SECURITY VERIFICATION
// ---------------------------------------------------------
console.log('\n--- SECTION 3: QUESTION SANITIZATION FOR STUDENTS ---');

function sanitizeQuestionsForStudent(rawDbQuestions: QuestionSpec[]) {
  return rawDbQuestions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    questionLatex: q.questionLatex,
    imageUrl: q.imageUrl,
    difficulty: q.difficulty,
    questionType: q.questionType,
    options: q.options,
  }));
}

test('Sanitization: Output omits correctAnswer, correct_answer, and explanation', () => {
  const sanitized = sanitizeQuestionsForStudent(SAMPLE_QUESTIONS);

  sanitized.forEach((q) => {
    // Assert keys do not exist on the object
    const keys = Object.keys(q);
    assert.strictEqual(keys.includes('correctAnswer'), false, 'correctAnswer leaked!');
    assert.strictEqual(keys.includes('correct_answer'), false, 'correct_answer leaked!');
    assert.strictEqual(keys.includes('explanation'), false, 'explanation leaked!');
    assert.strictEqual((q as unknown as { correctAnswer?: string }).correctAnswer, undefined);
    assert.strictEqual((q as unknown as { explanation?: string }).explanation, undefined);
  });

  // Verify JSON stringified payload transmitted over network does not contain answers
  const jsonPayload = JSON.stringify(sanitized);
  assert.strictEqual(jsonPayload.includes('correctAnswer'), false);
  assert.strictEqual(jsonPayload.includes('explanation'), false);
  assert.strictEqual(jsonPayload.includes('العدد 3/4 نسبي'), false, 'Explanation text leaked in payload!');
});

test('Sanitization: Preserves question text, latex formulas, images, and options', () => {
  const sanitized = sanitizeQuestionsForStudent(SAMPLE_QUESTIONS);
  assert.strictEqual(sanitized.length, 4);
  assert.strictEqual(sanitized[0].id, 'q1');
  assert.strictEqual(sanitized[0].questionText, 'أي من الأعداد التالية ينتمي إلى ن؟');
  assert.strictEqual(sanitized[0].questionLatex, '\\frac{3}{5} \\in \\mathbb{Q}');
  assert.strictEqual(sanitized[0].options.length, 4);
  assert.strictEqual(sanitized[1].questionType, 'TRUE_FALSE');
  assert.strictEqual(sanitized[1].options.length, 2);
});

// ---------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------
console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
}
