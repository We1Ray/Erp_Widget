# ds-widget — ERP UI Component Library

React + TypeScript reusable component library for enterprise ERP systems.

## Architecture
- **3-tier Context + XState**: System (auth/i18n) → Program (CRUD state machine) → Component (multi-program coordination)
- **25 components**: DataTable, TextBox, CheckBox, SelectionBox, DatetimeBox, TreeView, CRUD Buttons, etc.
- **3 modes per component**: Query / Bind / Common — auto-switch behavior based on context

## Tech Stack
React 17, TypeScript, Material-UI 4, XState 4, Webpack 5, Storybook 6

## Usage
```bash
npm install
npm run storybook  # Component preview
npm run build      # Build library
```
