# princely sir website

Frontend website project. Build rules live in [CLAUDE.md](CLAUDE.md) — the
`frontend-design` skill is invoked before any frontend code is written.

## Setup

```bash
npm install          # installs Puppeteer (Chrome is already cached locally)
cp .env.example .env # then fill in your API keys (Firecrawl, etc.)
```

## Workflow

```bash
node serve.mjs                              # serve ./ at http://localhost:3000
node screenshot.mjs http://localhost:3000        # full-page screenshot
node screenshot.mjs http://localhost:3000 hero   # with a label suffix
```

Screenshots land in `temporary screenshots/` (auto-incremented, gitignored).
Compare each against the reference and iterate — at least 2 rounds.

## Layout

| Path                    | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `index.html`            | The site (placeholder until the real build).       |
| `brand_assets/`         | Real logos, palette, fonts — used over placeholders.|
| `serve.mjs`             | Zero-dependency static server (port 3000).         |
| `screenshot.mjs`        | Puppeteer full-page screenshot tool.               |
| `temporary screenshots/`| Disposable screenshot output.                      |
| `.env`                  | API keys (gitignored). Template: `.env.example`.   |
