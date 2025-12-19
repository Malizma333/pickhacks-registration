# PickHacks Registration System

Event registration platform for PickHacks hackathon built with the T3 Stack.

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework
- [Better-Auth](https://better-auth.com) - Authentication
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [PostgreSQL](https://neon.tech) - Database (Neon)
- [Tailwind CSS](https://tailwindcss.com) - Styling

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Admin Access

The admin panel is available at `/admin`. To grant admin access:

1. Go to your [Neon Console](https://console.neon.tech/)
2. Open the SQL Editor
3. Run this query (replace with your email):
```sql
UPDATE "user" SET "is_admin" = true WHERE "email" = 'your-email@example.com';
```

4. Access the admin panel at `http://localhost:3000/admin/login`

## Features

### User Registration
- Multi-step form (Profile, Education, Shipping, MLH Agreements)
- Email verification required
- Unique QR code generation per user
- Read-only view after submission

### Admin Panel (`/admin`)
- Create and manage events
- View all registrations
- Export registrations to CSV
- Search and filter registrations

## Database Commands

```bash
# Generate migration
pnpm db:generate

# Push schema changes
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```
