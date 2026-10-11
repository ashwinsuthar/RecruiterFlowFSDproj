# Trip Splitter (Section C)

Responsive two-page React app built with Vite, React Router, Redux Toolkit and strict TypeScript. Data starts with the supplied five members and six Goa expenses. The expense page shows live balances, category filtering, visible total, newest-first rows and confirmed deletion; the form supports equal, exact and percentage splits. Unknown routes have a return link.

## Run

```sh
npm install
npm run dev
```

Quality commands: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.

## Decisions

1. Members and expenses live together in a small Redux Toolkit slice because every page needs the same data and any create/delete action should immediately recalculate balances. Form draft values remain local to the form.
2. Integer paise is used from parsing through allocation and balance calculation. Equal splits assign leftover paise in the selected member order. Exact and percent splits use largest remainder, with member ID as a stable tie-breaker, so all shares always equal the expense amount.
3. Storage is loaded once as the slice's initial state and persisted through a store subscription. This keeps browser persistence outside rendering components; missing, malformed or inaccessible storage falls back to the assignment's sample data.

The logic is in plain TypeScript functions; the form has field-level validation, no form/validation libraries are used, and tests cover split/balance reconciliation plus invalid and valid form submissions. Given another day, I would add editing, settlement suggestions and broader accessibility/browser checks.