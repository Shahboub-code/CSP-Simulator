# csp-simulator Research

## Overview
The CSP Simulator is a web-based exam practice application designed to help users prepare for the Certified Safety Professional (CSP) exam. It allows users to upload a custom question bank via an Excel spreadsheet, select their desired exam length, and take a dynamic, randomized practice test with a strict 60% passing threshold.

## Problem Statement
Candidates preparing for the CSP exam often lack flexible, offline-capable tools to practice with custom question sets. Existing tools either require paid subscriptions, mandatory online accounts, or don't allow users to bring their own question banks. This app solves that by providing a completely client-side, customizable, and private exam simulation environment.

## User Stories / Use Cases
- As a candidate, I want to upload an Excel file of questions so I can practice specific domains.
- As a candidate, I want to choose between a 10, 50, or 100-question test based on my available time.
- As a candidate, I want to flag questions I'm unsure about so I can review them before submitting.
- As a candidate, I want a detailed review of my incorrect answers against the correct answers to identify knowledge gaps.

## Technical Research

### Approach Options
1. **Full-Stack (Node/Express + Postgres)**: Requires backend hosting, complex file upload logic, and user accounts.
2. **Client-Side Only (React + SheetJS)**: Entirely runs in the browser. Zero server costs, 100% privacy, immediate parsing.

### Recommended Approach
**Client-Side Only (React + SheetJS)**. This approach is highly portable, secure, and requires no ongoing hosting infrastructure other than static file delivery (e.g., Vercel, Netlify, or local execution).

### Required Technologies
- **React 18** (UI Framework)
- **Vite** (Build Tool)
- **Tailwind CSS v4** (Styling System)
- **SheetJS (`xlsx`)** (Excel Parsing)
- **Lucide React** (Iconography)

### Data Requirements
- Excel schema expectation: Columns for Question text, Option choices (e.g., A, B, C, D), and Correct Answer.
- State tracking: Current selected questions array, user answers map, flagged questions map, and current index.

## UI/UX Considerations
- **Design Language**: Academic, clean, and distraction-free. 
- **Colors**: Soft Gray backgrounds, White cards, Safety Blue primary accents, Emerald Green for success, Rose Red for errors.
- **Interactions**: Progress bars, hover states on option cards, collapsible navigation grid for jumping between questions.

## Integration Points
- Interacts with the browser's native File API for document uploads.
- No external APIs are required.

## Risks and Challenges
- **Excel Formatting Variations**: Users may upload spreadsheets that don't match the expected column names. 
  - *Mitigation*: The parser should be robust enough to scan for known headers or gracefully fail with clear instructions.
- **Randomization Bias**: Basic `Math.random()` sorts are biased.
  - *Mitigation*: Implementation must use the Fisher-Yates shuffle algorithm for true randomness.

## Open Questions
- Should we add local storage persistence so the user can resume an exam if they accidentally close the tab?
- Should we export the final results back to an Excel file or PDF?

## References
- [SheetJS Documentation](https://docs.sheetjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
