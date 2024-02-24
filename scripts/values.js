/** To show the latest "time" for some time. ex: show 1:00 for 0.990 seconds before continuing */
const TIMER_PADDING = 990;
const ANGLE_DIFF_GENERATE_ICON = 5;

const SETTINGS = {
  sessionRounds: 4,
  sessionInputRangeStep: 1,
  sessionLength: {
    WORK: 25 * 60 * 1000 + TIMER_PADDING,
    BREAK: 5 * 60 * 1000 + TIMER_PADDING,
    LONG_BREAK: 15 * 60 * 1000 + TIMER_PADDING,
  },
  colors: {
    background: "#2E4057",
    gray: "#D8D4F2",

    WORK: "#0197F6",
    BREAK: "#70B77E",
    LONG_BREAK: "#EB5E28",
  },
};

const STATE = {
  isPaused: true,
  startTime: 0,
  pauseStartTime: 0,
  totalPausedTime: 0,
  currentPausedTime: 0, // used within background/index.js
  sessionType: "WORK", // 'WORK', 'BREAK', 'LONG_BREAK',
  sessionRound: 1,
  isFinished: false,
  dontShowNextPopup: false,

  get sessionLength() {
    return SETTINGS.sessionLength[this.sessionType];
  },
  get color() {
    return SETTINGS.colors[this.sessionType];
  },
  set sessionLength(_) {},
  set color(_) {},

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
    this.sessionRound = 1;
    this.isFinished = false;
  },
};
