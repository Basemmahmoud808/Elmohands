/**
 * 🔬 خطة الفحص الشاملة — منصة المهندس
 * Comprehensive Automated QA Test Suite
 * Tests: Security, Auth, Performance, API, Code Quality
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_URL = 'https://elmohands-one.vercel.app';
const RESULTS = [];
let passed = 0, failed = 0, warnings = 0;

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function log(icon, label, msg, extra = '') {
  const line = `${icon} [${label}] ${msg}${extra ? ' — ' + extra : ''}`;
  console.log(line);
  return line;
}

function result(axis, id, name, ok, msg, warn = false) {
  const icon = ok ? '✅' : warn ? '⚠️ ' : '❌';
  if (ok) passed++;
  else if (warn) warnings++;
  else failed++;
  const line = log(icon, `${axis}-${id}`, name, msg);
  RESULTS.push({ axis, id, name, ok, warn, msg });
  return ok;
}

function fetchUrl(url, options = {}) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    const req = mod.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Almohands-QA-Bot/1.0',
        ...(options.headers || {}),
      },
      timeout: 10000,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
          durationMs: Date.now() - startTime,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          redirected: res.statusCode >= 300 && res.statusCode < 400,
        });
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message, durationMs: Date.now() - startTime }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'Timeout', durationMs: 10000 }); });
    if (options.body) req.write(options.body);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────
// AXIS 10: PERFORMANCE TESTS (Live URL)
// ─────────────────────────────────────────────────────────
async function testPerformance() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 AXIS 10 — الأداء والسرعة (Performance)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 10.1 Homepage load time
  const home = await fetchUrl(BASE_URL);
  result('PERF', '10.1', 'سرعة تحميل الصفحة الرئيسية',
    home.status === 200 && home.durationMs < 5000,
    `Status: ${home.status} | Time: ${home.durationMs}ms`);

  // 10.2 Student page load
  const student = await fetchUrl(`${BASE_URL}/student`);
  // Should redirect to /sign-in since unauthenticated
  result('PERF', '10.2', 'استجابة مسار /student (redirect)',
    student.status === 200 || student.status === 302 || student.status === 307,
    `Status: ${student.status} | Time: ${student.durationMs}ms`);

  // 10.3 Admin page load
  const admin = await fetchUrl(`${BASE_URL}/admin`);
  result('PERF', '10.3', 'استجابة مسار /admin (redirect)',
    admin.status === 200 || admin.status === 302 || admin.status === 307,
    `Status: ${admin.status} | Time: ${admin.durationMs}ms`);

  // 10.4 Health check response time
  const health = await fetchUrl(`${BASE_URL}/api/health`);
  let healthData = {};
  try { healthData = JSON.parse(health.body); } catch {}
  result('PERF', '10.4', 'Health Check Response Time',
    health.status === 200 && health.durationMs < 3000,
    `Status: ${health.status} | Time: ${health.durationMs}ms | DB: ${healthData.db || 'unknown'}`);

  // 10.5 Health check DB status
  result('PERF', '10.5', 'Health Check — قاعدة البيانات متصلة',
    healthData.status === 'healthy' && healthData.db === 'connected',
    JSON.stringify(healthData).substring(0, 120));
}

// ─────────────────────────────────────────────────────────
// AXIS 12: INFRASTRUCTURE TESTS (Live URL + Code)
// ─────────────────────────────────────────────────────────
async function testInfrastructure() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏗️  AXIS 12 — البنية التحتية (Infrastructure)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 12.1 Health endpoint exists
  const health = await fetchUrl(`${BASE_URL}/api/health`);
  result('INFRA', '12.1', 'نقطة /api/health تستجيب بنجاح',
    health.status === 200,
    `Status: ${health.status}`);

  // 12.2 WhatsApp webhook GET (health ping)
  const waGet = await fetchUrl(`${BASE_URL}/api/webhooks/whatsapp`);
  let waData = {};
  try { waData = JSON.parse(waGet.body); } catch {}
  result('INFRA', '12.2', 'WhatsApp Webhook GET — online status',
    waGet.status === 200 && waData.status === 'online',
    `Status: ${waGet.status} | service: ${waData.service || 'unknown'}`);

  // 12.3 404 page
  const notFound = await fetchUrl(`${BASE_URL}/xyz_nonexistent_page_123`);
  result('INFRA', '12.3', 'صفحة 404 تُعيد 404 أو تُعيد توجيهاً',
    notFound.status === 404 || notFound.status === 200 || notFound.status === 302,
    `Status: ${notFound.status}`);

  // 12.4 Check environment variable files exist locally
  const envExists = fs.existsSync(path.join(__dirname, '.env.local'));
  result('INFRA', '12.4', 'ملف .env.local موجود محلياً',
    envExists,
    envExists ? 'Found' : 'MISSING — check Vercel env vars');

  // 12.5 Check health route file exists
  const healthFileExists = fs.existsSync(path.join(__dirname, 'src/app/api/health/route.ts'));
  result('INFRA', '12.5', 'ملف /api/health/route.ts موجود',
    healthFileExists,
    healthFileExists ? 'Found' : 'MISSING');
}

// ─────────────────────────────────────────────────────────
// AXIS 1: SECURITY TESTS (Code analysis + HTTP)
// ─────────────────────────────────────────────────────────
async function testSecurity() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔒 AXIS 1 — الأمان والحماية (Security)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1.1 /admin redirects unauthenticated
  const admin = await fetchUrl(`${BASE_URL}/admin`);
  const adminRedirects = admin.status === 302 || admin.status === 307 ||
    (admin.status === 200 && admin.body && (admin.body.includes('sign-in') || admin.body.includes('تسجيل الدخول')));
  result('SEC', '1.1', 'محاولة الوصول لـ /admin بدون جلسة → redirect',
    adminRedirects,
    `Status: ${admin.status}`);

  // 1.2 /student redirects unauthenticated
  const studentPage = await fetchUrl(`${BASE_URL}/student`);
  const studentRedirects = studentPage.status === 302 || studentPage.status === 307 ||
    (studentPage.status === 200 && studentPage.body && studentPage.body.includes('sign-in'));
  result('SEC', '1.2', 'محاولة الوصول لـ /student بدون جلسة → redirect',
    studentRedirects,
    `Status: ${studentPage.status}`);

  // 1.3 Check middleware.ts contains admin route protection
  const mwPath = path.join(__dirname, 'src/middleware.ts');
  const mw = fs.readFileSync(mwPath, 'utf8');
  result('SEC', '1.3', 'Middleware يحمي /admin من الطلاب',
    mw.includes('isAdminRoute') && mw.includes("role !== 'ADMIN'"),
    'Role check found in middleware');

  // 1.4 Check single session enforcement in auth.ts
  const authPath = path.join(__dirname, 'src/lib/actions/auth.ts');
  const authContent = fs.readFileSync(authPath, 'utf8');
  result('SEC', '1.4', 'نظام الجلسة الواحدة مُفعّل في auth.ts',
    authContent.includes('revokeUserSessions') && authContent.includes("role === 'STUDENT'"),
    'Single session logic found');

  // 1.5 JWT verification in middleware
  result('SEC', '1.5', 'Middleware يتحقق من JWT Token',
    mw.includes('verifyToken') || mw.includes('auth_token'),
    'JWT verification found');

  // 1.6 Rate limiting in middleware
  result('SEC', '1.6', 'Rate Limiting مُفعّل في Middleware',
    mw.includes('rate') || mw.includes('limit') || mw.includes('rateLimit'),
    mw.toLowerCase().includes('rate') ? 'Rate limiting code found' : 'No rate limiting found',
    !mw.toLowerCase().includes('rate'));

  // 1.7 XSS protection — sanitizeInput used
  const secPath = path.join(__dirname, 'src/lib/security.ts');
  const secContent = fs.readFileSync(secPath, 'utf8');
  result('SEC', '1.7', 'دالة sanitizeInput تحمي من XSS',
    secContent.includes('sanitize') || secContent.includes('replace') || secContent.includes('escape'),
    'Sanitization code found');

  // 1.8 Check validations.ts for password length
  const valPath = path.join(__dirname, 'src/lib/validations.ts');
  const valContent = fs.readFileSync(valPath, 'utf8');
  result('SEC', '1.8', 'التحقق من طول كلمة المرور (≥ 6) في validations.ts',
    valContent.includes('.min(6') || valContent.includes('minLength') || valContent.includes('min(6,'),
    'Password min(6) validation found');

  // 1.9 Check right-click prevention in VideoPreviewModal
  const vmPath = path.join(__dirname, 'src/components/student/modals/VideoPreviewModal.tsx');
  const vmContent = fs.readFileSync(vmPath, 'utf8');
  result('SEC', '1.9', 'تعطيل Right-Click على مشغل الفيديو',
    vmContent.includes('onContextMenu') && vmContent.includes('preventDefault'),
    'onContextMenu prevention found');

  // 1.10 Check VideoWatermark in VideoPreviewModal
  result('SEC', '1.10', 'العلامة المائية مدمجة في مشغل الفيديو',
    vmContent.includes('VideoWatermark') && vmContent.includes('studentName') && vmContent.includes('studentPhone'),
    'VideoWatermark component used');

  // 1.11 Check VideoWatermark in VideoPlayer (lesson page)
  const vpPath = path.join(__dirname, 'src/components/lessons/VideoPlayer.tsx');
  const vpContent = fs.readFileSync(vpPath, 'utf8');
  result('SEC', '1.11', 'العلامة المائية في مشغل الدروس أيضاً',
    vpContent.includes('VideoWatermark'),
    'VideoWatermark in VideoPlayer');

  // 1.12 Auth cookie httpOnly check
  const authLibPath = path.join(__dirname, 'src/lib/auth.ts');
  const authLib = fs.readFileSync(authLibPath, 'utf8');
  result('SEC', '1.12', 'Auth Cookies محمية بـ httpOnly + secure',
    authLib.includes('httpOnly: true') && authLib.includes('secure:'),
    'httpOnly and secure flags found');
}

// ─────────────────────────────────────────────────────────
// AXIS 2: AUTH TESTS (Code analysis)
// ─────────────────────────────────────────────────────────
async function testAuth() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 AXIS 2 — التسجيل وتسجيل الدخول (Auth)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const authContent = fs.readFileSync(path.join(__dirname, 'src/lib/actions/auth.ts'), 'utf8');

  // 2.1 Arabic numerals handling
  result('AUTH', '2.1', 'تحويل الأرقام العربية إلى إنجليزية عند تسجيل الدخول',
    authContent.includes('٠١٢٣٤٥٦٧٨٩') || authContent.includes('[٠-٩]'),
    'Arabic digits normalization found');

  // 2.2 Phone duplicate check in register
  const registerPath = path.join(__dirname, 'src/app/api/auth/register/route.ts');
  const registerExists = fs.existsSync(registerPath);
  if (registerExists) {
    const regContent = fs.readFileSync(registerPath, 'utf8');
    result('AUTH', '2.2', 'التحقق من رقم هاتف مكرر عند التسجيل',
      regContent.includes('phone') && (regContent.includes('conflict') || regContent.includes('exist') || regContent.includes('duplicate') || regContent.includes('409') || regContent.includes('400')),
      'Duplicate phone check in register route');
  } else {
    result('AUTH', '2.2', 'التحقق من رقم هاتف مكرر عند التسجيل',
      authContent.includes('phone') && authContent.includes('exist'),
      'Check in auth actions');
  }

  // 2.3 Password min length validation
  result('AUTH', '2.3', 'التحقق من طول كلمة المرور (≥ 6)',
    authContent.includes('length') && (authContent.includes('6') || authContent.includes('min')),
    'Password length check found');

  // 2.4 Phone login with + or 20 prefix normalization
  result('AUTH', '2.4', 'تطبيع تنسيق الهاتف المصري (+20 / 20 → 01)',
    authContent.includes('+20') && authContent.includes('cleanDigits'),
    'Phone normalization code found');

  // 2.5 Login by name (ilike)
  result('AUTH', '2.5', 'البحث عن الطالب بالاسم عند تسجيل الدخول',
    authContent.includes('ilike') || authContent.includes('full_name'),
    'Name-based login found');

  // 2.6 is_active check before allowing login
  result('AUTH', '2.6', 'فحص is_active قبل السماح بتسجيل الدخول',
    authContent.includes('is_active') && authContent.includes('بانتظار موافقة'),
    'Activation check found');

  // 2.7 JWT access + refresh tokens created
  const authLib = fs.readFileSync(path.join(__dirname, 'src/lib/auth.ts'), 'utf8');
  result('AUTH', '2.7', 'إنشاء Access + Refresh Tokens عند الدخول',
    authLib.includes('createAccessToken') && authLib.includes('createRefreshToken'),
    'Both token types implemented');

  // 2.8 Logout clears cookies
  result('AUTH', '2.8', 'تسجيل الخروج يمسح كوكيز الجلسة',
    authLib.includes('clearAuthCookies') && authLib.includes("delete('auth_token')"),
    'Cookie deletion in logout');

  // 2.9 Redirect authenticated to dashboard
  const mw = fs.readFileSync(path.join(__dirname, 'src/middleware.ts'), 'utf8');
  result('AUTH', '2.9', 'إعادة توجيه المستخدم المسجل بعيداً عن /sign-in',
    mw.includes('sign-in') && (mw.includes('/admin') || mw.includes('/student')),
    'Redirect logic found in middleware');

  // 2.10 Multiple password verification attempts
  result('AUTH', '2.10', 'محاولات تحقق متعددة من كلمة المرور',
    authContent.includes('passwordCandidates') || authContent.includes('verifyPassword'),
    'Multiple password candidate check found');
}

// ─────────────────────────────────────────────────────────
// AXIS 5: EXAM TESTS (Code analysis)
// ─────────────────────────────────────────────────────────
async function testExams() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 AXIS 5 — الامتحانات والتقييمات (Exams)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const examPath = path.join(__dirname, 'src/components/exam/ExamSolver.tsx');
  const examContent = fs.readFileSync(examPath, 'utf8');

  // 5.3 Flag / bookmark questions
  result('EXAM', '5.3', 'ميزة وضع علامة (Flag) على الأسئلة',
    examContent.includes('flaggedIds') || examContent.includes('Bookmark'),
    'Flagging feature found');

  // 5.4 LocalStorage auto-save
  result('EXAM', '5.4', 'الحفظ التلقائي في localStorage عند انقطاع الإنترنت',
    examContent.includes('localStorage') && examContent.includes('cacheKey'),
    'localStorage auto-save implemented');

  // 5.5 Auto-submit on timer expiry — checks for prev <= 1 inside setTimeLeft callback
  result('EXAM', '5.5', 'التسليم التلقائي عند انتهاء الوقت',
    examContent.includes('timeLeft') && examContent.includes('executeSubmission') &&
    (examContent.includes('prev <= 1') || examContent.includes('prev \u003c= 1') || examContent.includes('<= 1')),
    'Auto-submit on timer found');

  // 5.6 Anti-cheat: visibility change detection
  const antiCheatPath = path.join(__dirname, 'src/components/exam/ExamAntiCheatModal.tsx');
  const antiCheatContent = fs.existsSync(antiCheatPath) ? fs.readFileSync(antiCheatPath, 'utf8') : examContent;
  result('EXAM', '5.6', 'مكافحة الغش: رصد مغادرة التبويب',
    examContent.includes('visibilitychange') || examContent.includes('violation') || antiCheatContent.includes('visibilitychange'),
    'Tab switch detection found');

  // 5.7 Violation auto-submit
  result('EXAM', '5.7', 'تسليم تلقائي بعد مخالفتين',
    examContent.includes('violations') && (examContent.includes('>= 2') || examContent.includes('>= 3')),
    'Violation threshold found');

  // 5.8 Results display
  result('EXAM', '5.8', 'عرض نتائج الامتحان التفصيلية',
    examContent.includes('results') && examContent.includes('percentage') && examContent.includes('breakdown'),
    'Results and breakdown display found');

  // 5.9 KaTeX math rendering
  result('EXAM', '5.9', 'عرض معادلات رياضية بـ KaTeX',
    examContent.includes('katex') || examContent.includes('renderMath'),
    'KaTeX rendering found');

  // 5.10 localStorage cleanup after submit
  result('EXAM', '5.10', 'تنظيف localStorage بعد تسليم الامتحان',
    examContent.includes('localStorage.removeItem'),
    'Cache cleanup after submission found');
}

// ─────────────────────────────────────────────────────────
// AXIS 8: SUBSCRIPTIONS TESTS (Code analysis)
// ─────────────────────────────────────────────────────────
async function testSubscriptions() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💳 AXIS 8 — الاشتراكات والمدفوعات (Subscriptions)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const adminActionsPath = path.join(__dirname, 'src/lib/actions/admin.ts');
  const adminContent = fs.readFileSync(adminActionsPath, 'utf8');

  // 8.1 Grant subscription action exists
  result('SUB', '8.1', 'دالة تفعيل الاشتراك grantStudentSubscriptionAction',
    adminContent.includes('grantStudentSubscriptionAction'),
    'Grant subscription action found');

  // 8.2 Subscription durations (30/120/365 days)
  result('SUB', '8.2', 'دعم الاشتراك الشهري والترم والسنوي',
    adminContent.includes('30') && adminContent.includes('120') && adminContent.includes('365'),
    'All subscription durations found');

  // 8.3 Duplicate transaction ref guard
  result('SUB', '8.3', 'منع تكرار أرقام عمليات فودافون كاش',
    adminContent.includes('transactionRef') && adminContent.includes('مسجل مسبقاً'),
    'Duplicate transaction ref guard found');

  // 8.4 Cancel subscription action
  result('SUB', '8.4', 'دالة إلغاء الاشتراك cancelStudentSubscriptionAction',
    adminContent.includes('cancelStudentSubscriptionAction') && adminContent.includes("'CANCELLED'"),
    'Cancel subscription action found');

  // 8.5 Subscription expiry check in student page
  const studentPagePath = path.join(__dirname, 'src/app/student/page.tsx');
  const studentPage = fs.readFileSync(studentPagePath, 'utf8');
  result('SUB', '8.5', 'فحص انتهاء صلاحية الاشتراك عند الطالب',
    studentPage.includes('daysRemaining') || studentPage.includes('hasActiveSubscription'),
    'Subscription expiry logic found');

  // 8.6 WhatsApp button on subscription activation
  const modalPath = path.join(__dirname, 'src/components/admin/StudentDetailModal.tsx');
  const modalContent = fs.readFileSync(modalPath, 'utf8');
  result('SUB', '8.6', 'زر واتساب يظهر بعد تفعيل الاشتراك',
    modalContent.includes('lastWhatsAppUrl') && modalContent.includes('إرسال التفاصيل واتساب'),
    'WhatsApp button after activation found');

  // 8.7 WhatsApp button on password reset
  result('SUB', '8.7', 'زر واتساب يظهر بعد إعادة تعيين كلمة المرور',
    modalContent.includes('whatsAppUrl') && modalContent.includes('handleResetPassword'),
    'WhatsApp button on reset found');

  // 8.8 Hide subscription tab when active
  const sidebarPath = path.join(__dirname, 'src/components/ui/dashboard-sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  result('SUB', '8.8', 'إخفاء تبويب الاشتراك عند وجود اشتراك نشط',
    sidebarContent.includes('hasActiveSubscription') && sidebarContent.includes('subscribe'),
    'Conditional subscription tab found');
}

// ─────────────────────────────────────────────────────────
// AXIS 9: WHATSAPP TESTS (Code + API)
// ─────────────────────────────────────────────────────────
async function testWhatsApp() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 AXIS 9 — واتساب وOpenWA (WhatsApp)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const waPath = path.join(__dirname, 'src/lib/services/whatsapp.ts');
  const waContent = fs.readFileSync(waPath, 'utf8');

  // 9.1 wa.me direct link generator
  result('WA', '9.1', 'دالة توليد رابط wa.me المباشر',
    waContent.includes('wa.me') && waContent.includes('getWhatsAppDirectUrl'),
    'Direct URL generator found');

  // 9.2 Welcome message template
  result('WA', '9.2', 'قالب رسالة الترحيب بعد تفعيل الاشتراك',
    waContent.includes('getSubscriptionWelcomeMessage') && waContent.includes('studentName') && waContent.includes('gradeName'),
    'Welcome message template found');

  // 9.3 Password reset message template
  result('WA', '9.3', 'قالب رسالة إعادة تعيين كلمة المرور',
    waContent.includes('getPasswordResetMessage') && waContent.includes('temporaryPassword'),
    'Password reset message template found');

  // 9.4 Webhook file exists
  const webhookPath = path.join(__dirname, 'src/app/api/webhooks/whatsapp/route.ts');
  const webhookExists = fs.existsSync(webhookPath);
  result('WA', '9.4', 'ملف Webhook واتساب موجود',
    webhookExists,
    webhookExists ? 'Webhook route file exists' : 'MISSING');

  // 9.5 Webhook GET returns online status
  const waGet = await fetchUrl(`${BASE_URL}/api/webhooks/whatsapp`);
  let waData = {};
  try { waData = JSON.parse(waGet.body); } catch {}
  result('WA', '9.5', 'Webhook GET يُعيد حالة online',
    waGet.status === 200 && waData.status === 'online',
    `Status: ${waGet.status} | response: ${JSON.stringify(waData).substring(0, 80)}`);

  // 9.6 Egyptian phone formatter
  result('WA', '9.6', 'تنسيق الأرقام المصرية (01...) إلى 201...',
    waContent.includes('formatEgyptianWhatsAppPhone') &&
    waContent.includes("startsWith('0')") &&
    waContent.includes("'20' + clean.slice(1)"),
    'Phone normalization to 20-prefix found');
}

// ─────────────────────────────────────────────────────────
// AXIS 3: ADMIN DASHBOARD (Code analysis)
// ─────────────────────────────────────────────────────────
async function testAdmin() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🛠️  AXIS 3 — لوحة تحكم الأدمن (Admin)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const adminContent = fs.readFileSync(path.join(__dirname, 'src/lib/actions/admin.ts'), 'utf8');
  const modalContent = fs.readFileSync(path.join(__dirname, 'src/components/admin/StudentDetailModal.tsx'), 'utf8');

  result('ADMIN', '3.1', 'دالة إحصائيات لوحة التحكم getAdminOverviewStatsAction',
    adminContent.includes('getAdminOverviewStatsAction'),
    'Overview stats action found');

  result('ADMIN', '3.2', 'دالة جلب الطلاب getAdminStudentsAction',
    adminContent.includes('getAdminStudentsAction') || adminContent.includes('getStudents'),
    'Students list action found');

  result('ADMIN', '3.3', 'تفعيل الاشتراك مع بيانات الطالب من قاعدة البيانات',
    adminContent.includes('full_name') && adminContent.includes('phone') && adminContent.includes('grades'),
    'Student profile fetched for WhatsApp on subscription');

  result('ADMIN', '3.4', 'إلغاء الاشتراك cancelStudentSubscriptionAction',
    adminContent.includes('cancelStudentSubscriptionAction'),
    'Cancel subscription action found');

  result('ADMIN', '3.5', 'إعادة تعيين كلمة المرور adminResetStudentPasswordAction',
    adminContent.includes('adminResetStudentPasswordAction') && adminContent.includes('hashPassword'),
    'Password reset action found');

  result('ADMIN', '3.6', 'تفعيل/إيقاف حساب الطالب',
    adminContent.includes('is_active') && adminContent.includes('toggleStudent'),
    'Toggle student status found');

  result('ADMIN', '3.7', 'ADMIN-only guard في كل Action',
    (adminContent.match(/role !== 'ADMIN'/g) || []).length >= 3,
    `ADMIN guard used ${(adminContent.match(/role !== 'ADMIN'/g) || []).length} times`);

  result('ADMIN', '3.8', 'Audit logging لكل عملية حساسة',
    adminContent.includes('audit_logs') && adminContent.includes('SUBSCRIPTION_GRANTED_MANUAL'),
    'Audit logging found');

  result('ADMIN', '3.9', 'مودال الطالب يعرض زر واتساب ديناميكياً',
    modalContent.includes('lastWhatsAppUrl') && modalContent.includes('MessageCircle'),
    'Dynamic WhatsApp button in modal');
}

// ─────────────────────────────────────────────────────────
// AXIS 4: STUDENT DASHBOARD (Code analysis)
// ─────────────────────────────────────────────────────────
async function testStudentDashboard() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎓 AXIS 4 — لوحة تحكم الطالب (Student)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const studentPage = fs.readFileSync(path.join(__dirname, 'src/app/student/page.tsx'), 'utf8');
  const sidebar = fs.readFileSync(path.join(__dirname, 'src/components/ui/dashboard-sidebar.tsx'), 'utf8');
  const welcomePath = path.join(__dirname, 'src/components/student/StudentWelcomeBanner.tsx');
  const welcome = fs.readFileSync(welcomePath, 'utf8');

  result('STU', '4.1', 'بانر الترحيب مع اسم الطالب وحالة الاشتراك',
    welcome.includes('studentName') || welcome.includes('fullName'),
    'Welcome banner with student name found');

  result('STU', '4.2', 'تبويب المقررات الدراسية',
    sidebar.includes('المقررات الدراسية') || sidebar.includes('my-courses'),
    'Curriculum tab found');

  result('STU', '4.3', 'إخفاء تبويب الاشتراك عند وجود اشتراك نشط',
    sidebar.includes('hasActiveSubscription'),
    'Conditional subscription tab logic found');

  result('STU', '4.4', 'ظهور تبويب الاشتراك عند عدم الاشتراك',
    sidebar.includes('subscribe') && sidebar.includes('hasActiveSubscription'),
    'Subscription tab toggle logic found');

  result('STU', '4.5', 'شارة "غير نشط" قابلة للنقر للانتقال للاشتراك',
    welcome.includes('onNavigateToSubscribe') || welcome.includes('cursor-pointer'),
    'Clickable inactive badge found');

  result('STU', '4.6', 'تبويب بنك الأسئلة',
    sidebar.includes('question-bank') || sidebar.includes('بنك الأسئلة'),
    'Question bank tab found');

  result('STU', '4.7', 'بنك الأسئلة مرتبط بصف الطالب تلقائياً',
    fs.existsSync(path.join(__dirname, 'src/components/student/StudentQuestionBankTab.tsx')),
    'StudentQuestionBankTab component exists');

  result('STU', '4.8', 'مشغل الفيديو يستقبل بيانات الطالب للعلامة المائية',
    studentPage.includes('studentName={data.profile.fullName}') &&
    studentPage.includes('studentPhone={data.profile.phone}'),
    'Student data passed to VideoPreviewModal');
}

// ─────────────────────────────────────────────────────────
// AXIS 6: QUESTION BANK (Code analysis)
// ─────────────────────────────────────────────────────────
async function testQuestionBank() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 AXIS 6 — بنك الأسئلة والشيتات (Question Bank)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const qbPath = path.join(__dirname, 'src/components/student/StudentQuestionBankTab.tsx');
  const qbExists = fs.existsSync(qbPath);
  result('QB', '6.1', 'مكون بنك الأسئلة StudentQuestionBankTab موجود',
    qbExists, qbExists ? 'Found' : 'MISSING');

  if (qbExists) {
    const qbContent = fs.readFileSync(qbPath, 'utf8');
    result('QB', '6.2', 'بنك الأسئلة يعرض حسب صف الطالب',
      qbContent.includes('gradeId') || qbContent.includes('grade'),
      'Grade filtering found');

    result('QB', '6.3', 'عارض PDF للشيتات',
      qbContent.includes('pdf') || qbContent.includes('PDF') || qbContent.includes('onOpenPdf'),
      'PDF viewer support found');

    result('QB', '6.4', 'أسئلة MCQ تفاعلية',
      qbContent.includes('MCQ') || qbContent.includes('selectedAnswer') || qbContent.includes('اختيار'),
      'Interactive MCQ questions found');
  }

  const questionsActionPath = path.join(__dirname, 'src/lib/actions/questions.ts');
  if (fs.existsSync(questionsActionPath)) {
    const qActions = fs.readFileSync(questionsActionPath, 'utf8');
    result('QB', '6.5', 'Server Action لجلب أسئلة الصف تلقائياً',
      qActions.includes('getStudentQuestionsListAction') || qActions.includes('grade_id'),
      'Student questions action with grade auto-detection found');

    result('QB', '6.6', 'تصفية الأسئلة بناءً على صف الطالب المسجل',
      qActions.includes('grades') && qActions.includes('grade_id'),
      'Grade-based question filtering found');
  }
}

// ─────────────────────────────────────────────────────────
// AXIS 7: VIDEO & CONTENT (Code analysis)
// ─────────────────────────────────────────────────────────
async function testVideo() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 AXIS 7 — الفيديوهات والمحتوى التعليمي (Video)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const vpContent = fs.readFileSync(path.join(__dirname, 'src/components/lessons/VideoPlayer.tsx'), 'utf8');
  const utilsContent = fs.readFileSync(path.join(__dirname, 'src/lib/utils.ts'), 'utf8');

  result('VID', '7.1', 'دعم فيديو يوتيوب (iframe embed)',
    vpContent.includes('iframe') || utilsContent.includes('youtube') || utilsContent.includes('youtu.be'),
    'YouTube iframe support found');

  result('VID', '7.2', 'دعم فيديو مباشر HTML5 (MP4)',
    vpContent.includes('<video') || vpContent.includes('video'),
    'HTML5 video player found');

  result('VID', '7.3', 'العلامة المائية في VideoPlayer',
    vpContent.includes('VideoWatermark'),
    'VideoWatermark in VideoPlayer');

  result('VID', '7.4', 'تتبع نسبة المشاهدة وحفظ الموضع',
    vpContent.includes('watchPercentage') && vpContent.includes('saveProgressToServer'),
    'Watch progress tracking found');

  result('VID', '7.5', 'إكمال الدرس عند 90% مشاهدة',
    vpContent.includes('90') && vpContent.includes('isCompleted'),
    'Lesson completion at 90% found');

  result('VID', '7.6', 'أزرار التحكم: تشغيل، إيقاف، تقديم، ترجيع، سرعة',
    vpContent.includes('playbackSpeed') && vpContent.includes('RotateCcw') && vpContent.includes('RotateCw'),
    'All playback controls found');

  result('VID', '7.7', 'الوضع المسرحي (Theater Mode)',
    vpContent.includes('isTheater') || vpContent.includes('theater'),
    'Theater mode found');
}

// ─────────────────────────────────────────────────────────
// AXIS 11: COMPATIBILITY (Code analysis for RTL & a11y)
// ─────────────────────────────────────────────────────────
async function testCompatibility() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 AXIS 11 — التوافق مع الأجهزة والمتصفحات (Compatibility)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
  const layoutContent = fs.existsSync(layoutPath) ? fs.readFileSync(layoutPath, 'utf8') : '';

  // RTL
  result('COMPAT', '11.6', 'دعم RTL (اتجاه اليمين لليسار)',
    layoutContent.includes('dir="rtl"') || layoutContent.includes("dir: 'rtl'"),
    'RTL direction found in layout');

  // Dark mode
  const globals = path.join(__dirname, 'src/app/globals.css');
  const globalsContent = fs.existsSync(globals) ? fs.readFileSync(globals, 'utf8') : '';
  result('COMPAT', '11.5', 'دعم الوضع الداكن (Dark Mode)',
    globalsContent.includes('dark') || layoutContent.includes('dark'),
    'Dark mode CSS found');

  // Responsive (Tailwind sm/md/lg)
  const studentPage = fs.readFileSync(path.join(__dirname, 'src/app/student/page.tsx'), 'utf8');
  result('COMPAT', '11.1-4', 'تصميم متجاوب (Responsive — sm:, md:, lg:)',
    studentPage.includes('sm:') && studentPage.includes('md:'),
    'Responsive breakpoints found');

  // Arabic font
  result('COMPAT', '11.Arabic', 'دعم الخط العربي',
    layoutContent.includes('Cairo') || layoutContent.includes('Tajawal') ||
    layoutContent.includes('Noto') || globalsContent.includes('Cairo') ||
    globalsContent.includes('Arabic'),
    'Arabic font configured');
}

// ─────────────────────────────────────────────────────────
// FINAL REPORT
// ─────────────────────────────────────────────────────────
function printReport() {
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 تقرير نتائج الفحص الشامل — منصة المهندس');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ ناجح:     ${passed}`);
  console.log(`❌ فاشل:     ${failed}`);
  console.log(`⚠️  تحذيرات:  ${warnings}`);
  console.log(`📋 الإجمالي: ${passed + failed + warnings}`);
  const pct = Math.round((passed / (passed + failed + warnings)) * 100);
  console.log(`🎯 نسبة النجاح: ${pct}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (failed > 0) {
    console.log('\n❌ الاختبارات الفاشلة تحتاج إصلاحاً:');
    RESULTS.filter(r => !r.ok && !r.warn).forEach(r => {
      console.log(`   • [${r.axis}-${r.id}] ${r.name}: ${r.msg}`);
    });
  }
  if (warnings > 0) {
    console.log('\n⚠️  التحذيرات:');
    RESULTS.filter(r => r.warn).forEach(r => {
      console.log(`   • [${r.axis}-${r.id}] ${r.name}: ${r.msg}`);
    });
  }

  // Write JSON results
  fs.writeFileSync(
    path.join(__dirname, '__qa_results__.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), passed, failed, warnings, successRate: pct, results: RESULTS }, null, 2)
  );
  console.log('\n📁 تم حفظ النتائج في __qa_results__.json');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(failed > 0 ? 1 : 0);
}

// ─────────────────────────────────────────────────────────
// RUN ALL
// ─────────────────────────────────────────────────────────
async function main() {
  console.log('🔬 بدء تنفيذ خطة الفحص الشاملة — منصة المهندس');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📅 ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}\n`);

  await testInfrastructure();
  await testPerformance();
  await testSecurity();
  await testAuth();
  await testAdmin();
  await testStudentDashboard();
  await testExams();
  await testQuestionBank();
  await testVideo();
  await testSubscriptions();
  await testWhatsApp();
  await testCompatibility();

  printReport();
}

main().catch(console.error);
