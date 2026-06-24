/** To show the latest "time" for some time. ex: show 1:00 for 0.990 seconds before continuing */
const TIMER_PADDING = 990;
const ANGLE_DIFF_GENERATE_ICON = 5;

/** @type {"firefox" | "chrome" | "unknown"} */
let BROWSER = "unknown";
if (typeof browser !== "undefined" && typeof browser.runtime !== "undefined") {
  BROWSER = "firefox";
} else if (
  typeof chrome !== "undefined" &&
  typeof chrome.runtime !== "undefined"
) {
  BROWSER = "chrome";
}

// Added: mapping session ids - just an idea ;)
const sessionsToLocalStorage = {
  "rangeWorkLength": "focus-value",
  "rangeBreakLength": "break-value",
  "rangeLongBreakLength": "long-break-value",
  "rangeRounds": "rounds-value"
}

// Updated: Loading session lengths and rounds from localstorage, otherwise use default
const SETTINGS = {
  sessionRounds: localStorage.getItem("rounds-value") || 4,
  sessionInputRangeStep: 1,
  sessionAutoPauseAfterWork: true,
  sessionAutoPauseAfterBreak: true,
  sessionLength: {
    WORK: (localStorage.getItem("focus-value") || 25) * 60 * 1000 + TIMER_PADDING,
    BREAK: (localStorage.getItem("break-value") || 5) * 60 * 1000 + TIMER_PADDING,
    LONG_BREAK: (localStorage.getItem("long-break-value") || 15) * 60 * 1000 + TIMER_PADDING,
  },
  colors: {
    background: "#2E4057",
    gray: "#D8D4F2",

    WORK: "#0197F6",
    BREAK: "#70B77E",
    LONG_BREAK: "#EB5E28",
  },

  soundOnNotification: true,
};

const STATE = {
  isPaused: true,
  startTime: 0,
  pauseStartTime: null,
  storedPausedDuration: 0,
  shortPausedDuration: 0,
  totalPausedDuration: 0,
  sessionType: "WORK", // 'WORK', 'BREAK', 'LONG_BREAK',
  sessionRound: 1,
  isFinished: false,

  get sessionLength() {
    return SETTINGS.sessionLength[this.sessionType];
  },
  get color() {
    return SETTINGS.colors[this.sessionType];
  },
  set sessionLength(_) { },
  set color(_) { },

  softReset: function() {
    this.startTime = Date.now();
    this.totalPausedDuration = 0;
    this.storedPausedDuration = 0;
    this.shortPausedDuration = 0;
    this.isFinished = false;
    this.isPaused
      ? (this.pauseStartTime = null)
      : (this.pauseStartTime = Date.now());
  },

  hardReset: function() {
    this.softReset();
    this.isPaused = true;
    this.sessionType = "WORK";
    this.sessionRound = 1;
    this.isFinished = false;
  },
};

