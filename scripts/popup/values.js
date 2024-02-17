/** To show the latest "time" for some time. ex: show `1:00` for `0.990` seconds before continuing.
 * If not, it would instantly switch to `0:59` the moment it starts.
 */
const TIMER_PADDING = 990;

const STATE = {};
const SETTINGS = {};

// SVG Images
const SVG_ICONS = {
  pause: `<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.75 2.75h3.5v10.5h-3.5zm7 0h3.5v10.5h-3.5z"/></svg>`,
  play: `<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.75 2.75v10.5L12.25 8z"/></svg>`,
  reset: `<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.25 5.25h3m0 3.5c0 2.5-2.798 5.5-6.25 5.5a6.25 6.25 0 1 1 0-12.5c3.75 0 6.25 3.5 6.25 3.5v-3.5"/></svg>`,
  hardReset: `<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4m-5-3a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/></svg>`,
  settings: `<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><circle cx="8" cy="8" r="1.75"/><path d="m6.75 1.75l-.5 1.5l-1.5 1l-2-.5l-1 2l1.5 1.5v1.5l-1.5 1.5l1 2l2-.5l1.5 1l.5 1.5h2.5l.5-1.5l1.5-1l2 .5l1-2l-1.5-1.5v-1.5l1.5-1.5l-1-2l-2 .5l-1.5-1l-.5-1.5z"/></g></svg>`,
};
