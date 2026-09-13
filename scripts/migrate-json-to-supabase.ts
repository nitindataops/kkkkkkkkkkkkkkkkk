import 'dotenv/config';
import { executeSupabaseMigration } from '../src/server/db/supabaseMigrationService';
import { isSupabaseConfigured, testSupabaseConnection } from '../src/server/db/supabaseClient';

async function run() {
  console.log('====================================================');
  console.log('  KISANSETU: JSON -> SUPABASE POSTGRESQL MIGRATION  ');
  console.log('====================================================');

  console.log('\n[1/3] Checking Supabase configuration...');
  if (!isSupabaseConfigured()) {
    console.error('❌ Error: Supabase credentials are missing!');
    console.error('Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
    process.exit(1);
  }
  console.log('✓ Supabase credentials present.');

  console.log('\n[2/3] Testing PostgreSQL connection...');
  const connTest = await testSupabaseConnection();
  if (!connTest.connected) {
    console.error(`❌ Connection failed: ${connTest.message}`);
    process.exit(1);
  }
  console.log(`✓ Connected (${connTest.latencyMs}ms): ${connTest.message}`);

  console.log('\n[3/3] Executing data migration...');
  const result = await executeSupabaseMigration();

  console.log('\n================== MIGRATION REPORT ==================');
  console.log(`Status:  ${result.status.toUpperCase()}`);
  console.log(`Message: ${result.message}`);
  console.log('\nEntity Verification Counts:');
  console.table(result.counts);

  if (result.errors.length > 0) {
    console.warn('\nWarnings / Errors:');
    result.errors.forEach((e) => console.warn(` - ${e}`));
  }

  if (result.success) {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } else {
    console.error('\n⚠️ Migration completed with errors.');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Unhandled migration failure:', err);
  process.exit(1);
});
