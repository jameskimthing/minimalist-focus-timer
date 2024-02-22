/** To show the latest "time" for some time. ex: show 1:00 for 0.990 seconds before continuing */
const TIMER_PADDING = 990;

// NOTE: Colors also present at /styles/styles.css
// When updating these, update there too
// TODO: integrate this to SETTINGS, and add to settingsPage.js too
//   reason: for future feature of having customizable colors
const COLORS = {
  background: "#2E4057",
  gray: "#D8D4F2",
  sessions: {
    work: "#0197F6",
    break: "#70B77E",
    longBreak: "#EB5E28",
  },
};

const ANGLE_DIFF_GENERATE_ICON = 5;

const SETTINGS = {
  workSessionLength: 25 * 60 * 1000 + TIMER_PADDING,
  breakSessionLength: 5 * 60 * 1000 + TIMER_PADDING,
  longBreakSessionLength: 15 * 60 * 1000 + TIMER_PADDING,
  sessionRounds: 4,
};

const STATE = {
  isPaused: true,
  startTime: 0,
  pauseStartTime: 0,
  totalPausedTime: 0,
  currentPausedTime: 0,
  sessionType: "WORK", // 'WORK', 'BREAK', 'LONG_BREAK',
  sessionLength: 0,
  currentSessionRound: 1,
  isFinished: false,
  dontShowNextPopup: false,

  // ExtensionIcon
  currentExtensionIcon: "DEFAULT", // 'DEFAULT', 'PIE'

  softReset: function () {
    this.startTime = Date.now();
    this.pauseStartTime = Date.now();
    this.totalPausedTime = 0;
    this.currentPausedTime = 0;
    this.isFinished = false;
  },

  hardReset: function () {
    this.softReset();
    this.isPaused = true;
    this.sessionType = "WORK";
    this.sessionLength = SETTINGS.workSessionLength;
    this.currentSessionRound = 1;
    this.isFinished = false;
  },
};
