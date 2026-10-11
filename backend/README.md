# Build-a-Recruiter-Bot (Section B)

Java 17, Spring Boot and MySQL. The schema is normalized across candidates, jobs and skill join tables. Every database operation uses explicit SQL through Spring `JdbcTemplate`; there is no ORM or query builder. Seed data is inserted at startup only when the candidate table is empty.

## Start with local MySQL

The configured connection matches the supplied MySQL Workbench screenshot: `localhost:3306`, user `root`, empty password. If your root account has a password, set `DB_PASSWORD`; `DB_USERNAME` and `DB_URL` can also override defaults. The URL creates the `recruiter_bot` database if the account has permission.

```sh
mvn spring-boot:run
```

Endpoints: `GET /candidates`, `GET /jobs`, `POST /candidates`, `POST /jobs`, `GET /jobs/{id}/matches`, `GET /candidates/{id}/matches`. Create endpoints accept JSON matching the returned fields, including a `skills` or `requiredSkills` string array. The response from each match endpoint is ranked by descending score, then ascending ID, with an explanation. Example: `curl http://localhost:8080/jobs/1/matches`.

## Matching choice

Score = 70% required-skill coverage + 30% experience fit. Experience fit is 100% at or above the minimum and otherwise scales linearly with years/minimum. This rewards required skills most while avoiding extra credit for unrelated seniority. Ties are stable by ID. Trait, availability and culture fields are preserved for future ranking iterations but do not affect this explainable baseline score.

## SQL detective challenge

`sql_detective.sql` recreates the supplied hiring-ops schema and seed rows, then answers all five questions in order. Duplicate people are grouped by case-insensitive, whitespace-trimmed email; Q4 counts every Final interview in the denominator, including a pending outcome.

AI assistance was used during implementation; all choices and source should be reviewed and understood before submission. The assignment calls for a discussion of trade-offs, not just a successful launch.
