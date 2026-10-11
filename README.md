# Recruiterflow Internship Assignments

Three independent implementations of Sections A, B and C from the supplied brief.

## Projects

- `qa/` — Playwright + TypeScript UI and API tests. `cd qa && npm install && npx playwright install chromium && npm test`. ReqRes uses `REQRES_API_KEY` from the free account described at reqres.in; set it in the environment before running API tests.
- `backend/` — Java 17 / Spring Boot recruiter matching API with MySQL and raw JDBC SQL. Create a `recruiter_bot` database (or set `DB_URL`), configure `DB_USERNAME` and `DB_PASSWORD`, then `cd backend && mvn spring-boot:run`. The API seeds its fictional candidates and jobs on startup. Run the separate SQL challenge using `backend/sql_detective.sql`.
- `frontend/` — Vite, React, Redux Toolkit, React Router and strict TypeScript. `cd frontend && npm install && npm run dev`.

## Design notes

Trip Splitter stores typed member and expense state in Redux Toolkit, initializes it from localStorage with sample data as a fallback, and persists through a store subscription. Money is stored as integer paise throughout. Equal split remainder paise go to participants in the member order supplied to the splitter. Exact and percentage splits use deterministic largest-remainder allocation so the shares always reconcile exactly.

The recruiter matching score is 70% required-skill coverage and 30% experience fit. Experience meets the fit component at the required minimum and scales linearly below it; no extra experience raises the score above the minimum. Ties use candidate/job id order. Matching explanations state skill coverage and the experience comparison. The service uses normalized candidate/job/skill join tables and explicit JDBC SQL, without an ORM or query builder.

AI tools were used to help implement these assignment projects. Review the code and run the typecheck, lint and tests in each project before submission; you should understand the implementation and be ready to explain its trade-offs.
