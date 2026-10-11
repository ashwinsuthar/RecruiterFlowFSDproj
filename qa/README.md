# QA Automation

Playwright + TypeScript suite for the required SauceDemo UI flows and ReqRes API calls. The login helper keeps common UI steps readable; API tests use Playwright's request fixture and never launch a browser.

## Run

```sh
npm install
npx playwright install chromium
```

Set `REQRES_API_KEY` to a free key from ReqRes, then run `npm test`. UI-only and API-only commands are `npm run test:ui` and `npm run test:api`. The API tests are skipped with an explicit reason if the key is not set.

Completed all five required scenarios. The bonus logout, remove-from-cart, and 404 scenarios are not included. Tests target live public services, so availability and the ReqRes account/key requirement can affect a run.
