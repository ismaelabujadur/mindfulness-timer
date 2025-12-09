# Mindfulness Timer

A lightweight mindfulness bell built with React, TypeScript, Tailwind, and Vite. Set an interval, press start, and let gentle chimes remind you to pause.

## Features
- Live clock with animated progress for the current cycle
- Custom interval input plus quick presets (5–120 minutes)
- Start, pause, resume, and stop controls with next chime time shown
- Preloaded ding sound (`public/ding.wav`) so the first chime plays without delay
- Modern glassmorphic UI with responsive layout

## Prerequisites
- Node.js 18+ (LTS recommended)
- npm (ships with Node)

## Quick start
```bash
npm install
npm run dev
```
The dev server prints a local URL (default `http://localhost:5173`). Open it in your browser and press **Start timer** to allow audio playback.

## Available scripts
- `npm run dev` – start the Vite dev server
- `npm run build` – type-check then build for production
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint across the project

## Usage
1) Adjust the interval with the number input or quick preset buttons.  
2) Click **Start timer**; the app schedules recurring chimes.  
3) Use **Pause** / **Resume** to hold and continue the cycle without resetting it.  
4) **Stop** clears the schedule and progress bar.  
Keep the tab open and your speakers on; some browsers require one click before playing audio.

## Customization
- Swap the chime by replacing `public/ding.wav` with another audio file of the same name.
- Tweak presets or defaults in `src/App.tsx` (`quickPresets` array and `intervalMinutes` state).
- Styling lives in `src/App.tsx` with Tailwind utility classes; global config is in `tailwind.config.js`.

## Project structure
- `src/App.tsx` – main UI, timer logic, and controls
- `public/` – static assets (favicons, `ding.wav`, manifest)
- `vite.config.ts`, `tailwind.config.js` – build and styling configuration
