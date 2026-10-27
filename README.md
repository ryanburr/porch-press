# The Porch Press

Your town's daily paper, delivered to your porch. Pick your town and get a front page of today's local news, curated by Perplexity, with full articles and follow-up questions.

## Run it

```bash
pnpm install
cp .env.example .env.local   # add your PERPLEXITY_API_KEY
pnpm dev
```

Without a key, every route serves a sample edition, so the UI can be built offline.

## Data layer

Types live in `src/lib/types.ts`. `stories[0]` of an `Edition` is the lead story.

| Route | Call | Returns |
| --- | --- | --- |
| `GET /api/front-page?town=Asheville, NC&date=YYYY-MM-DD` | `sonar-pro`, JSON schema, last-week recency | `Edition`. Cached per town per day; add `&fresh=1` to reprint. |
| `POST /api/article` `{ town, story }` | `sonar` | `Article`: plain-text `body` with `[n]` markers that index into `sources` |
| `POST /api/ask` `{ town, story, article, messages }` | `sonar`, streamed | Answer text, then `\u001e` and a JSON array of sources |

Client hooks for components:

- `useEdition(town)` → `{ edition, loading, error, reprint }` (cached in localStorage per day)
- `useArticle(edition, story)` → `{ article, loading, error }`, plus `paragraphsOf(article)`
- `useAsk(town, story, article)` → `{ turns, busy, ask(question) }`; each turn's `answer` streams in live
