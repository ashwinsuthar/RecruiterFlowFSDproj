# QA Automation

Playwright + TypeScript suite for the required SauceDemo UI flows and ReqRes API calls. The login helper keeps common UI steps readable; API tests use Playwright's request fixture and never launch a browser.

## Run

```sh
npm install
npx playwright install chromium
```

Set `REQRES_API_KEY` to a free key from ReqRes, then run `npm test`. UI-only and API-only commands are `npm run test:ui` and `npm run test:api`. The API tests are skipped with an explicit reason if the key is not set.

Completed all five required scenarios. The bonus logout, remove-from-cart, and 404 scenarios are not included. Tests target live public services, so availability and the ReqRes account/key requirement can affect a run.

## Email reflection draft

I completed the three requested SauceDemo UI scenarios and the ReqRes user lookup and create scenarios. ReqRes requires an API key, so I wired `REQRES_API_KEY` into the required `x-api-key` header and documented how to configure it locally. I used accessible Playwright locators and a small login page helper to keep the UI tests readable. With more time, I would add the optional logout, cart removal and 404 scenarios, then run the suite in CI.
