# csp-simulator Implementation Plan

## Overview
Building a highly polished, responsive web-based quiz application for CSP exams. The app reads a master Excel file containing questions and dynamically generates a randomized exam of 10, 50, or 100 questions. It features advanced navigation (Flagging, Skipping, Question Grid) and enforces a strict 60% passing threshold with a comprehensive post-exam review.

## Prerequisites
- Node.js and npm installed
- Initial Vite/React scaffold setup

## Phase Summary
- Phase 1: Foundation & Dependencies
- Phase 2: Data Parsing & Setup Interface
- Phase 3: Core State Management
- Phase 4: Quiz Interface & Base Interactions
- Phase 5: Advanced Quiz Navigation
- Phase 6: Scoring & Review System

---

## Phase 1: Foundation & Dependencies

### Objective
Initialize the React application and configure the design system.

### Rationale
Provides the base environment and styling tokens required for all subsequent UI work.

### Tasks
- [ ] Scaffold React app using Vite
- [ ] Install Tailwind CSS v4 and configure custom colors (Soft Gray, Safety Blue, Emerald Green, Rose Red)
- [ ] Install required dependencies (`xlsx`, `lucide-react`)
- [ ] Clean up default boilerplate

### Success Criteria
App runs on localhost and custom Tailwind colors apply successfully.

### Files Likely Affected
- `package.json`
- `vite.config.js`
- `src/index.css`
- `src/main.jsx`

---

## Phase 2: Data Parsing & Setup Interface

### Objective
Process the Excel question bank and allow users to select exam levels.

### Rationale
Data must be loaded and randomized before any quiz logic can be built.

### Tasks
- [ ] Create `excelParser.js` using SheetJS
- [ ] Build `SetupView.jsx` with file upload dropzone
- [ ] Implement Fisher-Yates shuffle algorithm
- [ ] Add 10/50/100 question selection buttons

### Success Criteria
Users can upload an Excel file, the app parses it, and clicking a level button successfully slices a randomized subset of questions.

### Files Likely Affected
- `src/utils/excelParser.js`
- `src/components/SetupView.jsx`

---

## Phase 3: Core State Management

### Objective
Implement the global application state and view routing.

### Rationale
Connects the Setup phase to the Quiz phase.

### Tasks
- [ ] Setup `questions`, `answers`, and `currentView` state in `App.jsx`
- [ ] Create `Header.jsx` with a dynamic progress bar
- [ ] Implement transition logic between Setup, Quiz, and Results

### Success Criteria
The app successfully routes from Setup to Quiz, passing the correct array of questions into state.

### Files Likely Affected
- `src/App.jsx`
- `src/components/Header.jsx`

---

## Phase 4: Quiz Interface & Base Interactions

### Objective
Build the main quiz answering experience.

### Rationale
The core value of the application; users must be able to read questions and select answers.

### Tasks
- [x] Create `OptionCard.jsx` with hover and selected states
- [x] Build `QuizView.jsx` to render the active question
- [x] Implement Next and Previous question handlers in `App.jsx`
- [x] Record selected answers in state

### UI Enhancements & Polish (Completed)
- Applied Tailwind transitions (`transition-all duration-300`).
- Implemented premium responsive design (gradients, shadows, lucide-react icons).
- Added `A.Shahboub` developer credit in `App.jsx` footer with creative hover animations.
- Implemented **Dark Mode** via standard Tailwind `dark:` prefix mapping and an `isDarkMode` state toggle in `App.jsx` applied directly to `document.documentElement`. Support flows down through all views (`SetupView`, `QuizView`, `ResultsView`).

### Success Criteria
Users can navigate linearly through the questions and select one answer per question.

### Files Likely Affected
- `src/components/QuizView.jsx`
- `src/components/OptionCard.jsx`
- `src/App.jsx`

---

## Phase 5: Advanced Quiz Navigation

### Objective
Add features for skipping, flagging, and grid-based jumping.

### Rationale
Enhances the exam simulation to match real-world testing environments.

### Tasks
- [ ] Add "Flag for Review" state and toggle button
- [ ] Implement "Show Grid" UI with color-coded dots (Answered, Unanswered, Flagged)
- [ ] Add "Skip for Now" dynamic text to the Next button
- [ ] Implement `jumpToQuestion` logic

### Success Criteria
Users can flag questions, skip questions without answering, and jump to any question using the visual grid.

### Files Likely Affected
- `src/components/QuizView.jsx`
- `src/App.jsx`

---

## Phase 6: Scoring & Review System

### Objective
Calculate the final grade and display the post-exam review.

### Rationale
Users need to know if they passed the 60% threshold and exactly what they got wrong.

### Tasks
- [ ] Build `ResultsView.jsx`
- [ ] Implement scoring calculation enforcing the 60% threshold
- [ ] Render large circular percentage chart
- [ ] Render the full review list marking correct/incorrect/skipped choices
- [ ] Add "Take Another Exam" restart button

### Success Criteria
The final score is mathematically accurate, accurately handles skipped questions as incorrect, and visually highlights mistakes.

### Files Likely Affected
- `src/components/ResultsView.jsx`
- `src/App.jsx`

---

## Post-Implementation
- [ ] Testing strategy across desktop and mobile viewports
- [ ] Verify handling of malformed Excel sheets

## Notes
- Ensure all states reset completely when the user clicks "Take Another Exam".
