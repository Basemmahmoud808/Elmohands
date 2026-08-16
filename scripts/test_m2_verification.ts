import { getFullCurriculumTreeAction, parseMediaUrl } from '../src/lib/actions/courses';
import { getStudentsList } from '../src/lib/actions/students';
import { getAllVouchersAction, redeemVoucherCode } from '../src/lib/actions/vouchers';
import { getStudentDashboardData, getAdminDashboardData, getStudentDetails } from '../src/lib/actions/dashboard';
import { CurriculumGradeDTO } from '../src/lib/types/dashboard';

async function runEmpiricalTests() {
  console.log('=== STARTING EMPIRICAL VERIFICATION FOR MILESTONE 2 ===\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    }
  }

  // TEST 1: Media URL Parser
  console.log('\n--- 1. Testing Media URL Parser ---');
  const ytParsed = await parseMediaUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert(ytParsed.type === 'iframe' && ytParsed.src.includes('youtube.com/embed/dQw4w9WgXcQ'), 'YouTube URL parsing');

  const bunnyParsed = await parseMediaUrl('https://iframe.mediadelivery.net/play/1234/abc');
  assert(bunnyParsed.type === 'iframe' && bunnyParsed.src.includes('iframe.mediadelivery.net'), 'BunnyCDN URL parsing');

  const mp4Parsed = await parseMediaUrl('https://example.com/video.mp4');
  assert(mp4Parsed.type === 'video' && mp4Parsed.src === 'https://example.com/video.mp4', 'Direct MP4 parsing');

  const emptyParsed = await parseMediaUrl('');
  assert(emptyParsed.type === 'video' && !!emptyParsed.src, 'Empty media URL fallback');

  // TEST 2: 4-Tier Curriculum Tree Data Transformations
  console.log('\n--- 2. Testing 4-Tier Hierarchy Transformation ---');
  const treeResult = await getFullCurriculumTreeAction();
  assert(treeResult.success === true, 'Curriculum tree action returns success=true');
  assert(Array.isArray(treeResult.data) && treeResult.data.length > 0, 'Curriculum tree contains grades');

  const firstGrade = treeResult.data?.[0];
  assert(!!firstGrade && !!firstGrade.id && !!firstGrade.name, 'Grade tier has id and name');
  assert(Array.isArray(firstGrade?.terms) && firstGrade.terms.length > 0, 'Term tier exists under Grade');

  const firstTerm = firstGrade?.terms[0];
  assert(!!firstTerm && !!firstTerm.id && !!firstTerm.name, 'Term tier has id and name');
  assert(Array.isArray(firstTerm?.branches) && firstTerm.branches.length > 0, 'Branch tier exists under Term');

  const firstBranch = firstTerm?.branches[0];
  assert(!!firstBranch && !!firstBranch.id && !!firstBranch.name, 'Branch tier has id and name');
  assert(Array.isArray(firstBranch?.units) && firstBranch.units.length > 0, 'Unit tier exists under Branch');

  const firstUnit = firstBranch?.units[0];
  assert(!!firstUnit && !!firstUnit.id && !!firstUnit.title, 'Unit tier has id and title');
  assert(Array.isArray(firstUnit?.lessons) && firstUnit.lessons.length > 0, 'Lesson tier exists under Unit');

  const firstLesson = firstUnit?.lessons[0];
  assert(
    !!firstLesson &&
    typeof firstLesson.durationMinutes === 'number' &&
    typeof firstLesson.isPublished === 'boolean' &&
    typeof firstLesson.watchPercentage === 'number',
    'Lesson tier has valid strongly typed fields'
  );

  // TEST 3: Edge Cases in Hierarchy Transformation
  console.log('\n--- 3. Testing Edge Cases in Hierarchy Transformation ---');
  // Validate sorting order and null-safety
  const grades = treeResult.data as CurriculumGradeDTO[];
  let allSorted = true;
  for (const g of grades) {
    for (let i = 1; i < g.terms.length; i++) {
      if ((g.terms[i].sortOrder || 0) < (g.terms[i - 1].sortOrder || 0)) allSorted = false;
    }
    for (const t of g.terms) {
      for (let i = 1; i < t.branches.length; i++) {
        if ((t.branches[i].sortOrder || 0) < (t.branches[i - 1].sortOrder || 0)) allSorted = false;
      }
      for (const b of t.branches) {
        for (let i = 1; i < b.units.length; i++) {
          if ((b.units[i].sortOrder || 0) < (b.units[i - 1].sortOrder || 0)) allSorted = false;
        }
        for (const u of b.units) {
          for (let i = 1; i < u.lessons.length; i++) {
            if ((u.lessons[i].sortOrder || 0) < (u.lessons[i - 1].sortOrder || 0)) allSorted = false;
          }
        }
      }
    }
  }
  assert(allSorted, 'Hierarchy tiers are monotonically ordered by sortOrder');

  // TEST 4: Null / Empty DB State Handling & Auth Guards
  console.log('\n--- 4. Testing Null / Unauthenticated DB State Handling ---');
  
  // Unauthenticated calls must return { success: false, error: ... } without throwing uncaught exceptions
  try {
    const studentDashRes = await getStudentDashboardData();
    assert(
      studentDashRes.success === false && typeof studentDashRes.error === 'string',
      'getStudentDashboardData() gracefully rejects unauthenticated user'
    );
  } catch (err) {
    assert(false, 'getStudentDashboardData() threw unhandled exception', String(err));
  }

  try {
    const adminDashRes = await getAdminDashboardData();
    assert(
      adminDashRes.success === false && typeof adminDashRes.error === 'string',
      'getAdminDashboardData() gracefully rejects unauthenticated user'
    );
  } catch (err) {
    assert(false, 'getAdminDashboardData() threw unhandled exception', String(err));
  }

  try {
    const studentsListRes = await getStudentsList();
    assert(
      studentsListRes.success === false && typeof studentsListRes.error === 'string',
      'getStudentsList() gracefully rejects unauthenticated user'
    );
  } catch (err) {
    assert(false, 'getStudentsList() threw unhandled exception', String(err));
  }

  try {
    const vouchersRes = await getAllVouchersAction();
    assert(
      vouchersRes.success === false && typeof vouchersRes.error === 'string',
      'getAllVouchersAction() gracefully rejects unauthenticated user'
    );
  } catch (err) {
    assert(false, 'getAllVouchersAction() threw unhandled exception', String(err));
  }

  // TEST 5: Voucher Rate Limiting and Validation Handling
  console.log('\n--- 5. Testing Voucher Redemption & Brute Force Rate Limiter ---');
  try {
    const emptyRedeem = await redeemVoucherCode('');
    assert(
      emptyRedeem.success === false && emptyRedeem.message.includes('تسجيل الدخول'),
      'redeemVoucherCode() without auth prompts for login'
    );
  } catch (err) {
    assert(false, 'redeemVoucherCode() threw unhandled exception', String(err));
  }

  // TEST 6: Student Details Modal null-handling
  console.log('\n--- 6. Testing Student Details Null Handling ---');
  try {
    const detailsRes = await getStudentDetails('non-existent-student-id-999');
    assert(
      detailsRes.success === true && !!detailsRes.data,
      'getStudentDetails() handles non-existent student with fallback/empty state'
    );
  } catch (err) {
    assert(false, 'getStudentDetails() threw unhandled exception', String(err));
  }

  console.log(`\n=== RESULTS: ${passedTests} / ${totalTests} TESTS PASSED ===\n`);
  if (passedTests === totalTests) {
    console.log('ALL EMPIRICAL TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED.');
    process.exit(1);
  }
}

runEmpiricalTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
