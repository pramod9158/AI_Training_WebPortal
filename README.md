This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Project Rules

## Architecture
- **Frontend:** React
- **Backend:** Node.js
- **Database:** PostgreSQL

## Development Guidelines

### Collaboration
- Never modify another person's feature without their permission.
- Follow existing coding conventions across the codebase.

### Version Control
- Never commit directly to `main`.
- Create a dedicated feature branch for every task.
- Run all tests locally before committing.

### Database
- Do not change the database schema without documenting the change (e.g., migration notes, schema diagram update, or PR description).

## Git Workflow

### Branch Naming


feature/<name>

Example: `feature/user-authentication`

### Commit Message Format
| Type | Use for |
|------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `docs:` | Documentation-only changes |

Example: `feat: add password reset flow`

