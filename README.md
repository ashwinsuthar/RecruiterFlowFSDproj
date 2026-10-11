# Recruiterflow Internship Assignments

Three independent implementations of Sections A, B and C from the supplied brief.

## Projects

- [Section A: QA Automation](qa/README.md) — Playwright + TypeScript UI and API tests. From `qa/`, run `npm install`, `npx playwright install chromium`, then `npm test`. ReqRes uses `REQRES_API_KEY`; set it in the environment before running API tests.
- [Section B: Build-a-Recruiter-Bot](backend/README.md) — Java 17 / Spring Boot recruiter matching API with MySQL and raw JDBC SQL. Create a `recruiter_bot` database (or set `DB_URL`), configure `DB_USERNAME` and `DB_PASSWORD`, then run `mvn spring-boot:run` from `backend/`. The API seeds its fictional candidates and jobs on startup. Run the separate SQL challenge using `backend/sql_detective.sql`.
- [Section C: Trip Splitter](frontend/README.md) — Vite, React, Redux Toolkit, React Router and strict TypeScript. From `frontend/`, run `npm install` then `npm run dev`.

## Design notes

Trip Splitter stores typed member and expense state in Redux Toolkit, initializes it from localStorage with sample data as a fallback, and persists through a store subscription. Money is stored as integer paise throughout. Equal split remainder paise go to participants in the member order supplied to the splitter. Exact and percentage splits use deterministic largest-remainder allocation so the shares always reconcile exactly.

The recruiter matching score is 70% required-skill coverage and 30% experience fit. Experience meets the fit component at the required minimum and scales linearly below it; no extra experience raises the score above the minimum. Ties use candidate/job id order. Matching explanations state skill coverage and the experience comparison. The service uses normalized candidate/job/skill join tables and explicit JDBC SQL, without an ORM or query builder.Some part of testing was done using aitools & debugging for edge cases updated.
