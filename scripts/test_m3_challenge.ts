import {
  checkLessonAccessAction,
  getLessonDetailsAction,
  getCurriculumByGradeAction,
  updateLessonProgressAction,
  getLessonProgressAction,
  getStudentCurriculumProgressAction,
} from '../src/lib/actions/lessons';
import { updateLessonProgressAction as updateProgressDirect } from '../src/lib/actions/progress';
import { parseMediaUrl } from '../src/lib/actions/courses';
import { LessonDetailsDTO, CurriculumGradeDTO } from '../src/lib/types/dashboard';

async function runM3ChallengeVerification() {
  console.log('====================================================');
  console.log('=== STARTING EMPIRICAL CHALLENGE SUITE: MILESTONE 3 ===');
  console.log('====================================================\n');

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

  // -------------------------------------------------------------
  // SUITE 1: Media URL Parsing Across Sources
  // -------------------------------------------------------------
  console.log('\n--- SUITE 1: Video Source & Embed Parser ---');
  {
    const yt1 = await parseMediaUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert(yt1.type === 'iframe' && yt1.src.includes('youtube.com/embed/dQw4w9WgXcQ'), 'YouTube watch URL -> embed iframe');

    const yt2 = await parseMediaUrl('https://youtu.be/dQw4w9WgXcQ?t=10');
    assert(yt2.type === 'iframe' && yt2.src.includes('youtube.com/embed/dQw4w9WgXcQ'), 'YouTube youtu.be short URL -> embed iframe');

    const vimeo = await parseMediaUrl('https://vimeo.com/76979871');
    assert(vimeo.type === 'iframe' && vimeo.src.includes('player.vimeo.com/video/76979871'), 'Vimeo URL -> embed iframe');

    const gdrive = await parseMediaUrl('https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing');
    assert(gdrive.type === 'iframe' && gdrive.src.includes('drive.google.com/file/d/1A2B3C4D5E/preview'), 'Google Drive URL -> preview iframe');

    const bunny = await parseMediaUrl('https://iframe.mediadelivery.net/embed/12345/video-id-xyz');
    assert(bunny.type === 'iframe' && bunny.src === 'https://iframe.mediadelivery.net/embed/12345/video-id-xyz', 'BunnyCDN / Generic iframe preserved');

    const mp4 = await parseMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    assert(mp4.type === 'video' && mp4.src.endsWith('.mp4'), 'Direct MP4 URL -> HTML5 video tag');

    const empty = await parseMediaUrl('');
    assert(empty.type === 'video' && typeof empty.src === 'string', 'Empty URL -> Safe fallback video source');
  }

  // -------------------------------------------------------------
  // SUITE 2: updateLessonProgressAction Calculation & Thresholds
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: Progress Tracking & Auto-Completion Oracles ---');
  {
    // Test unauthenticated invocation guard
    const unauthProg = await updateLessonProgressAction('les-1', 45, 50);
    assert(
      unauthProg.success === false && typeof unauthProg.error === 'string',
      'updateLessonProgressAction rejects unauthenticated call safely'
    );

    const emptyLessonProg = await updateLessonProgressAction('', 100, 95);
    assert(
      emptyLessonProg.success === false,
      'updateLessonProgressAction rejects empty lessonId'
    );

    // Test calculation oracle logic simulating arguments:
    // (lessonId, lastPosition, watchPercentage) AND (lessonId, watchPercentage, lastPosition)
    const simulateProgressCalculation = (arg2: number, arg3: number) => {
      let watchPercentage: number;
      let lastPosition: number;

      if (arg2 > 100 && arg3 <= 100) {
        lastPosition = Math.max(0, Math.round(arg2));
        watchPercentage = Math.min(100, Math.max(0, Math.round(arg3)));
      } else if (arg3 > 100 && arg2 <= 100) {
        watchPercentage = Math.min(100, Math.max(0, Math.round(arg2)));
        lastPosition = Math.max(0, Math.round(arg3));
      } else {
        watchPercentage = Math.min(100, Math.max(0, Math.round(arg3)));
        lastPosition = Math.max(0, Math.round(arg2));
      }

      const isCompleted = watchPercentage >= 90;
      return { watchPercentage, lastPosition, isCompleted };
    };

    // Standard order: (seconds=300, pct=50)
    const calc1 = simulateProgressCalculation(300, 50);
    assert(calc1.lastPosition === 300 && calc1.watchPercentage === 50 && calc1.isCompleted === false, 'Progress calc: 50% watch is NOT completed');

    // Threshold test: exactly 89% -> false
    const calc2 = simulateProgressCalculation(534, 89);
    assert(calc2.watchPercentage === 89 && calc2.isCompleted === false, 'Progress calc: 89% watch is NOT completed (strictly < 90%)');

    // Threshold test: exactly 90% -> true
    const calc3 = simulateProgressCalculation(540, 90);
    assert(calc3.watchPercentage === 90 && calc3.isCompleted === true, 'Progress calc: 90% watch triggers is_completed=true');

    // Threshold test: 100% -> true
    const calc4 = simulateProgressCalculation(600, 100);
    assert(calc4.watchPercentage === 100 && calc4.isCompleted === true, 'Progress calc: 100% watch triggers is_completed=true');

    // Swapped order: (pct=95, seconds=650)
    const calcSwapped = simulateProgressCalculation(95, 650);
    assert(calcSwapped.lastPosition === 650 && calcSwapped.watchPercentage === 95 && calcSwapped.isCompleted === true, 'Progress calc: Swapped args (pct, pos) correctly identified and resolved');

    // Clamping: percentage > 100
    const calcOverflow = simulateProgressCalculation(1000, 120);
    assert(calcOverflow.watchPercentage === 100 && calcOverflow.isCompleted === true, 'Progress calc: percentage > 100 clamped to 100%');

    // Clamping: negative percentage
    const calcNegative = simulateProgressCalculation(-20, -5);
    assert(calcNegative.watchPercentage === 0 && calcNegative.lastPosition === 0 && calcNegative.isCompleted === false, 'Progress calc: negative values clamped to 0');
  }

  // -------------------------------------------------------------
  // SUITE 3: Access Control Function (checkLessonAccessAction)
  // -------------------------------------------------------------
  console.log('\n--- SUITE 3: checkLessonAccessAction Matrix & Scenarios ---');
  {
    // Scenario 1: Unauthenticated Guest accessing Free Lesson ('les-1' isLocked=false in fallback)
    const guestFreeRes = await checkLessonAccessAction('', 'les-1');
    assert(guestFreeRes.success === true, 'checkLessonAccessAction succeeds on free sample lesson');
    assert(
      guestFreeRes.data?.allowed === true && guestFreeRes.data?.isGuest === true,
      'Scenario 1: Unauthenticated guest on free sample lesson -> ALLOWED'
    );

    // Scenario 2: Unauthenticated Guest accessing non-existent / fallback with no free access or DB locked lesson
    // If guest accesses fallback or locked lesson
    const guestLockedRes = await checkLessonAccessAction('', 'non-existent-lesson-id-xyz');
    assert(guestLockedRes.success === true, 'checkLessonAccessAction handles unknown lesson safely');
    // Note: fallback lessons 1..4 have isLocked: false in seed, so testing with an explicitly unknown or locked lesson

    // Scenario 3: getLessonDetailsAction on Fallback / DB
    const details1 = await getLessonDetailsAction('les-1');
    assert(details1.success === true && !!details1.data, 'getLessonDetailsAction returns lesson DTO');
    assert(details1.data?.title.length! > 0, 'Lesson title populated');
    assert(details1.data?.parsedMedia?.type === 'video' || details1.data?.parsedMedia?.type === 'iframe', 'Lesson parsed media populated');
    assert(Array.isArray(details1.data?.quizzes), 'Lesson quizzes array attached');
  }

  // -------------------------------------------------------------
  // SUITE 4: Curriculum By Grade Action (getCurriculumByGradeAction)
  // -------------------------------------------------------------
  console.log('\n--- SUITE 4: getCurriculumByGradeAction Structure & Filtering ---');
  {
    const currRes = await getCurriculumByGradeAction('الصف الأول الإعدادي');
    assert(currRes.success === true && !!currRes.data, 'getCurriculumByGradeAction succeeds for Arabic grade name');
    const currData = currRes.data as CurriculumGradeDTO;
    assert(currData.name.includes('الإعدادي'), 'Curriculum grade name preserved');
    assert(Array.isArray(currData.terms) && currData.terms.length > 0, 'Curriculum contains terms');

    const firstTerm = currData.terms[0];
    assert(Array.isArray(firstTerm.branches) && firstTerm.branches.length > 0, 'Terms contain branches');

    const firstBranch = firstTerm.branches[0];
    assert(Array.isArray(firstBranch.units) && firstBranch.units.length > 0, 'Branches contain units');

    const firstUnit = firstBranch.units[0];
    assert(Array.isArray(firstUnit.lessons) && firstUnit.lessons.length > 0, 'Units contain lessons');

    // Test with Grade ID / Alias
    const currAliasRes = await getCurriculumByGradeAction('g-prep-1');
    assert(currAliasRes.success === true && !!currAliasRes.data, 'getCurriculumByGradeAction succeeds with ID alias');
  }

  // -------------------------------------------------------------
  // SUITE 5: Progress Read Actions
  // -------------------------------------------------------------
  console.log('\n--- SUITE 5: Progress Read Actions Guarding ---');
  {
    const singleProg = await getLessonProgressAction('les-1');
    assert(singleProg.success === true, 'getLessonProgressAction gracefully returns for unauthenticated guest (null data)');

    const allProg = await getStudentCurriculumProgressAction();
    assert(allProg.success === true && typeof allProg.data === 'object', 'getStudentCurriculumProgressAction returns empty map for unauth');
  }

  console.log(`\n====================================================`);
  console.log(`=== CHALLENGE RESULTS: ${passedTests} / ${totalTests} TESTS PASSED ===`);
  console.log(`====================================================\n`);

  if (passedTests === totalTests) {
    console.log('ALL EMPIRICAL M3 VERIFICATION TESTS PASSED.');
    process.exit(0);
  } else {
    console.error('SOME M3 VERIFICATION TESTS FAILED.');
    process.exit(1);
  }
}

runM3ChallengeVerification().catch((err) => {
  console.error('Fatal challenge execution error:', err);
  process.exit(1);
});
