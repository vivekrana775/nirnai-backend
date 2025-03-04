# CRUD app

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL database
- Prisma CLI (`npm install -g prisma`)

## Setup Instructions

1. **Clone the repository:**

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:

```
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>?schema=public
PORT=3000
```

4. **Generate Prisma client:**

```bash
npx prisma generate
```

5. **Run database migrations:**

```bash
npx prisma migrate dev
```

6. **Start the application:**

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

## Additional Commands

- **Build the app:**

```bash
npm run build
```

- **Start the production server:**

```bash
npm run start
```

- **Prisma Studio (for database management):**

```bash
npx prisma studio
```
