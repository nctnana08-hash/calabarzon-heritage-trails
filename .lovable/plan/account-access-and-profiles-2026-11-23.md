# Account access and profiles

## What will change
- Keep email/password sign-in enabled and leave email confirmation settings unchanged.
- Store signup names and provinces in user-owned profile records; keep admin access in the separate administrator assignments.
- Enforce administrator-only destination and destination-image changes in Lovable Cloud, while regular accounts can browse.
- Set up the requested admin and regular accounts after you provide real email addresses; generate strong passwords for them.

## Technical details
- Add a `public.profiles` table with signup-triggered creation, owner-scoped read/update policies, and the required grants.
- Read profile values through the existing sign-in hook, while authorization continues to use the existing `is_sulyap_admin()` check and `sulyap_admins` table.
- Replace open destination write policies and image upload policies with authenticated administrator-only policies.
- Preserve the current confirmation settings; no fake email addresses or auto-confirm changes.