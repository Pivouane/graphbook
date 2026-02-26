# Graphbook

> Your yearbook on a graph, an open-source social network for big nerds that once were students.

Graphbook is a collaborative platform where students can connect, explore relationships through an interactive graph, and post on each other's profiles. The interface and modules are community-driven: anyone can open a PR to contribute a new theme or feature module. (Work in progress...)

## Features

- **Interactive graph**: visualize connections between students with proximity based on mutual favorites and post interactions.
- **Magic link auth**: sign in with your university email address, no password required
- **User profiles**: cute profile pictures, custom promo groups, quotes, and a wall (just like skyblogs)
- **Modules** — activate community-contributed modules on your profile (music player, custom sections, open pull requests if you have ideas!)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | better-auth (magic link) |
| Database | MongoDB Atlas + Prisma 6 |
| Graph | D3.js |
| i18n | next-intl |
| Styling | Tailwind CSS |
| Language | TypeScript (strict) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A MongoDB Atlas cluster

### Installation

```bash
git clone https://github.com/your-username/graphbook.git
cd graphbook
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/graphbook"

BETTER_AUTH_SECRET="generate with: openssl rand -base64 32"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_FEDERATED_EMAIL_DOMAINS="univ.fr,univ2.fr" # comma-separated list of allowed email domains for magic link sign-in

NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

### Database setup

```bash
npx prisma db push
npx prisma generate
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # Localized routes (fr, en, eo)
│   │   |── layout.tsx      # Main layout
│   │   ├── page.tsx        # Graph homepage
│   │   |── actions/
│   │   |   └── graph.ts    # Fetch graph data action
│   │   ├── sign-in/        # Auth page
│   │   └── users/          # Profile pages + settings
│   └── api/auth/           # better-auth API route
├── components/
│   ├── auth/               # Magic link form
│   ├── d3/                 # Graph component
├── hooks/
├── i18n/                   # next-intl routing + config
├── lib/
│   ├── auth/               # better-auth server + client config
│   ├── prisma/             # Prisma client
│   └── utils.ts            # Utility functions
├── styles/
│   └── globals.css         # Global styles
messages/                   # Translation files (feel free to contribute new locales and fix existing ones!)
├── en.json
├── fr.json
└── eo.json
prisma/
└── schema.prisma
scripts/
└── check-intl.ts           # i18n key sync validator
```


## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run check-intl   # Validate i18n keys are in sync across all locales
npm run check        # Run all checks (typecheck + lint + check-intl)
```

## Contributing

Contributions are welcome! Read the [contributing guide](CONTRIBUTING.md) to learn how to write a module.
Either way, feel free to open issues for bugs or feature requests, or just to say hi. I built this for fun and to learn, so any feedback is appreciated. :)
