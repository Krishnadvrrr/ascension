# Ascension database audit — 12 November 2026

## Result

The previous deployment configuration is not suitable for important user data.
It hardcodes a local SQLite file on a free Render web service. Render discards
local files on restart, redeploy, or idle shutdown. SQLite itself can store data
for 100 people; the deployment's lack of persistent storage is the critical risk.

Only the local database was inspected: integrity check OK, one account, zero
tasks/logbooks/attendance/weight records. The live Render database, deployment
environment, backups, and account histories have NOT been inspected.

## Changes prepared locally

- PostgreSQL DATABASE_URL support, bounded connection pool and stale connection checks.
- Render startup requires PostgreSQL and FLASK_SECRET_KEY, avoiding silent creation
  of a new temporary database or use of the old publicly known signing key.
- Login migrates old plaintext passwords to hashes without changing account IDs.
- Case-insensitive unique usernames enforced in the database.
- Requests without a session or target account are rejected; cross-account access denied.
- Account row locks serialize mutations; repeated same-name/category task submissions
  on the same UTC day return the existing completion without awarding XP twice.
- Daily log and attendance uniqueness; account/time indexes for task and weight history.
- Completed quests restored from persisted tasks; daily log history no longer capped at 30.
- Shadow unlocks and equipped inventory items saved per account and loaded on another device.
- Login network failures stay on login; task save failures no longer show success.
- Additive schema upgrade fails visibly on conflicts, preserving records for reconciliation.
- Authenticated GET /account/export/<account-id> exports personal history, never passwords.
- Database-backed login limits, input size checks, secure cookies, response headers,
  and a disabled Google button until Google login is properly configured.
- Encrypted database backup and empty-database restore tool; tested on an isolated
  database with account and task records.

## Evidence and limitations

Run `venv\Scripts\python.exe audit_database.py`. It creates a temporary database,
registers 100 accounts, seeds 36,500 daily logs, signs in with separate clients,
checks isolation and invalid logins, and submits 16 concurrent duplicate tasks.
This is a correctness test using SQLite, NOT a production PostgreSQL capacity or
latency benchmark. The script never opens the user's normal database.

PostgreSQL integration, realistic concurrent usage and browser flows still need
checking on staging. Days currently use UTC. Password reset remains follow-up
work. No service can promise zero failures.

## Safe rollout — complete before deploying these changes

1. The owner confirmed on 12 November that a fresh start is acceptable, so no
   migration of the temporary live SQLite records is required. The local empty
   database is not a substitute for any later live backup.
2. Use the Neon Free `ascension-production` PostgreSQL project in Oregon, matching
   the existing Render service. The earlier Singapore project is empty. Neon's current Free allowance is
   1 GB storage and 100 CU-hours per month per project, with a limited restore
   window of up to six hours or 1 GB of changes. This is sufficient as a starting
   point for a small group, not a guarantee of 100 simultaneous users or unlimited
   history. Monitor usage. Do not use Render's expiring Free Postgres database.
3. Configure DATABASE_URL and a random FLASK_SECRET_KEY in Render's Environment.
   Keep the signing key stable across deployments. Never commit credentials.
4. Deploy the tested code, then test a fresh-device login and save/reload against
   PostgreSQL and recheck after a restart.
5. Generate a private Fernet BACKUP_KEY and run `backup_database.py backup`
   regularly from a trusted machine with `DATABASE_URL` and `BACKUP_KEY` set in
   its environment. Store the encrypted file off the Render instance and keep
   BACKUP_KEY separately. Run `audit_backup.py` to verify the local backup logic;
   perform a restore drill against a separate empty Neon branch/database before
   relying on it. This is a manual backup until scheduling is configured.

Code changes must not be pushed until the two Render environment variables are
configured: Render currently auto-deploys on Git commits, and the startup guards
intentionally prevent an unsafe configuration.

Official hosting and plan details: https://render.com/docs/free and
https://neon.com/pricing
