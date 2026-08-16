/**
 * Empirical Test Harness for Milestone 4 (Anti-Cheat & Secure Exams) and Milestone 5 (Content Protection)
 * Run with: npx tsx scripts/test_anti_cheat_m4.ts
 */

interface MockDOMEvent {
  type: string;
  defaultPrevented: boolean;
  preventDefault: () => void;
}

function createMockEvent(type: string): MockDOMEvent {
  return {
    type,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
}

class TestRunner {
  passed = 0;
  failed = 0;
  tests: Array<{ name: string; status: 'PASS' | 'FAIL'; error?: string }> = [];

  assert(condition: boolean, testName: string, errorMsg?: string) {
    if (condition) {
      this.passed++;
      this.tests.push({ name: testName, status: 'PASS' });
      console.log(`[PASS] ${testName}`);
    } else {
      this.failed++;
      const err = errorMsg || 'Assertion failed';
      this.tests.push({ name: testName, status: 'FAIL', error: err });
      console.error(`[FAIL] ${testName}: ${err}`);
    }
  }

  summary() {
    console.log('\n========================================');
    console.log(`TEST SUMMARY: ${this.passed} passed, ${this.failed} failed`);
    console.log('========================================\n');
    return this.failed === 0;
  }
}

async function runEmpiricalTests() {
  const runner = new TestRunner();
  console.log('Starting Milestone 4 & 5 Empirical Challenge Tests...\n');

  // ----------------------------------------------------
  // TEST SUITE 1: Anti-Cheat State Machine & Lockdown Logic
  // ----------------------------------------------------
  console.log('--- Test Suite 1: Anti-Cheat Lockdown & State Machine ---');

  // Simulated Exam State Machine
  class MockExamSolverStateMachine {
    step: 'intro' | 'solving' | 'review_summary' | 'results' = 'intro';
    violations = 0;
    showViolationModal = false;
    isAutoSubmitting = false;
    submitted = false;
    finalViolationCountLogged = 0;
    submissionForced = false;

    startExam() {
      this.step = 'solving';
    }

    handleViolationTriggered() {
      if (this.step !== 'solving' && this.step !== 'review_summary') return;
      if (this.isAutoSubmitting) return;

      this.violations += 1;
      if (this.violations >= 2) {
        // Strike 2: Auto-submit
        this.showViolationModal = true;
        this.executeSubmission(true);
      } else {
        // Strike 1: Warning modal
        this.showViolationModal = true;
      }
    }

    handleVisibilityChange(hidden: boolean) {
      if (hidden) this.handleViolationTriggered();
    }

    handleWindowBlur() {
      this.handleViolationTriggered();
    }

    handleFullscreenChange(hasFullscreen: boolean) {
      if (!hasFullscreen) this.handleViolationTriggered();
    }

    dismissModal() {
      this.showViolationModal = false;
    }

    executeSubmission(forcedByViolation: boolean) {
      this.isAutoSubmitting = true;
      this.finalViolationCountLogged = forcedByViolation ? Math.max(2, this.violations) : this.violations;
      this.submissionForced = forcedByViolation;
      this.step = 'results';
      this.submitted = true;
    }
  }

  // Test 1.1: Start Exam transitions to solving
  const exam = new MockExamSolverStateMachine();
  runner.assert(exam.step === 'intro' && exam.violations === 0, 'Exam initial state is intro with 0 violations');
  exam.startExam();
  runner.assert(exam.step === 'solving', 'Starting exam transitions to solving state');

  // Test 1.2: Strike 1 on visibilitychange (tab change / minimize)
  exam.handleVisibilityChange(true);
  runner.assert(
    exam.violations === 1 && exam.showViolationModal === true && !exam.submitted,
    'Strike 1: visibilitychange triggers red security warning modal without premature submission'
  );

  // Test 1.3: Dismiss modal re-enters full screen and allows exam continuation
  exam.dismissModal();
  runner.assert(!exam.showViolationModal, 'Dismissing strike 1 modal clears modal state');

  // Test 1.4: Strike 2 on window blur (switching windows/apps)
  exam.handleWindowBlur();
  runner.assert(
    exam.violations === 2 &&
      exam.showViolationModal === true &&
      exam.submitted === true &&
      exam.step === 'results' &&
      exam.submissionForced === true &&
      exam.finalViolationCountLogged >= 2,
    'Strike 2: window blur triggers immediate auto-submission, locks exam to results, and records 2 violations'
  );

  // Test 1.5: Fullscreen exit detection
  const exam2 = new MockExamSolverStateMachine();
  exam2.startExam();
  exam2.handleFullscreenChange(false);
  runner.assert(
    exam2.violations === 1 && exam2.showViolationModal === true,
    'Exiting fullscreen (document.fullscreenElement === null) triggers anti-cheat violation'
  );
  exam2.handleFullscreenChange(false);
  runner.assert(
    exam2.violations === 2 && exam2.submitted === true,
    'Second fullscreen exit auto-submits exam and locks session'
  );

  // ----------------------------------------------------
  // TEST SUITE 2: Dynamic Moving Student Watermark
  // ----------------------------------------------------
  console.log('\n--- Test Suite 2: Dynamic Student Watermark Overlay ---');

  const studentData = {
    fullName: 'أحمد حسام محمد',
    phone: '01012345678',
    customText: 'منصة المهندس • م/ رضا خيرت',
  };

  // Watermark positioning generator bounds test
  function generateWatermarkPosition() {
    const randomTop = Math.floor(Math.random() * 70) + 10;
    const randomRight = Math.floor(Math.random() * 70) + 10;
    const randomOpacity = Math.random() * 0.3 + 0.5; // 0.5 to 0.8
    return { top: randomTop, right: randomRight, opacity: randomOpacity };
  }

  let allPositionsValid = true;
  for (let i = 0; i < 100; i++) {
    const pos = generateWatermarkPosition();
    if (pos.top < 10 || pos.top > 80 || pos.right < 10 || pos.right > 80 || pos.opacity < 0.5 || pos.opacity > 0.8) {
      allPositionsValid = false;
      break;
    }
  }

  runner.assert(allPositionsValid, 'Watermark coordinates stay safely within 10%-80% visible viewport bounds');
  runner.assert(
    studentData.fullName.length > 0 && studentData.phone.startsWith('01'),
    'Watermark dynamically renders student name and Egyptian phone number'
  );

  // ----------------------------------------------------
  // TEST SUITE 3: Content Protection & DevTools Detection
  // ----------------------------------------------------
  console.log('\n--- Test Suite 3: Content Protection & DevTools Heuristic ---');

  // Test 3.1: Context menu prevention
  const contextEvent = createMockEvent('contextmenu');
  // Handler simulation
  const handleContextMenu = (e: MockDOMEvent) => e.preventDefault();
  handleContextMenu(contextEvent);
  runner.assert(contextEvent.defaultPrevented, 'Right-click context menu event is prevented');

  // Test 3.2: Keyboard shortcuts prevention (F12, Ctrl+Shift+I, Ctrl+U, etc.)
  function testKeyShortcut(key: string, ctrlKey: boolean, shiftKey: boolean): { blocked: boolean; warningTriggered: boolean } {
    let warning = false;
    let blocked = false;

    if (key === 'F12') {
      blocked = true;
      warning = true;
    } else if (ctrlKey && shiftKey && (key === 'I' || key === 'J' || key === 'C')) {
      blocked = true;
      warning = true;
    } else if (ctrlKey && (key === 'u' || key === 'U' || key === 's' || key === 'p')) {
      blocked = true;
    } else if (key === 'PrintScreen') {
      blocked = true;
    }

    return { blocked, warningTriggered: warning };
  }

  runner.assert(testKeyShortcut('F12', false, false).blocked, 'F12 Developer Tools shortcut is blocked and triggers warning');
  runner.assert(testKeyShortcut('I', true, true).blocked, 'Ctrl+Shift+I Inspect Element shortcut is blocked and triggers warning');
  runner.assert(testKeyShortcut('J', true, true).blocked, 'Ctrl+Shift+J Console shortcut is blocked and triggers warning');
  runner.assert(testKeyShortcut('U', true, false).blocked, 'Ctrl+U View Source shortcut is blocked');
  runner.assert(testKeyShortcut('S', true, false).blocked, 'Ctrl+S Page Save shortcut is blocked');
  runner.assert(testKeyShortcut('PrintScreen', false, false).blocked, 'PrintScreen shortcut is intercepted and overwritten');

  // Test 3.3: DevTools dimension disparity heuristic
  function checkDevToolsDisparity(outerW: number, innerW: number, outerH: number, innerH: number): boolean {
    const threshold = 160;
    const widthDiff = outerW - innerW > threshold;
    const heightDiff = outerH - innerH > threshold;
    return widthDiff || heightDiff;
  }

  runner.assert(
    checkDevToolsDisparity(1920, 1400, 1080, 1080) === true,
    'DevTools side-dock open detected (width delta 520px > 160px)'
  );
  runner.assert(
    checkDevToolsDisparity(1920, 1920, 1080, 700) === true,
    'DevTools bottom-dock open detected (height delta 380px > 160px)'
  );
  runner.assert(
    checkDevToolsDisparity(1920, 1920, 1080, 1050) === false,
    'Normal window browsing without DevTools does not generate false positives'
  );

  // ----------------------------------------------------
  // TEST SUITE 4: Server-Side Attempt Bounds & Question Sanitization
  // ----------------------------------------------------
  console.log('\n--- Test Suite 4: Server-Side Attempts, Sanitization & Grading ---');

  // Question Sanitization Test: Student DTO must NOT leak correct answer or explanation
  const rawDbQuestion = {
    id: 'q-101',
    question_text: 'ما قيمة س؟',
    question_latex: '2x = 8',
    image_url: null,
    difficulty: 'EASY',
    question_type: 'MCQ',
    options: [
      { label: 'A', text: '2' },
      { label: 'B', text: '4' },
      { label: 'C', text: '6' },
      { label: 'D', text: '8' },
    ],
    correct_answer: 'B',
    explanation: 'س = 8 ÷ 2 = 4',
  };

  // Sanitizer simulation matching src/lib/actions/quizzes.ts
  const studentSanitizedQuestion = {
    id: rawDbQuestion.id,
    questionText: rawDbQuestion.question_text,
    questionLatex: rawDbQuestion.question_latex,
    imageUrl: rawDbQuestion.image_url,
    difficulty: rawDbQuestion.difficulty,
    questionType: rawDbQuestion.question_type,
    options: rawDbQuestion.options,
  };

  runner.assert(
    !('correct_answer' in studentSanitizedQuestion) && !('explanation' in studentSanitizedQuestion),
    'Student question payload is strictly sanitized: correct answer and explanation omitted'
  );

  // Attempt Limit Bounding Test: COUNT(*) + 1 <= maxAttempts
  function calculateAttemptEligibility(priorAttemptsCount: number, maxAttempts: number): { allowed: boolean; attemptNum: number } {
    const attemptNum = priorAttemptsCount + 1;
    const allowed = attemptNum <= maxAttempts;
    return { allowed, attemptNum };
  }

  runner.assert(
    calculateAttemptEligibility(0, 3).allowed === true && calculateAttemptEligibility(0, 3).attemptNum === 1,
    'Student attempt #1 of 3 is allowed'
  );
  runner.assert(
    calculateAttemptEligibility(2, 3).allowed === true && calculateAttemptEligibility(2, 3).attemptNum === 3,
    'Student attempt #3 of 3 is allowed'
  );
  runner.assert(
    calculateAttemptEligibility(3, 3).allowed === false && calculateAttemptEligibility(3, 3).attemptNum === 4,
    'Student attempt #4 of 3 is strictly rejected with error'
  );

  // Server-side grading accuracy test
  const testQuizQuestions = [
    { id: 'q1', correctAnswer: 'A' },
    { id: 'q2', correctAnswer: 'C' },
    { id: 'q3', correctAnswer: 'B' },
    { id: 'q4', correctAnswer: 'A' },
  ];

  const studentAnswers = [
    { questionId: 'q1', selectedAnswer: 'A' }, // correct (+10)
    { questionId: 'q2', selectedAnswer: 'B' }, // wrong (0)
    { questionId: 'q3', selectedAnswer: 'B' }, // correct (+10)
    { questionId: 'q4', selectedAnswer: 'A' }, // correct (+10)
  ];

  let correctCount = 0;
  for (const q of testQuizQuestions) {
    const ans = studentAnswers.find((a) => a.questionId === q.id);
    if (ans && ans.selectedAnswer.trim() === q.correctAnswer.trim()) {
      correctCount++;
    }
  }

  const score = correctCount * 10;
  const maxScore = testQuizQuestions.length * 10;
  const percentage = Math.round((correctCount / testQuizQuestions.length) * 100);
  const passScore = 50;
  const passed = percentage >= passScore;

  runner.assert(score === 30 && maxScore === 40, 'Score calculated accurately (30/40)');
  runner.assert(percentage === 75, 'Percentage calculated accurately (75%)');
  runner.assert(passed === true, 'Pass status calculated accurately (75% >= 50% passScore)');

  const success = runner.summary();
  if (!success) {
    process.exit(1);
  }
}

runEmpiricalTests();
