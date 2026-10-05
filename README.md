# The EFT Guild Member Hub (Demo MVP)

A client demonstration prototype of a private association information-sharing platform.

This is **not** a production system. There is no real authentication, database, email, or push notifications. All data is mock data persisted in `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose a demo user.

## Demo users

| Name | Role |
|------|------|
| Sarah Mitchell | Member |
| David Williams | Author |
| Helen Carter | Moderator |
| Michael Thompson | Admin |

## What to demonstrate

1. Login as a demo user
2. Home dashboard
3. News, discussions, events, members
4. Create a discussion, comment, and follow
5. Submit content for moderation
6. Approve as Moderator/Admin
7. Notifications for followed discussions only
8. Search, profile, notification preferences
9. Admin dashboard and **Reset Demo**

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Client-side mock data + localStorage
