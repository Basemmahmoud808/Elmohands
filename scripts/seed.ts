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
      }
    }
  }

  if (termsSeeded > 0) {
    console.log(`✅ ${termsSeeded} Terms seeded/verified`);
  }
  if (branchesSeeded > 0) {
    console.log(`✅ ${branchesSeeded} Branches seeded/verified`);
  }

  // 5. Seed 3 Subscription Plans (Real Plans)
  const planDefs = [
    { name: 'اشتراك شهر', description: 'وصول كامل للمنصة لمدة 30 يوماً', price: 150.00, duration_days: 30 },
    { name: 'اشتراك ترم', description: 'وصول كامل للمنصة لمفردات الترم الدراسي (120 يوماً)', price: 450.00, duration_days: 120 },
    { name: 'اشتراك سنة', description: 'وصول كامل للمنصة للعام الدراسي الكامل (365 يوماً)', price: 850.00, duration_days: 365 },
  ];

  try {
    for (const p of planDefs) {
      const { data: existingPlan } = await supabase
        .from('plans')
        .select('id')
        .eq('name', p.name)
        .eq('duration_days', p.duration_days)
        .maybeSingle();

      if (!existingPlan) {
        await supabase
          .from('plans')
          .insert({
            name: p.name,
            description: p.description,
            price: p.price,
            duration_days: p.duration_days,
            is_active: true,
          });
      }
    }
    console.log(`✅ Real Subscription Plans seeded/verified`);
  } catch (err: any) {
    console.warn(`⚠️ Exception in Subscription Plans seeding: ${err.message}`);
  }

  console.log('🎉 Academic structure seeded successfully with zero dummy data!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
