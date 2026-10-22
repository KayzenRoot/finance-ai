# Finance AI repository guidance

- Read `docs/checkpoint.md`, the relevant Work Order, and `docs/security.md` before making product changes.
- The checked-in planning docs and GitHub issues define approved scope. Do not silently expand it.
- Keep all fixtures synthetic. Never commit personal finances, bank records, real wallet addresses, credentials, tokens, keys, or seed phrases.
- Supabase tables exposed through the Data API require explicit grants and row-level security policies; test cross-owner access at the database boundary.
- Never use Supabase service-role credentials in browser code. Validate server sessions with `getClaims()` or `getUser()`, not `getSession()`.
- Wallet signatures authenticate identity only. Do not add transaction signing, transfers, payment initiation, or automatic financial decisions.
- Changes with external effects must stay in a draft PR until the applicable Work Order's evidence and validation gates are met.
- Run `npm run lint`, `npm run typecheck`, `npm run test:ci`, and `npm run build` before submitting application changes.

- Delivery policy: no mandatory human PR reviews or reviewer requests; never fake APPROVED. Keep branch protection, required CI/security checks, objective evidence and normal squash merges. Production/deploy/financial-data gates remain separate. See docs/review-policy.md.
