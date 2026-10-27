# Penny

A personal expense tracker built with MongoDB, Express, React and Node.js. Add everyday expenses, update them, and see spending totals in a responsive dashboard.

## Live demo and first visit

| Part | Hosting | Link |
| --- | --- | --- |
| Frontend | Vercel | [Open Penny](https://pennymernstack.vercel.app) |
| Backend API | Render | [Check backend health](https://penny-api-2lpj.onrender.com/api/health) |
| Database | MongoDB Atlas | Accessed through the backend API |
| Source code | GitHub | [anugrahks19/Penny](https://github.com/anugrahks19/Penny) |

> **First visit:** The backend uses Render's free service, which sleeps after 15 minutes without incoming traffic. Its next request wakes it, which can take about a minute. Open the [backend health check](https://penny-api-2lpj.onrender.com/api/health) first and wait for the response below, then [open Penny](https://pennymernstack.vercel.app). See [Render's free-service documentation](https://render.com/docs/free).

Expected health response:

```json
{"status":"ok","app":"Penny"}
```

For evaluation:

1. Open the health-check link and wait for the JSON response. This checks API availability; it does not independently test database access.
2. Open the Vercel frontend. If it was already open while the backend was waking, click **Try again** after the health check responds. The frontend request can time out before a sleeping backend finishes starting.
3. Add an expense with a title, positive amount, category and date. Confirm the new row and total appear immediately.
4. Refresh the page to verify the expense was stored in Atlas.
5. Edit the expense and confirm its row and total update.
6. Try cancelling a deletion, then confirm deletion and check the total again.

The Render root URL returns `{"message":"Route not found."}` because no page is registered at `/`. Use `/api/health` for the health check and the Vercel link for the application. Expenses are stored in Atlas rather than Render's local filesystem.


## What works

- Create, read, edit and delete expenses through the Express API and MongoDB.
- Positive amounts with at most two decimal places, required titles, fixed categories and real calendar dates.
- Automatically updated totals, current-month spending and category breakdown.
- Search by title and filter by category; totals always cover all expenses.
- Confirmation before deletion, loading and empty states, error messages and save feedback.
- INR currency formatting and date-only values that keep their selected calendar day across time zones.
- Responsive layout, keyboard-accessible controls and native browser confirmation before deletion.

This is a single-user exam project. Everyone using the same database sees the same expenses; no login is included.

## Requirements

Node.js 20.19+ or 22.12+ (Node 24 also works), npm, internet access and a MongoDB Atlas database.

## Set up MongoDB Atlas

1. Sign in at https://www.mongodb.com/cloud/atlas/register and create a project named Penny.
2. Create a Free cluster. Choose an available nearby region and wait for provisioning.
3. Under Security / Database Access, add a database user such as `penny_exam`. Use a new disposable password and grant read/write access to the `penny` database. This database user is separate from your Atlas account login.
4. Under Security / Network Access, add your current public IP address. The machine running the backend must be allowed here. Evaluators running the backend on another network will need their IP allowed too. A temporary allow-from-anywhere rule (`0.0.0.0/0`) works for exam access but exposes the database to connection attempts from any address; use it only with disposable exam data and remove it after evaluation.
5. On the cluster, choose Connect, then Drivers, then Node.js. Copy the `mongodb+srv://` connection string.
6. In `backend/.env`, replace `MONGODB_URI` with your string. Replace the username and password placeholders and put `/penny` before the question mark:

   ```env
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb+srv://penny_exam:YOUR_ENCODED_PASSWORD@YOUR_REAL_CLUSTER.mongodb.net/penny?retryWrites=true&w=majority
   ```

   URL-encode special characters in the username/password (for example `@` becomes `%40`). Do not leave angle-bracket placeholders in the string. Keep Atlas credentials in the backend; never add them to a `VITE_` variable.
7. Save the file. The database and expenses collection are created when the first expense is saved; no manual collection setup is needed.

Official connection guide: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
Troubleshooting: https://www.mongodb.com/docs/atlas/troubleshoot-connection/

The backend needs a valid `MONGODB_URI` before it starts. Use the Atlas setup above when configuring a fresh clone. The exam requests a committed `.env`: use only a disposable exam database if you replace and commit this file. For private development, `backend/.env.local` can override it and is ignored by Git. Remove or rotate exam credentials once evaluation ends.

## Install and run

Keep the complete project together, including the shared/ folder used by both apps. Open a terminal in the project root:

```sh
npm install
npm run setup
npm run dev
```

Open http://localhost:5173. The API listens on http://localhost:5000. Successful startup prints `Penny connected to MongoDB.` followed by the API port. The frontend forwards `/api` to port 5000, keeping database access on the server.

Alternatively, use two terminals:

```sh
cd backend
npm install
npm run dev
```

```sh
cd frontend
npm install
npm run dev
```

If you change the API port, update the proxy target in `frontend/vite.config.js`. If you change the frontend origin, update `CLIENT_ORIGIN` in the backend. For a separately hosted frontend, set `VITE_API_URL` to the full backend API URL and rebuild.

## Hosted deployment setup

Penny's React frontend is hosted on Vercel. Browser requests go to the Express API on Render, which reads and writes expenses in MongoDB Atlas.

### Backend on Render

Create a Node Web Service connected to this repository's `main` branch:

| Setting | Value |
| --- | --- |
| Root Directory | Leave blank so the backend can import `shared/` |
| Build Command | `npm ci --prefix backend --omit=dev` |
| Start Command | `npm start --prefix backend` |
| Health Check Path | `/api/health` |
| Node version | `24.12.0` |

Set `MONGODB_URI` to the exam-only Atlas connection string, `NODE_VERSION` to `24.12.0`, and `CLIENT_ORIGIN` to `https://pennymernstack.vercel.app`. Let Render supply `PORT`. Allow the backend service's outbound IP ranges in Atlas Network Access. These ranges are shown under **Connect → Outbound** on the Render service page. Save the settings, deploy, and check the health endpoint before opening the frontend.

### Frontend on Vercel

Import the same GitHub repository with these settings:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Root Directory | `frontend` |
| Install Command | `npm ci --include=dev` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| `VITE_API_URL` | `https://penny-api-2lpj.onrender.com/api` |

Enable inclusion of source files outside the root directory for the build so Vite can import `shared/expenseRules.mjs`. Keep the MongoDB connection string on the backend; Vercel needs only the public API URL. Redeploy the frontend after changing `VITE_API_URL` because Vite embeds it during the build.

If the frontend domain changes, update Render's `CLIENT_ORIGIN` to the new origin without a trailing slash and redeploy the backend. Check add, refresh, edit and delete through the deployed frontend after configuration changes.

## Verification

```sh
npm test
npm run build
```

Backend tests start an isolated, temporary MongoDB process and exercise real Mongoose persistence, the entire CRUD cycle, invalid input, ordering, missing records and malformed requests. The first test run downloads a MongoDB binary and needs internet access. Tests do not use or alter Atlas data. The frontend tests also check exact decimal totals, month boundaries, empty data and combined search/category filters.

To preview the production frontend locally, keep the backend running and run:

```sh
npm run preview --prefix frontend
```

The Vite preview server forwards API calls to port 5000. For deployment, host `frontend/dist` and configure API routing/origins for your host.

Manual check after connecting Atlas:

1. Add Lunch for 180.50 under Food. The list and total should update immediately.
2. Refresh the page; the saved expense should remain.
3. Edit it to 205.00; both the row and totals should change.
4. Try a negative amount, blank title and empty date; saving should be blocked.
5. Cancel a deletion, then confirm it; the expense should disappear only after confirmation succeeds.
6. Add another category, search/filter, and check the category breakdown.
7. Try a mobile viewport and keyboard navigation.

## API

| Method | Route | Result |
| --- | --- | --- |
| GET | `/api/health` | API availability |
| GET | `/api/expenses` | Expenses ordered newest date first |
| POST | `/api/expenses` | Create an expense, returns 201 |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

POST and PUT accept a JSON object:

```json
{ "title": "Lunch", "amount": 180.50, "category": "Food", "date": "2026-10-27" }
```

Categories: Food, Travel, Bills, Shopping, Other. Amount must be between 0.01 and 999999999.99 with up to two decimal places. Title is trimmed and limited to 100 characters. Unknown input properties are discarded. Invalid requests return 400, missing expenses return 404, and unexpected errors return 500 with a safe message.

## Project layout

```text
backend/
  app.js                 Express routes and error handling
  server.js              Database connection and startup
  settings.js            Shared environment loading and connection settings
  validation.js          Request validation
  models/Expense.js      Mongoose schema
  test/expenses.test.js  API and persistence tests
frontend/
  src/App.jsx            Page state, API actions and component wiring
  src/api.js             Shared API request handling
  src/spending.js        Money, dates, totals and filtering
  src/components/        Form, history, summary and page layout
  test/spending.test.js  Decimal totals, month totals and filtering checks
  src/main.css           Responsive styling
  src/main.jsx           React entry point
  vite.config.js         Development and preview API proxy
shared/
  expenseRules.mjs       Shared categories, amount rules and field limits
```

## Troubleshooting

- Connection failure: verify the cluster is available, the database user/password is correct, your IP is allowed and the URI has no placeholders. Check special-character encoding and internet access.
- Hosted first visit or Cannot reach Penny: open the Render health check, wait for it to respond, then click Try again in the frontend. For local development, run the backend and confirm the API port matches the Vite proxy.
- Port 5173 in use: stop the other app using it before starting Penny.
- Changes to environment files: restart the backend; restart Vite after changing frontend environment values.
- Fonts unavailable: the interface uses system sans-serif fallbacks and remains usable.

## Submission

Repository: [https://github.com/anugrahks19/Penny](https://github.com/anugrahks19/Penny)

Live frontend: [https://pennymernstack.vercel.app](https://pennymernstack.vercel.app)

Submit the repository URL as requested by the assessment. The complete project includes `frontend/`, `backend/`, `shared/`, the package manifests and lockfiles, and both required `.env` files. Only disposable exam credentials should be published. Dependencies, build output, local skills and verification artifacts are excluded by `.gitignore`.

## Browser checks

The optional browser tests use their own temporary MongoDB database and start both servers automatically. The isolated browser checks use ports 5051 and 5174 so your app can keep running on 5000 and 5173:

```sh
npx playwright install chromium
npm run test:ui
```

These cover desktop CRUD, persistence after reload, search, category filters, validation, mobile layout, failed saves and connection retries. Screenshots are saved under `artifacts/` with isolated test data.

## Check your configured Atlas connection

Run `npm run check:atlas` from the project root. This uses the URI in your backend environment files. It creates one uniquely named temporary expense, reconnects to verify persistence, checks reading and updating it, and removes it afterward. A report without credentials is saved in `artifacts/atlas-check.json`. Existing expenses are left alone.
