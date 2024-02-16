/** To show the latest "time" for some time. ex: show 1:00 for 0.990 seconds before continuing */
const TIMER_PADDING = 990;

const COLORS = {
  background: "#2E4057",
  gray: "#D8D4F2",
  sessions: {
    work: "#0197F6",
    break: "#70B77E",
    longBreak: "#EB5E28",
  },
};

const SETTINGS = {
  workSessionLength: 0.1 * 60 * 1000 + TIMER_PADDING,
  breakSessionLength: 0.08 * 60 * 1000 + TIMER_PADDING,
  longBreakSessionLength: 0.2 * 60 * 1000 + TIMER_PADDING,
  sessionRounds: 3,
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
    this.isFinished = true;
  },
};
