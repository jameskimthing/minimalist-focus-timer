/** To show the latest "time" for some time. ex: show `1:00` for `0.990` seconds before continuing.
 * If not, it would instantly switch to `0:59` the moment it starts.
 */
const TIMER_PADDING = 990;

/**
 * Contains the state for the timer. This is closer to a "dummy", in that whenever
 * something changes (ex: whenever the "pause" button is clicked, a message is sent
 * to the background to update the state. Then, the popup requests the value of "state"
 * which updates the "dummy" one here)
 */
const STATE = {};

/**
 * Just like `STATE`, it is closer to a "dummy" in the sense that it gets all its values
 * from the background,
 */
const SETTINGS = {};
