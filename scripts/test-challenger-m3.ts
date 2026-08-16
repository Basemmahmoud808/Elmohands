import { parseMediaUrl } from '../src/lib/actions/courses';
import { buildStorageFileName } from '../src/lib/supabase/storage';

interface TestCase {
  name: string;
  url: string;
  expectedType: 'video' | 'iframe';
  expectedSrcContains?: string;
  forbiddenSrcContains?: string;
}

const VIDEO_TEST_CASES: TestCase[] = [
  // 1. Direct Video files
  {
    name: 'Direct MP4 URL',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    expectedType: 'video',
    expectedSrcContains: 'BigBuckBunny.mp4',
  },
  {
    name: 'Direct WebM URL',
    url: 'https://example.com/videos/lesson1.webm',
    expectedType: 'video',
    expectedSrcContains: 'lesson1.webm',
  },
  {
    name: 'Empty string fallback',
    url: '',
    expectedType: 'video',
    expectedSrcContains: 'commondatastorage.googleapis.com',
  },

  // 2. YouTube variants
  {
    name: 'YouTube Standard Watch URL',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    expectedType: 'iframe',
    expectedSrcContains: 'youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    name: 'YouTube Watch URL with extra query params',
    url: 'https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ&t=42s',
    expectedType: 'iframe',
    expectedSrcContains: 'youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    name: 'YouTube youtu.be short URL',
    url: 'https://youtu.be/dQw4w9WgXcQ',
    expectedType: 'iframe',
    expectedSrcContains: 'youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    name: 'YouTube youtu.be short URL with timestamp',
    url: 'https://youtu.be/dQw4w9WgXcQ?t=15',
    expectedType: 'iframe',
    expectedSrcContains: 'youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    name: 'YouTube Shorts URL',
    url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    expectedType: 'iframe',
    expectedSrcContains: 'youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    name: 'YouTube Embed URL',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    expectedType: 'iframe',
    expectedSrcContains: 'youtube.com/embed/dQw4w9WgXcQ',
  },

  // 3. Vimeo variants
  {
    name: 'Vimeo Standard URL',
    url: 'https://vimeo.com/123456789',
    expectedType: 'iframe',
    expectedSrcContains: 'player.vimeo.com/video/123456789',
  },
  {
    name: 'Vimeo URL with hash/query',
    url: 'https://vimeo.com/123456789?h=abcd1234',
    expectedType: 'iframe',
    expectedSrcContains: 'player.vimeo.com/video/123456789',
  },
  {
    name: 'Vimeo Channel URL',
    url: 'https://vimeo.com/channels/staffpicks/123456789',
    expectedType: 'iframe',
    expectedSrcContains: 'player.vimeo.com/video/123456789',
  },
  {
    name: 'Vimeo Direct Player URL',
    url: 'https://player.vimeo.com/video/123456789',
    expectedType: 'iframe',
    expectedSrcContains: 'player.vimeo.com/video/123456789',
  },

  // 4. Google Drive variants
  {
    name: 'Google Drive /file/d/ view URL',
    url: 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J-K_L/view?usp=sharing',
    expectedType: 'iframe',
    expectedSrcContains: 'drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J-K_L/preview',
  },
  {
    name: 'Google Drive /file/d/ preview URL',
    url: 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J-K_L/preview',
    expectedType: 'iframe',
    expectedSrcContains: 'drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J-K_L/preview',
  },
  {
    name: 'Google Drive open?id= URL',
    url: 'https://drive.google.com/open?id=1A2B3C4D5E6F7G8H9I0J-K_L',
    expectedType: 'iframe',
    expectedSrcContains: 'drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J-K_L/preview',
  },
  {
    name: 'Google Drive uc?id= URL',
    url: 'https://drive.google.com/uc?id=1A2B3C4D5E6F7G8H9I0J-K_L',
    expectedType: 'iframe',
    expectedSrcContains: 'drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J-K_L/preview',
  },

  // 5. BunnyCDN / BunnyStream
  {
    name: 'BunnyCDN iframe embed URL',
    url: 'https://iframe.mediadelivery.net/embed/12345/abc-def-ghi',
    expectedType: 'iframe',
    expectedSrcContains: 'iframe.mediadelivery.net/embed/12345/abc-def-ghi',
  },
  {
    name: 'BunnyCDN b-cdn.net URL',
    url: 'https://vz-abc123.b-cdn.net/video-guid/playlist.m3u8',
    expectedType: 'iframe',
    expectedSrcContains: 'b-cdn.net',
  },

  // 6. Wistia
  {
    name: 'Wistia iframe embed URL',
    url: 'https://fast.wistia.net/embed/iframe/abc123xyz',
    expectedType: 'iframe',
    expectedSrcContains: 'fast.wistia.net/embed/iframe/abc123xyz',
  },
  {
    name: 'Wistia medias URL',
    url: 'https://reda.wistia.com/medias/abc123xyz',
    expectedType: 'iframe',
    expectedSrcContains: 'wistia.com',
  },

  // 7. Generic raw iframe embed snippet
  {
    name: 'Raw iframe HTML snippet',
    url: '<iframe src="https://player.vimeo.com/video/999888" width="640" height="360" frameborder="0"></iframe>',
    expectedType: 'iframe',
    expectedSrcContains: 'https://player.vimeo.com/video/999888',
  },
];

async function runTests() {
  console.log('=== RUNNING EMPIRICAL CHALLENGER M3.2 TESTS ===\n');

  let passedCount = 0;
  let failedCount = 0;
  const failures: string[] = [];

  for (const tc of VIDEO_TEST_CASES) {
    try {
      const res = await parseMediaUrl(tc.url);
      let passed = true;
      let reason = '';

      if (res.type !== tc.expectedType) {
        passed = false;
        reason = `Type mismatch: expected ${tc.expectedType}, got ${res.type}`;
      } else if (tc.expectedSrcContains && !res.src.includes(tc.expectedSrcContains)) {
        passed = false;
        reason = `Src missing expected substring: expected "${tc.expectedSrcContains}", got "${res.src}"`;
      }

      if (passed) {
        console.log(`[PASS] ${tc.name} -> type: ${res.type}, src: ${res.src}`);
        passedCount++;
      } else {
        console.log(`[FAIL] ${tc.name} -> ${reason} (src was: "${res.src}")`);
        failedCount++;
        failures.push(`${tc.name}: ${reason} (input: "${tc.url}")`);
      }
    } catch (err: any) {
      console.log(`[ERROR] ${tc.name} threw exception: ${err.message}`);
      failedCount++;
      failures.push(`${tc.name} exception: ${err.message}`);
    }
  }

  console.log('\n----------------------------------------');
  console.log(`Total: ${VIDEO_TEST_CASES.length}, Passed: ${passedCount}, Failed: ${failedCount}`);

  // Test Storage file name generation
  console.log('\n=== TESTING STORAGE FILENAME HELPER ===');
  const mockFile = { name: 'درس_الرياضيات الأول (مذكرات).pdf' } as any;
  const generatedPath = buildStorageFileName(mockFile, 'worksheets');
  console.log(`Input: "${mockFile.name}" with folder "worksheets"`);
  console.log(`Output path: "${generatedPath}"`);
  const isStorageValid =
    generatedPath.startsWith('worksheets/') &&
    generatedPath.endsWith('.pdf') &&
    !generatedPath.includes(' ') &&
    !generatedPath.includes('(');
  console.log(`Filename sanitization check: ${isStorageValid ? 'PASSED' : 'FAILED'}`);

  return { passedCount, failedCount, failures, isStorageValid };
}

runTests();
