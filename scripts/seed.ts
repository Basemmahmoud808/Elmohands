import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

interface ActivationCodePayload {
  code: string;
  status: string;
  plan_id?: string;
  created_by?: string;
}

// Load environment variables from .env.local if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('🌱 Starting Almohands database seeding...');

  // 1. Seed Admin Profile
  let adminId: string | null = null;
  const adminPhone = '01008901896';
  try {
    const passwordHash = await bcrypt.hash('Admin@123456', 10);
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', adminPhone)
      .maybeSingle();

    if (existingAdmin) {
      adminId = existingAdmin.id;
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          full_name: 'م/ رضا خيرت',
          email: 'Khyratreda@gmail.com',
          role: 'ADMIN',
          password_hash: passwordHash,
          is_active: true,
        })
        .eq('id', adminId);

      if (updateErr) {
        console.warn(`⚠️ Warning updating admin profile: ${updateErr.message}`);
      } else {
        console.log(`✅ Admin profile updated (${adminPhone})`);
      }
    } else {
      const { data: newAdmin, error: adminErr } = await supabase
        .from('profiles')
        .insert({
          full_name: 'م/ رضا خيرت',
          phone: adminPhone,
          email: 'Khyratreda@gmail.com',
          role: 'ADMIN',
          password_hash: passwordHash,
          is_active: true,
        })
        .select('id')
        .single();

      if (adminErr) {
        console.warn(`⚠️ Warning creating admin profile: ${adminErr.message}`);
      } else if (newAdmin) {
        adminId = newAdmin.id;
        console.log(`✅ Admin profile created (${adminPhone})`);
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ Exception in Admin profile seeding: ${err.message}`);
  }

  // 2. Seed 4 Egyptian Grades
  const gradeDefs = [
    { name: 'الصف الأول الإعدادي', stage: 'إعدادي', sort_order: 1 },
    { name: 'الصف الثاني الإعدادي', stage: 'إعدادي', sort_order: 2 },
    { name: 'الصف الثالث الإعدادي', stage: 'إعدادي', sort_order: 3 },
    { name: 'الصف الأول الثانوي', stage: 'ثانوي', sort_order: 4 },
  ];

  const gradeMap: Record<string, string> = {}; // gradeName -> gradeId

  try {
    for (const g of gradeDefs) {
      const { data: existingGrade } = await supabase
        .from('grades')
        .select('id')
        .eq('name', g.name)
        .maybeSingle();

      if (existingGrade) {
        gradeMap[g.name] = existingGrade.id;
      } else {
        const { data: newGrade, error: gErr } = await supabase
          .from('grades')
          .insert({
            name: g.name,
            stage: g.stage,
            sort_order: g.sort_order,
            is_active: true,
          })
          .select('id')
          .single();

        if (gErr) {
          console.warn(`⚠️ Warning seeding grade ${g.name}: ${gErr.message}`);
        } else if (newGrade) {
          gradeMap[g.name] = newGrade.id;
        }
      }
    }
    console.log(`✅ ${Object.keys(gradeMap).length} / ${gradeDefs.length} Grades seeded/verified`);
  } catch (err: any) {
    console.warn(`⚠️ Exception in Grades seeding: ${err.message}`);
  }

  // 3. Seed 2 Terms & Branches per Grade
  const termDefs = [
    { name: 'الترم الأول', sort_order: 1 },
    { name: 'الترم الثاني', sort_order: 2 },
  ];

  let termsSeeded = 0;
  let branchesSeeded = 0;

  for (const [gradeName, gradeId] of Object.entries(gradeMap)) {
    const isSecondary = gradeName.includes('الثانوي');

    for (const t of termDefs) {
      let termId: string | null = null;
      try {
        const { data: existingTerm, error: tQueryErr } = await supabase
          .from('terms')
          .select('id')
          .eq('grade_id', gradeId)
          .eq('name', t.name)
          .maybeSingle();

        if (tQueryErr) {
          console.warn(`⚠️ Note: terms table query (${t.name}): ${tQueryErr.message}`);
          continue;
        }

        if (existingTerm) {
          termId = existingTerm.id;
          termsSeeded++;
        } else {
          const { data: newTerm, error: tErr } = await supabase
            .from('terms')
            .insert({
              grade_id: gradeId,
              name: t.name,
              sort_order: t.sort_order,
            })
            .select('id')
            .single();

          if (tErr) {
            console.warn(`⚠️ Warning seeding term ${t.name} for ${gradeName}: ${tErr.message}`);
          } else if (newTerm) {
            termId = newTerm.id;
            termsSeeded++;
          }
        }
      } catch (err: any) {
        console.warn(`⚠️ Exception in Term seeding (${t.name}): ${err.message}`);
        continue;
      }

      if (!termId) continue;

      // Seed Branches per Term
      const branchNames = isSecondary
        ? [
            { name: 'فرع الجبر والإحصاء', sort_order: 1 },
            { name: 'فرع الهندسة والقياس وحساب المثلثات', sort_order: 2 },
          ]
        : [
            { name: 'فرع الجبر والإحصاء', sort_order: 1 },
            { name: 'فرع الهندسة والقياس', sort_order: 2 },
          ];

      for (const b of branchNames) {
        let branchId: string | null = null;
        try {
          const { data: existingBranch } = await supabase
            .from('branches')
            .select('id')
            .eq('term_id', termId)
            .eq('name', b.name)
            .maybeSingle();

          if (existingBranch) {
            branchId = existingBranch.id;
            branchesSeeded++;
          } else {
            const { data: newBranch, error: bErr } = await supabase
              .from('branches')
              .insert({
                term_id: termId,
                name: b.name,
                sort_order: b.sort_order,
              })
              .select('id')
              .single();

            if (bErr) {
              console.warn(`⚠️ Warning seeding branch ${b.name}: ${bErr.message}`);
            } else if (newBranch) {
              branchId = newBranch.id;
              branchesSeeded++;
            }
          }
        } catch (err: any) {
          console.warn(`⚠️ Exception in Branch seeding (${b.name}): ${err.message}`);
          continue;
        }

        if (!branchId) continue;

        // 4. Seed Sample Units & Lessons for Prep 1
        if (gradeName === 'الصف الأول الإعدادي' && t.name === 'الترم الأول' && b.name === 'فرع الجبر والإحصاء') {
          const prepUnits = [
            {
              title: 'الوحدة الأولى: الأعداد النسبية',
              description: 'مفهوم الأعداد النسبية والعمليات عليها',
              sort_order: 1,
              lessons: [
                {
                  title: 'مجموعة الأعداد النسبية',
                  description: 'تعريف العدد النسبي والصور المختلفة له',
                  video_path: 'https://www.youtube.com/embed/placeholder_lesson_1',
                  thumbnail_path: 'https://placehold.co/600x400/0f172a/38bdf8?text=Lesson+1',
                  pdf_path: '/worksheets/prep1_algebra_unit1_lesson1.pdf',
                  duration: 25,
                  sort_order: 1,
                },
                {
                  title: 'مقارنة وترتيب الأعداد النسبية',
                  description: 'كيفية تمثيل ومقارنة الأعداد النسبية على خط الأعداد',
                  video_path: 'https://www.youtube.com/embed/placeholder_lesson_2',
                  thumbnail_path: 'https://placehold.co/600x400/0f172a/38bdf8?text=Lesson+2',
                  pdf_path: '/worksheets/prep1_algebra_unit1_lesson2.pdf',
                  duration: 30,
                  sort_order: 2,
                },
              ],
            },
            {
              title: 'الوحدة الثانية: الحدود والمقادير الجبرية',
              description: 'الحدود الجبرية والعمليات عليها',
              sort_order: 2,
              lessons: [
                {
                  title: 'الحد الجبري والمقدار الجبري',
                  description: 'درجة الحد الجبري والمقدار الجبري والحدود المتشابهة',
                  video_path: 'https://www.youtube.com/embed/placeholder_lesson_3',
                  thumbnail_path: 'https://placehold.co/600x400/0f172a/38bdf8?text=Lesson+3',
                  pdf_path: '/worksheets/prep1_algebra_unit2_lesson1.pdf',
                  duration: 20,
                  sort_order: 1,
                },
              ],
            },
          ];

          for (const uDef of prepUnits) {
            let unitId: string | null = null;
            try {
              const { data: existingUnit } = await supabase
                .from('units')
                .select('id')
                .eq('branch_id', branchId)
                .eq('title', uDef.title)
                .maybeSingle();

              if (existingUnit) {
                unitId = existingUnit.id;
              } else {
                const { data: newUnit, error: uErr } = await supabase
                  .from('units')
                  .insert({
                    branch_id: branchId,
                    title: uDef.title,
                    description: uDef.description,
                    sort_order: uDef.sort_order,
                    is_active: true,
                  })
                  .select('id')
                  .single();

                if (uErr) {
                  console.warn(`⚠️ Warning seeding unit ${uDef.title}: ${uErr.message}`);
                } else if (newUnit) {
                  unitId = newUnit.id;
                }
              }
            } catch (err: any) {
              console.warn(`⚠️ Exception in Unit seeding: ${err.message}`);
              continue;
            }

            if (!unitId) continue;

            for (const lDef of uDef.lessons) {
              try {
                const { data: existingLesson } = await supabase
                  .from('lessons')
                  .select('id')
                  .eq('unit_id', unitId)
                  .eq('title', lDef.title)
                  .maybeSingle();

                if (!existingLesson) {
                  const { error: lErr } = await supabase.from('lessons').insert({
                    unit_id: unitId,
                    title: lDef.title,
                    description: lDef.description,
                    video_path: lDef.video_path,
                    thumbnail_path: lDef.thumbnail_path,
                    pdf_path: lDef.pdf_path,
                    duration: lDef.duration,
                    sort_order: lDef.sort_order,
                    is_published: true,
                    is_locked: false,
                  });

                  if (lErr) {
                    console.warn(`⚠️ Warning seeding lesson ${lDef.title}: ${lErr.message}`);
                  }
                }
              } catch (err: any) {
                console.warn(`⚠️ Exception in Lesson seeding: ${err.message}`);
              }
            }
          }
          console.log(`✅ Sample units & lessons processed for Grade Prep 1`);
        }
      }
    }
  }

  if (termsSeeded > 0) {
    console.log(`✅ ${termsSeeded} Terms seeded/verified`);
  }
  if (branchesSeeded > 0) {
    console.log(`✅ ${branchesSeeded} Branches seeded/verified`);
  }

  // 5. Seed 3 Subscription Plans
  const planDefs = [
    { name: 'اشتراك شهر', description: 'وصول كامل للمنصة لمدة 30 يوماً', price: 150.00, duration_days: 30 },
    { name: 'اشتراك ترم', description: 'وصول كامل للمنصة لمفردات الترم الدراسي (120 يوماً)', price: 450.00, duration_days: 120 },
    { name: 'اشتراك سنة', description: 'وصول كامل للمنصة للعام الدراسي الكامل (365 يوماً)', price: 850.00, duration_days: 365 },
  ];

  const planMap: Record<number, string> = {}; // duration_days -> id

  try {
    for (const p of planDefs) {
      let planId: string | null = null;
      const { data: existingPlan } = await supabase
        .from('plans')
        .select('id')
        .eq('name', p.name)
        .eq('duration_days', p.duration_days)
        .maybeSingle();

      if (existingPlan) {
        planId = existingPlan.id;
      } else {
        const { data: newPlan, error: pErr } = await supabase
          .from('plans')
          .insert({
            name: p.name,
            description: p.description,
            price: p.price,
            duration_days: p.duration_days,
            is_active: true,
          })
          .select('id')
          .single();

        if (pErr) {
          console.warn(`⚠️ Warning seeding plan ${p.name}: ${pErr.message}`);
        } else if (newPlan) {
          planId = newPlan.id;
        }
      }

      if (planId) {
        planMap[p.duration_days] = planId;
      }
    }
    console.log(`✅ ${Object.keys(planMap).length} / 3 Subscription Plans seeded/verified`);
  } catch (err: any) {
    console.warn(`⚠️ Exception in Subscription Plans seeding: ${err.message}`);
  }

  // 6. Seed 15 Activation Codes (5 per plan)
  const codeList = [
    // 30 days
    { code: 'MTH30-2026-0001', duration: 30 },
    { code: 'MTH30-2026-0002', duration: 30 },
    { code: 'MTH30-2026-0003', duration: 30 },
    { code: 'MTH30-2026-0004', duration: 30 },
    { code: 'MTH30-2026-0005', duration: 30 },
    // 120 days
    { code: 'TRM120-2026-0001', duration: 120 },
    { code: 'TRM120-2026-0002', duration: 120 },
    { code: 'TRM120-2026-0003', duration: 120 },
    { code: 'TRM120-2026-0004', duration: 120 },
    { code: 'TRM120-2026-0005', duration: 120 },
    // 365 days
    { code: 'YR365-2026-0001', duration: 365 },
    { code: 'YR365-2026-0002', duration: 365 },
    { code: 'YR365-2026-0003', duration: 365 },
    { code: 'YR365-2026-0004', duration: 365 },
    { code: 'YR365-2026-0005', duration: 365 },
  ];

  let codesSeeded = 0;
  try {
    for (const c of codeList) {
      const planId = planMap[c.duration];
      const payload: ActivationCodePayload = {
        code: c.code,
        status: 'UNUSED',
      };
      if (planId) {
        payload.plan_id = planId;
      }
      if (adminId) {
        payload.created_by = adminId;
      }

      let { error: codeErr } = await supabase
        .from('activation_codes')
        .upsert(payload, { onConflict: 'code' });

      if (codeErr && codeErr.message.includes('created_by')) {
        delete payload.created_by;
        const res2 = await supabase
          .from('activation_codes')
          .upsert(payload, { onConflict: 'code' });
        codeErr = res2.error;
      }

      if (codeErr && codeErr.message.includes('plan_id')) {
        delete payload.plan_id;
        const res3 = await supabase
          .from('activation_codes')
          .upsert(payload, { onConflict: 'code' });
        codeErr = res3.error;
      }

      if (codeErr) {
        console.warn(`⚠️ Warning seeding activation code ${c.code}: ${codeErr.message}`);
      } else {
        codesSeeded++;
      }
    }
    console.log(`✅ ${codesSeeded} / 15 Activation Codes seeded/verified`);
  } catch (err: any) {
    console.warn(`⚠️ Exception in Activation Codes seeding: ${err.message}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
