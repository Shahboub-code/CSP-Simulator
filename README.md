# CSP Simulator

A private, browser-based practice exam simulator for Certified Safety Professional (CSP) and Associate Safety Professional (ASP) candidates.

[Live application](https://shahboub-code.github.io/CSP-Simulator/) · [Code review graph](docs/CODE_REVIEW_GRAPH.md) · [Implementation notes](docs/csp-simulator/IMPLEMENTATION.md)

## About the project

CSP Simulator turns an Excel question bank into a focused exam experience without accounts, subscriptions, or a backend. Question files are parsed in the browser, so uploaded study material is not sent to a server.

Users load their own workbook locally, then practice a selected topic, simulate ASP or CSP exam scoring, navigate between questions, flag items for review, and inspect detailed results after submission.

> This is an independent study tool. It is not affiliated with or endorsed by the Board of Certified Safety Professionals (BCSP).

## Features

- Local `.xlsx`, `.xls`, and `.csv` question-bank uploads
- Multiple-file upload and question deduplication
- Practice, 200-question ASP, and 200-question CSP exam modes
- Topic filtering and randomized question selection
- Answer tracking, question flagging, and grid navigation
- Early-finish and final-submission confirmation
- Score summary with correct, incorrect, and skipped totals
- Full answer review with explanations when available
- Responsive light and dark themes
- Fully client-side operation and static GitHub Pages deployment

## Tech stack

- React 19
- Vite 8
- Tailwind CSS 4
- SheetJS (`xlsx`)
- Framer Motion
- Lucide React
- GitHub Actions and GitHub Pages

## Getting started

### Requirements

- Node.js 20 or newer
- npm

### Run locally

```bash
git clone https://github.com/Shahboub-code/CSP-Simulator.git
cd CSP-Simulator
npm install
npm run dev
```

Open the local URL printed by Vite. The development command first runs the question-bank maintenance scripts and then starts the Vite server.

To start Vite without running those scripts:

```bash
npx vite --host
```

### Quality checks

```bash
npm run lint
npm run build
```

The production build is written to `dist/`.

## Question-bank format

The parser reads the first worksheet and recognizes header names case-insensitively. A typical workbook looks like this:

| Question | Option A | Option B | Option C | Option D | Correct Answer | Explanation | Domain |
| --- | --- | --- | --- | --- | --- | --- | --- |
| What does PPE stand for? | Personal Protective Equipment | Process Protection Evaluation | Public Prevention Equipment | Personal Practice Exam | A | Equipment worn to reduce exposure to hazards. | Industrial Hygiene |

Required data:

- A question column containing `QUESTION`
- At least two populated option columns, or options embedded in the question text
- A correct-answer column such as `CORRECT ANSWER` or `ANSWER`
- A correct value beginning with `A`–`E` or `1`–`5` that matches an option

Optional `TOPIC`, `DOMAIN`, `CATEGORY`, `EXPLANATION`, `RATIONALE`, or `REASON` columns enrich filtering and answer review. Invalid rows and answers that cannot be matched to an option are skipped.

## Architecture

```text
main.jsx
└── ErrorBoundary
    └── App.jsx (session state and view transitions)
        ├── Header
        ├── SetupView ── excelParser ── SheetJS / workbook
        ├── QuizView ── OptionCard
        ├── ResultsView
        └── ConfirmationModal
```

`App.jsx` owns the exam session state. The setup, quiz, and results screens receive state and callbacks as props and are lazy-loaded. See the [code review graph](docs/CODE_REVIEW_GRAPH.md) for runtime, data-flow, build, and review-impact diagrams.

## Question-bank maintenance

```bash
npm run merge
```

This runs `auto_merge_banks.py` followed by `dedup_bank.py` and requires Python plus `pandas` and an Excel engine such as `openpyxl`.

Important: these scripts create a local workbook under `public/`, but question-bank files are ignored by Git and are not deployed. The merge script also renames processed text and CSV inputs with a `.processed` suffix, so commit or back up source data first.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow in `.github/workflows/deploy.yml`. It installs dependencies, builds the application, uploads `dist/`, and deploys it to GitHub Pages. Vite uses `/CSP-Simulator/` as its production base path.

## Project documentation

- [Code review graph](docs/CODE_REVIEW_GRAPH.md)
- [Research and technical decisions](docs/csp-simulator/RESEARCH.md)
- [Implementation plan](docs/csp-simulator/IMPLEMENTATION.md)
- [Development progress](docs/csp-simulator/PROGRESS.md)

## Contributing

Issues and pull requests are welcome. Before opening a pull request, run the lint and production build commands and review downstream impact using the code review graph.

## License

No license file is currently included. Unless a license is added, the repository's contents remain under the copyright holder's default rights.
