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
PORT=8000
SESSION_SECRET = any_secrect_key
GOOGLE_API_KEY = your_key
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

- **Working:**

So Basically what I am doing is taking a pdf from api and giving it to pdf-parse to extract text from the pdf.
Then, for larger pdf's or large amount of text, I'm creating chunks of text and giving it to ai.

Giving data to AI in chunks is very helpful in this process. This way we do not need to use a pro version of AI, We can simply use any free AI.

In this we are using gemini-1.5-flash.
