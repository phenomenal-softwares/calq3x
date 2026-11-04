# CALQ3x

CALQ3x is a responsive, browser-based calculator with standard, scientific, and percentage calculation modes. Expressions are evaluated in the browser; the app does not require an API or server-side calculation service.

## Features

- Standard arithmetic, parentheses, sign toggle, percentage, reciprocal, and keyboard input.
- Scientific functions for trigonometry and inverse trigonometry, hyperbolic functions, logarithms, roots, powers, factorials, absolute value, exponential, floor, and ceiling.
- Degree and radian angle modes.
- Seven percentage workflows: percent of a value, increase/decrease, percentage change, finding a percentage, and reversing percentage increases or decreases.
- Human-readable expression display, including square-root, inverse-trigonometric, and power notation, while retaining calculator syntax for evaluation.
- Calculation history for the current page session, with expression/result reuse, copy, and delete controls.
- Responsive layout, keyboard shortcuts, focus-visible styling, and reduced-motion support.
- Expression validation and bounded real-number calculations.

## Technology

- React 19 for the interface.
- Vite 7 for development and production builds.
- mathjs for parsing expressions; CALQ3x validates supported syntax and evaluates against a restricted function scope.
- Motion for interface transitions and React Icons for controls.
- Vitest for utility-level tests.
- DM Sans and DM Mono are loaded from Google Fonts, with local generic font fallbacks.

## Requirements

- Node.js 20.19+ or 22.12+.
- npm (the version bundled with the selected Node.js installation is suitable).

## Run Locally

```bash
npm ci
npm run dev
```

Vite prints the local development URL after startup.

## Verify and Build

```bash
npm run check
```

This runs the automated test suite and then creates a production build. They can also be run separately:

```bash
npm test
npm run build
npm run preview
```

The production-ready static site is written to `dist/`. `npm run preview` serves that build locally for a final smoke test. For deployment, configure your static hosting provider to run `npm ci` and `npm run build`, then publish `dist/`. No server-side routes or environment variables are required. Serve the site over HTTPS to enable browser clipboard access where supported.

## Privacy and Calculation Notes

Calculations run locally in the browser. History is held in page memory and is cleared when the page is refreshed or closed. CALQ3x does not send expressions to a CALQ3x backend. The interface loads its optional fonts from Google Fonts, so the browser makes requests to that service when those fonts are available.

The evaluator supports a defined set of real-valued operations and symbols, rather than all mathjs syntax. Expressions are limited to 512 characters, and factorials are limited to integers from 0 through 170. Results should be independently checked when used in safety-critical, financial, or other high-consequence work.

## Prospective Features

Potential future enhancements, not currently included, are:

- Installable offline support with a progressive web app service worker.
- Export and import for calculation history.
- Memory keys and reusable named variables.
- Graphing and table-of-values tools.
- Unit conversion and additional number formats/locales.
- Browser-based end-to-end testing across desktop and mobile layouts.

## Authorship

**Author:** Abiodun Ojo  
**Company:** PHENOMENAL SOFTWARES NIG. LTD  
**Date:** November 4, 2026
