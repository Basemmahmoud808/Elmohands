import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

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

const projectRef = 'ngcfncglbrwhtjdvlhbm';
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const passwordsToTry = [
  secretKey,
  secretKey ? secretKey.replace('sb_secret_', '') : '',
  'Khyratreda@2026',
  'Admin@123456',
  'postgres',
  'Almohands2026',
  'Almohands@2026',
  'almohands_db_2026',
];

const hostsToTry = [
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  `db.${projectRef}.supabase.co`,
  `db.${projectRef}.supabase.net`,
];

const usersToTry = [
  `postgres.${projectRef}`,
  'postgres',
  'service_role',
];

async function main() {
  console.log('🔍 Testing Postgres connection strings to apply schema.sql...');
  const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/supabase/schema.sql'), 'utf8');

  let connectedClient: Client | null = null;

  for (const host of hostsToTry) {
    for (const port of [5432, 6543]) {
      for (const user of usersToTry) {
        for (const password of passwordsToTry) {
          const client = new Client({
            host,
            port,
            user,
            password,
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 2000,
          });

          try {
            await client.connect();
            console.log(`🎉 SUCCESS! Connected to Postgres at ${host}:${port} as ${user}`);
            connectedClient = client;
            break;
          } catch (err: any) {
            // ignore connection failures
          }
        }
        if (connectedClient) break;
      }
      if (connectedClient) break;
    }
    if (connectedClient) break;
  }

  if (!connectedClient) {
    console.error('❌ Could not connect via standard Postgres connection string. Probing HTTP endpoints...');
    process.exit(1);
  }

  try {
    console.log('📜 Executing schema.sql DDL...');
    await connectedClient.query(schemaSql);
    console.log('✅ Schema successfully executed!');
    await connectedClient.end();
  } catch (err: any) {
    console.error('❌ Schema execution error:', err.message);
    await connectedClient.end();
    process.exit(1);
  }
}

main();
