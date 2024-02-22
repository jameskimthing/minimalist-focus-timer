// ---------------------------------------------------------------------------------------------------------------------------------
// ADJUSTING UI TO MATCH STATE -----------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
let lastAdjustRatio;
const circle = document.getElementById("partialCircle");
function adjustCircleArc(ratio) {
  if (ratio === lastAdjustRatio) return;
  lastAdjustRatio = ratio;

  if (ratio === 0) circle.style.stroke = "transparent";
  else circle.style.stroke = "var(--color-current-session)";
  const circumference = 2 * Math.PI * circle.r.baseVal.value;
  const strokeDasharray = circumference * ratio;
  circle.style.strokeDasharray = `${strokeDasharray} ${circumference}`;
  circle.style.transform = `rotate(${-90 - 360 * ratio}deg)`;
}

let lastCurrentSessionTypeColor;
function adjustCurrentSessionColor(sessionType) {
  if (lastCurrentSessionTypeColor === sessionType) return;
  lastCurrentSessionTypeColor = sessionType;

  switch (sessionType) {
    case "WORK":
      document.documentElement.style.setProperty(
        "--color-current-session",
        "var(--color-session-work)"
      );
      break;
    case "BREAK":
      document.documentElement.style.setProperty(
        "--color-current-session",
        "var(--color-session-break)"
      );
      break;
    case "LONG_BREAK":
      document.documentElement.style.setProperty(
        "--color-current-session",
        "var(--color-session-long-break)"
      );
      break;
  }
}

const sessionTypeElement = document.getElementById("sessionLabel");
function adjustTimerSessionType(sessionType) {
  let sessionTypeText = "";
  switch (sessionType) {
    case "WORK":
      sessionTypeText = "Focus Time";
      break;
    case "BREAK":
      sessionTypeText = "Short Break";
      break;
    case "LONG_BREAK":
      sessionTypeText = "Long Break";
      break;
  }

  sessionTypeElement.innerText = sessionTypeText;
}

let lastAdjustTime;
const timerElement = document.getElementById("sessionTimeLeft");
function adjustTimerTimeLeft(time) {
  time = Math.max(time, 0);

  if (lastAdjustTime === time) return;
  lastAdjustTime = time;

  // timerElement.style.color = getCurrentSessionColor();
  timerElement.innerText = durationToString(time, { isVerbose: false });
}

let lastAdjustPaused;
const timerPlayPauseImage = document.getElementById("timerPlayPauseButton");
function adjustPlayPauseButton(paused) {
  if (lastAdjustPaused === paused) return;
  lastAdjustPaused = paused;

  if (paused) timerPlayPauseImage.setAttribute("icon-name", "play");
  else timerPlayPauseImage.setAttribute("icon-name", "pause");
}

let lastAdjustSessionRound;
let lastAdjustMaxSessionRound;
const sessionRound = document.getElementById("sessionCurrentRound");
function adjustSessionRound(currentSessionRound, maxSessionRounds) {
  if (
    lastAdjustSessionRound === currentSessionRound &&
    lastAdjustMaxSessionRound === maxSessionRounds
  ) {
    return;
  }
  lastAdjustSessionRound = currentSessionRound;
  lastAdjustMaxSessionRound = maxSessionRounds;

  sessionRound.innerText = `${currentSessionRound} / ${maxSessionRounds}`;
}
