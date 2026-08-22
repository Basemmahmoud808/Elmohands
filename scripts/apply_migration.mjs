import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const projectRef = 'ngcfncglbrwhtjdvlhbm';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const sql = fs.readFileSync('src/lib/supabase/schema.sql', 'utf8');

async function testSqlExec() {
  console.log('Testing SQL Execution on Supabase...');

  // Try method 1: Supabase Management SQL API endpoint
  const urls = [
    `https://ngcfncglbrwhtjdvlhbm.supabase.co/rest/v1/rpc/exec_sql`,
    `https://api.supabase.com/v1/projects/${projectRef}/query`,
    `https://ngcfncglbrwhtjdvlhbm.supabase.co/pg/query`,
  ];

  for (const url of urls) {
    try {
      console.log(`Trying ${url}...`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: 'SELECT 1 as test;' }),
      });
      console.log(`Response status: ${res.status}`);
      const text = await res.text();
      console.log(`Response text:`, text.slice(0, 200));
    } catch (err) {
      console.error(`Error on ${url}:`, err.message);
    }
  }
}

testSqlExec().catch(console.error);
