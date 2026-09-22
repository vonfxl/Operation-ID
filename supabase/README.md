# Database stages A and B

These files prepare editable OPID instruction content. They have not been applied
to a Supabase project. The public frontend, coverRequired(), checklist logic,
shared staff reminder, and GUIDE_DATA.special are unchanged.

## Apply in Supabase

1. Open the project's SQL Editor as the project owner.
2. Run `migrations/202609220001_state_rules.sql` once. The transaction creates
   both tables, constraints, timestamp trigger, grants, and RLS policies together.
3. Run `seed.sql`. Reruns insert missing state codes only and never overwrite
   admin edits. A conflicting state name under another code fails rather than
   silently merging inconsistent data.
4. Create the intended admin account in Supabase Authentication. Copy its user
   UUID, then run the following in the SQL Editor, replacing the placeholder:

   ```sql
   insert into public.admin_users (user_id)
   values ('REPLACE_WITH_AUTH_USER_UUID'::uuid)
   on conflict (user_id) do nothing;
   ```

Do not run the placeholder unchanged. No account is automatically an admin.
No public signup or browser request can create admin membership. The future
admin page will use Supabase Auth email/password login; it is not implemented
in these stages.

## Access model

| Caller | state_rules | admin_users |
| --- | --- | --- |
| Anonymous | Read active rows only | No access |
| Signed in, not an admin | Read active rows only | Read own membership (normally no row) |
| Signed in, approved admin | Read all; insert/update/delete | Read own membership only |
| Project owner via SQL Editor | Manage database and membership | Provision/revoke admins |

Policies check the allowlist on each request. Membership removal revokes rule
editing without relying on hiding buttons or refreshing custom JWT claims.
Both tables have RLS enabled. UPDATE has both USING and WITH CHECK conditions.
Client grants exclude TRUNCATE and membership writes. No SECURITY DEFINER
function is needed. The timestamp trigger preserves created_at and sets
updated_at for every update, including verification-date updates.

The public data includes staff_note: it is a state-specific public reminder,
not a place for confidential staff information. Later browser configuration
may contain only the project URL and publishable/anon key. Never commit a
service_role key, database password, or admin password.

## Seed inventory and provenance

Source: `vonfxl/Operation-ID`, commit
`bef8b2b517ccf24b6977071b3817aff561e44295`, `data.js` and `app.js`.

- 56 distinct rows: 50 states, DC, and five territories.
- 25 non-NULL default instructions plus two overrides preserve all 27 original
  special-instruction strings, including punctuation and embedded newlines.
- Illinois-state becomes Illinois/IL's default; Illinois-Cook County becomes
  `instruction_overrides.cook_county`.
- New York State becomes New York/NY's default; New York City becomes
  `instruction_overrides.nyc`.
- The database rejects other override keys and overrides on other states.
  The two existing variants are intentional, not duplicate state records.
- All rows are active. All staff_note and last_verified values are NULL.
  No date in a reference-document title is treated as a verification date.
- California's source_url is its existing embedded lavote.gov link. New Jersey's
  is the existing `U.nj` forms link. The other 54 source URLs are NULL. These
  links are existing resources, not evidence that every rule was verified.
- No rule wording has been corrected or updated. Maryland's multiline text
  and references to named staff are preserved for later human review.

The 31 rows without a special instruction are: Texas, Arizona, Arkansas,
Colorado, Connecticut, District of Columbia, Hawaii, Idaho, Kentucky,
Massachusetts, Montana, Nevada, New Mexico, North Dakota, Ohio, Oklahoma,
Oregon, Rhode Island, South Dakota, Tennessee, Utah, Vermont, Virginia,
Washington, West Virginia, Wyoming, American Samoa, Guam, Northern Mariana
Islands, Puerto Rico, and U.S. Virgin Islands.

Texas keeps its separate existing workflow. “U.S. citizen born abroad” and
“Other country” are not states/territories and are not seeded; their existing
frontend branches remain. Missing instructions use the frontend fallback in
stage C. The shared staff reminder stays in the frontend unless a non-NULL
state-specific staff_note is supplied.

## Validation and remaining gates

Local data validation checks seed coverage, unique names/codes, exact rule
wording, NULL metadata, and the two override mappings against the source.
The original five tracked site files must remain unchanged in stages A/B.

PostgreSQL/Supabase runtime testing is still required: migration execution,
constraints, timestamp updates, anonymous access, non-admin denials, admin
CRUD, and denied membership escalation. No successful live database or RLS
test is claimed until these run against a configured database.

Stages C–E (frontend, admin, tests/documentation) are pending. Before stage F,
present full verification results and obtain the user's approval. Do not
remove GUIDE_DATA.special before that approval.
