-- ⚠️  WIPES ALL TABLES AND SEQUENCES — run in Supabase SQL Editor only
-- After this, run:  npm run db:push  then  npm run db:seed

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
