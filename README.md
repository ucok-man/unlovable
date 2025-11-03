# Unlovable

A full-stack Next.js application that generates complete web applications using AI agents. Users describe what they want to build, and the system generates functional Next.js applications with working code, components, and live previews.

**Live** : [https://unlovable.ucokman.web.id](https://unlovable.ucokman.web.id)

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL
- E2B Sandboxes
- OpenAI Api Keys
- Clerk Account

### 1. Clone & Install

```bash
git clone <repo-url>
cd unlovable
pnpm install
```

### 2. Get OpenAi Api Keys

1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Get <OPENAI_API_KEY> by creating new one.

### 3. Setup Clerk Authentication

1. **Login to Clerk**  
   Visit [https://dashboard.clerk.com/sign-in](https://dashboard.clerk.com/sign-in)

2. **Create a new application**  
   Navigate to **Application → Dashboard** and create a new application

3. **Configure sign-in options**  
   Enable **Email** and **Google** as sign-in methods

4. **Get your API keys**  
   Go to **Configure → Developers → API Keys** and copy:
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 4. Setup E2B Sanboxes

1. **Login to E2B**  
   Visit [https://e2b.dev/sign-in](https://e2b.dev/sign-in)

2. **Setup CLI**

   - Install e2b cli `pnpm install -g @e2b/cli`
   - Login your account `e2b auth login`

3. **Push Template**

   - Make sure you have **docker** running
   - Move context `cd ./sandbox-templates/nextjs`
   - Run `e2b template build --name unlovable-nextjs --cmd compile_page.sh`
   - Under **Manage** -> **Api Keys** get new <E2B_API_KEY>

### 5. Configure Environment Variables

```bash
cp .env.example .env
# fill in all the credentials you collected
```

### 6. Setup Database

```bash
pnpm prisma generate
pnpm prisma db push
```

### 7. Run Development Server

Start the application:

```bash
pnpm run dev
```

**Your app is now running!** 🎊  
Visit [http://localhost:3000](http://localhost:3000) to see it in action.
