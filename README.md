# Atelier

A private women’s digital wardrobe. Photos are turned into garment stickers with OpenAI, then stored in Postgres and Vercel Blob when the app is published.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without cloud env vars, the closet stays in this browser.

Copy `env.example` to `.env.local` and add `OPENAI_API_KEY` so new photos become stickers.

## Publish on Vercel (GitHub)

1. Create a GitHub repository and push this project.
2. In [Vercel](https://vercel.com), import that GitHub repo.
3. Add a **Neon / Postgres** store to the project (Storage → Create Database). This sets `DATABASE_URL`.
4. Add a **Blob** store (Storage → Create Blob Store). This sets `BLOB_READ_WRITE_TOKEN`.
5. Add `OPENAI_API_KEY` in Settings → Environment Variables.
6. Redeploy.

After that, clothes and outfits are shared across phone and computer. Stickers are files in Blob, not giant browser storage.
