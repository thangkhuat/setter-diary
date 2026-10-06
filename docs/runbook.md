# Runbook

How to deploy, roll back, restore and rotate secrets for Setter Diary. Everything runs on Cloudflare's Workers Free plan; nothing here should ever change the plan.

| What | Where |
| --- | --- |
| Production app | `https://app.setter-diary.workers.dev` |
| Worker | `app` (`setter-diary` in the address is the Cloudflare account's subdomain) |
| Database | D1 `setter-diary`, Oceania (`--location=oc`), bound as `DB` |
| PR previews | Worker `app-pr-<PR number>`, D1 `setter-diary-pr-<PR number>` |
| Pipelines | `.github/workflows/ci.yml`, `preview-cleanup.yml`, `backup.yml` |

Commands below use `npx wrangler`. Run `npx wrangler login` first on a new machine.

## First-time setup

Done once per Cloudflare account and GitHub repository.

1. **Database.** `npx wrangler d1 create setter-diary --location=oc`, then put the printed id in `wrangler.jsonc` under `d1_databases[0].database_id`. (Done on 2026-10-06.)
2. **Cloudflare API token for CI.** In the Cloudflare dashboard: My Profile → API Tokens → Create Token → Custom token, with these account permissions and nothing else:
   - Workers Scripts: Edit
   - D1: Edit
   - Account Settings: Read
3. **GitHub secrets** (repository → Settings → Secrets and variables → Actions):
   - `CLOUDFLARE_API_TOKEN`: the token from step 2
   - `CLOUDFLARE_ACCOUNT_ID`: shown by `npx wrangler whoami`
   - `BACKUP_PASSPHRASE`: a long random passphrase. Keep a copy in your password manager: without it the weekly backups cannot be read.

   With the GitHub CLI: `gh secret set CLOUDFLARE_API_TOKEN` (it prompts for the value), and the same for the other two.
4. **Usage notifications.** In the Cloudflare dashboard, turn on usage notifications for Workers and D1 so you hear about daily limits before users do.

## Deploy

Merging to `main` deploys. CI runs the checks, applies migrations to the production D1, deploys the Worker and smoke-tests `/api/health`.

To deploy by hand (only if CI is unavailable):

```sh
npm ci
npm run db:migrate   # applies pending migrations to production
npm run deploy       # builds and deploys
npm run smoke -- https://app.setter-diary.workers.dev
```

Migrations are expand/contract: add in one deploy, remove in a later one, so the previous version of the code keeps working against the new schema.

## Pull-request previews

Each pull request from this repository gets its own Worker (`app-pr-<N>`, at `https://app-pr-<N>.setter-diary.workers.dev`) and its own D1 (`setter-diary-pr-<N>`), with the URL posted as a PR comment. Closing the PR deletes both. Previews never share production's Worker, secrets or data.

A preview's database lives as long as its pull request and is only ever migrated forward. If you regenerate a migration on the branch, close and reopen the pull request to get a fresh database.

The Free plan allows 10 D1 databases per account, so at most 9 pull requests can have a preview at once. If a cleanup run failed, delete leftovers by hand:

```sh
npx wrangler delete app-pr-<N> --force
npx wrangler d1 delete setter-diary-pr-<N>
```

## Roll back a bad deploy

```sh
npx wrangler deployments list     # find the last good version
npx wrangler rollback             # back to the previous version
npx wrangler rollback <version-id>  # or to a specific one
```

If CI's "Smoke-test production" step fails, the new version is already live: check the app, and roll back if it is broken.

A rollback changes code only, not the database. That is safe because migrations are expand/contract. Then fix forward on a branch; the next merge to `main` deploys over the rollback.

## Restore the database

### Within the last 7 days: Time Travel

D1 Time Travel restores the database to any minute in the last 7 days on the Free plan. It overwrites the current data, so note the current bookmark first; it lets you undo the restore.

```sh
npx wrangler d1 time-travel info setter-diary                                   # current bookmark: write it down
npx wrangler d1 time-travel restore setter-diary --timestamp=2026-10-06T02:00:00Z
```

To undo: `npx wrangler d1 time-travel restore setter-diary --bookmark=<the bookmark you wrote down>`.

### Older than 7 days: weekly backup

Every week `backup.yml` exports the database, encrypts it with `BACKUP_PASSPHRASE` and stores it as a workflow artifact for 30 days. The repository is public, so the artifact is downloadable by any signed-in GitHub user; the encryption is what keeps it private.

1. GitHub → Actions → Weekly backup → pick a run → download `d1-backup-<run id>`.
2. Decrypt: `gpg --decrypt --output backup.sql backup.sql.gpg` (it asks for the passphrase).
3. Restore into a new database first and check it:

   ```sh
   npx wrangler d1 create setter-diary-restore --location=oc   # needs a free slot: the Free plan allows 10 databases
   npx wrangler d1 execute setter-diary-restore --remote --file backup.sql
   ```

4. When it looks right, point `wrangler.jsonc` at the restored database's id and deploy, or copy the rows you need across.
5. Delete `backup.sql` from your machine afterwards.

Run a backup at any time from GitHub → Actions → Weekly backup → Run workflow.

Two things to know:

- GitHub switches off scheduled workflows after 60 days without repository activity and emails you. Re-enable it from Actions → Weekly backup → Enable workflow.
- Anyone who downloaded an encrypted backup keeps it after the 30 days, and changing the passphrase later does not protect copies already taken. The protection is the passphrase itself: use a long random one (`openssl rand -base64 32`) and never reuse it.

## Rotate secrets

| Secret | Where it lives | How to rotate | Effect |
| --- | --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | GitHub secret | Cloudflare dashboard → API Tokens → Roll, then `gh secret set CLOUDFLARE_API_TOKEN` | CI fails until the new value is set |
| `BACKUP_PASSPHRASE` | GitHub secret and your password manager | `gh secret set BACKUP_PASSPHRASE` | Older backups still need the old passphrase: keep it until they expire (30 days) |
| Worker secrets (none yet; Story 1.3 adds `BETTER_AUTH_SECRET` and the Google client secret) | Cloudflare, per Worker | `npx wrangler secret put <NAME>` | Rotating `BETTER_AUTH_SECRET` signs everyone out |

Never commit a secret. Configuration that is not secret (quotas, model names) lives in `wrangler.jsonc` under `vars`.

## Rate limiting on the Free plan

Checked on 2026-10-06 against the deployed Worker: the Workers Rate Limiting binding works on the Workers Free plan. It counts approximately. With a limit of 5 calls per 10 seconds, between 8 and 12 calls got through before the rest were refused with `429`; refusals then held until the window passed. Set limits with headroom for that, and never rely on the binding for an exact count.
