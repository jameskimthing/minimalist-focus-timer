<h1 align="center">Minimalist Focus Timer</h1>

<p align="center">A Clean and Concise Timer for Productivity</p>

![Pomodoro Timer](/assets/readme/focus_extension.png)

<p align="center">You can get at the <a href="https://chromewebstore.google.com/detail/pomodoro-focus-timer/eglbnllngiannimbjimkpjklnjgelnoi" target="_blank">chrome web store</a> or the <a target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/minimalist-focus-timer/">firefox add-on store</a></p>

## Features

- A timer based on the pomodoro technique that runs in the background:
  - Pushes a notification with a simple sound when it is time to take a break or continue working
  - Dynamic extension icon that adjusts as a "pie icon" relative to the current progress of the session
  - Changes the color of the extension icon and popup based on the current session type (focusing / break / long break)
- A settings page that allows you to edit each session length, and the session rounds
- A pause / play button
- A hard reset button (start from session 1)
- A soft reset button (redo current round)
- A "skip timer" button (move to next session)
- Tooltip on buttons that explains what they do
- Toggle the push notification sound

## Features to Come

- Customizable colors
- A "raining sound" in the background (toggleable)
- Firefox

## Development

- 0 Dependencies!
- ES6 Javascript, HTML5, CSS3
- Copy && Paste `manifest_chrome.json` or `manifest_firefox.json` to `manifest.json` whenever necessary. This is the only manual step needed for development, and thus I thought a build step would be unnecessarily complex for such a simple task.

## Credits

- [Icones](https://github.com/antfu/icones) for providing the all the icons used within the project, under the [MIT](https://opensource.org/license/mit/) license
- Notification sound [Simple Chiptune Jingle 1](https://freesound.org/people/AndreWharn/sounds/501207/) by [AndreWharn](https://freesound.org/people/AndreWharn/) under the [CC BY 4.0 DEED](https://creativecommons.org/licenses/by/4.0/) license, acquired at February 14, 2024
