# my-spotify

## Run the app

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Run the tests

### Playwright

Run once:

```bash
npm run test:pw
```

Run repeatedly (3 times):

```bash
npm run test:pw:repeat
```

This uses the project repeat helper for a stable repeated run.

You can also pass a specific spec:

```bash
npx playwright test tests/e2e/player-flow.spec.ts --reporter=list
```

### Cypress

```bash
npm run test:cypress
```

## Repeat-run helper

A small helper script is available for repeated runs:

```bash
node scripts/repeat-e2e.mjs --framework playwright --repeat 3 --spec tests/e2e/auth-flow.spec.ts --spec tests/e2e/role-and-response.spec.ts --spec tests/e2e/player-flow.spec.ts
```

```bash
node scripts/repeat-e2e.mjs --framework cypress --repeat 3 --spec cypress/e2e/ui-scenarios.cy.ts --spec cypress/e2e/player-flow.cy.ts
```

## Progressive Web App (PWA)

To test the PWA, build and start the application using `npm run build` followed by `npm start`, then open it in a browser, then it can be installed using the browser's **Install App** option usually found near the address bar.
