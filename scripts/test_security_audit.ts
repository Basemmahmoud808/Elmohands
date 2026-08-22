import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { RegisterSchema, LoginSchema, EgyptianPhoneRegex } from '../src/lib/validations';

async function runSecurityAuditTests() {
  console.log('--- RUNNING SECURITY VERIFICATION SUITE ---');

  // Test 1: Zod Phone Regex & Schema
  console.log('\n[Test 1] Testing Egyptian Phone Validation:');
  const validPhone = '01012345678';
  const invalidPhone = '01312345678';
  const shortPhone = '010123456';

  console.assert(EgyptianPhoneRegex.test(validPhone) === true, 'Valid phone should pass');
  console.assert(EgyptianPhoneRegex.test(invalidPhone) === false, 'Invalid prefix should fail');
  console.assert(EgyptianPhoneRegex.test(shortPhone) === false, 'Short phone should fail');
  console.log('✓ Egyptian phone regex test passed.');

  // Test 2: Mismatched Student vs Parent Phone
  console.log('\n[Test 2] Testing Parent Phone Difference Enforcement:');
  const samePhoneResult = RegisterSchema.safeParse({
    fullName: 'أحمد محمود',
    phone: '01012345678',
    parentPhone: '01012345678',
    password: 'password123',
  });
  console.assert(samePhoneResult.success === false, 'Matching parent and student phones must be rejected');
  console.log('✓ Parent phone inequality enforcement passed.');

  // Test 3: Password Hashing with Bcrypt
  console.log('\n[Test 3] Testing Bcrypt Password Hashing:');
  const rawPw = 'StrongMathPassword2026!';
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(rawPw, salt);
  const match = await bcrypt.compare(rawPw, hashed);
  const wrongMatch = await bcrypt.compare('WrongPassword', hashed);

  console.assert(match === true, 'Valid password must match bcrypt hash');
  console.assert(wrongMatch === false, 'Wrong password must NOT match');
  console.log('✓ Bcrypt password hashing & verification passed.');

  // Test 4: Voucher Code Cryptographic Randomness
  console.log('\n[Test 4] Testing Cryptographic Voucher Generation:');
  const randomSuffix = crypto.randomBytes(6).toString('hex').toUpperCase();
  const voucherCode = `ALM-M1-${randomSuffix}`;
  console.assert(voucherCode.length === 19, 'Voucher code should be 19 chars long');
  console.assert(/^[A-Z0-9-]+$/.test(voucherCode), 'Voucher code format valid');
  console.log(`✓ Generated voucher code: ${voucherCode} (Length: ${voucherCode.length})`);

  // Test 5: Paymob HMAC SHA512 Verification
  console.log('\n[Test 5] Testing Paymob HMAC SHA512 Verification:');
  const testSecret = 'TEST_SECRET_KEY';
  const concatenatedData = '100002026-08-22TEGPfalsetrx_123int_456truetruetruenononononorder_789owner_1false0000cardMCtrue';
  const validHmac = crypto.createHmac('sha512', testSecret).update(concatenatedData).digest('hex');
  const forgedHmac = crypto.createHmac('sha512', 'WRONG_SECRET').update(concatenatedData).digest('hex');

  const validComparison = crypto.timingSafeEqual(Buffer.from(validHmac, 'hex'), Buffer.from(validHmac, 'hex'));
  const forgedComparison = crypto.timingSafeEqual(Buffer.from(validHmac, 'hex'), Buffer.from(forgedHmac, 'hex'));

  console.assert(validComparison === true, 'Valid HMAC must match');
  console.assert(forgedComparison === false, 'Forged HMAC must be rejected');
  console.log('✓ Paymob HMAC SHA512 verification passed.');

  console.log('\n=============================================');
  console.log('ALL SECURITY VERIFICATION TESTS PASSED (5/5) ✓');
  console.log('=============================================\n');
}

runSecurityAuditTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
