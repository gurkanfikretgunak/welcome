# MasterFabric Welcome

Developer onboarding system for MasterFabric team.

## What it does

Guides new developers through the complete onboarding process:

1. **Login** - GitHub authentication
2. **Profile** - Personal information setup
3. **Email** - Company email verification
4. **Tasks** - Complete onboarding checklist
5. **Dashboard** - Admin monitoring for team leads

## Tech

- Next.js 15 + TypeScript
- Supabase (database + auth)
- Tailwind CSS

## Setup

```bash
pnpm install
cp env.example .env.local
# Add your Supabase and GitHub OAuth credentials
pnpm dev
```

## Database

Run `database/schema/supabase-schema.sql` in your Supabase project.

## Owner Access

```sql
UPDATE users SET is_owner = true WHERE id = 'your-user-id';
```

---

Built for MasterFabric development team.